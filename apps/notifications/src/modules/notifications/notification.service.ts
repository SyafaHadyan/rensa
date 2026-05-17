import { getRedis, redisConnected } from "@rensa/cache";
import { NotificationDbRepository } from "@rensa/db/queries/notification.repository";
import { UserRepository } from "@rensa/db/queries/user.repository";
import { env } from "../../config/env";
import { WebSocketService } from "../websocket/websocket.service";
import {
  isNotificationType,
  type NotificationRecord,
  type NotificationResponse,
} from "./notification.model";

const notificationRepository = new NotificationDbRepository();
const userRepository = new UserRepository();
const redis = getRedis({
  defaultUrl: "redis://localhost:6379",
  globalKey: "notifications",
  logLifecycle: true,
  url: env.redisUrl,
});

const isRedisConnected = () =>
  redisConnected({
    defaultUrl: "redis://localhost:6379",
    globalKey: "notifications",
    url: env.redisUrl,
  });

class NotificationServiceError extends Error {
  success = false;

  constructor(message: string) {
    super(message);
    this.name = "NotificationServiceError";
  }
}

function getNotificationKey(notification: NotificationRecord) {
  return `notifications:${notification.recipient_id}:${notification.actor_id}:${notification.photo_id}:${notification.type}`;
}

async function checkNotificationKey(notificationKey: string) {
  if (!isRedisConnected()) {
    console.warn("Redis not connected, skipping duplicate check");
    return false;
  }

  const exists = await redis.get(notificationKey);
  return exists !== null;
}

async function setNotificationKey(notificationKey: string) {
  if (!isRedisConnected()) {
    console.warn("Redis not connected, skipping key set");
    return false;
  }

  await redis.set(notificationKey, "1", "EX", 60);
  return true;
}

async function populateNotificationActor(
  notification: NotificationRecord,
): Promise<NotificationResponse> {
  const actor = await userRepository.getProfileById(notification.actor_id);

  return {
    ...notification,
    actor_id: actor,
  };
}

export const NotificationService = {
  async fetchNotifications(query: {
    recipient_id: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      notificationRepository.findByRecipient({
        recipient_id: query.recipient_id,
        limit,
        offset,
      }),
      notificationRepository.countByRecipient(query.recipient_id),
    ]);

    const populatedNotifications = await Promise.all(
      notifications.map((notification) =>
        populateNotificationActor(notification),
      ),
    );

    return {
      success: true,
      status: 200,
      message: "Notifications fetched",
      data: {
        notifications: populatedNotifications,
        page,
        total,
        hasMore: page * limit < total,
      },
    };
  },

  async clearNotifications(userId: string) {
    if (!userId) {
      return {
        success: false,
        status: 400,
        message: "userId is required",
      };
    }

    const deletedCount = await notificationRepository.deleteByRecipient(userId);

    return {
      success: true,
      status: 200,
      message: "Notifications cleared",
      data: { deletedCount },
    };
  },

  async notify(params: {
    actor_id: string;
    recipient_id: string;
    photo_id: string;
    type: string;
  }) {
    const { actor_id, recipient_id, photo_id, type } = params;

    if (actor_id === recipient_id) {
      throw new NotificationServiceError("Cannot notify yourself");
    }

    if (!(actor_id && recipient_id && photo_id)) {
      throw new NotificationServiceError("Missing required fields");
    }

    if (!isNotificationType(type)) {
      throw new NotificationServiceError("Invalid notification type");
    }

    const notification = await notificationRepository.create({
      actor_id,
      recipient_id,
      photo_id,
      type,
    });

    const key = getNotificationKey(notification);
    const isDuplicate = await checkNotificationKey(key);

    if (!isDuplicate) {
      await setNotificationKey(key);
      const populatedNotification =
        await populateNotificationActor(notification);
      WebSocketService.sendNotification(populatedNotification);
    }

    return {
      success: true,
      message: `Notification created (${type})`,
      data: { notification },
    };
  },

  async markNotificationAsRead(notificationId: string) {
    const notification =
      await notificationRepository.markAsRead(notificationId);

    if (!notification) {
      return {
        success: false,
        status: 404,
        message: "Notification not found",
      };
    }

    return {
      success: true,
      status: 200,
      message: "Notification marked as read",
      data: { notification },
    };
  },
};
