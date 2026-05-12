import type {
  CreateNotificationDto,
  ListNotificationsQueryDto,
  NewNotification,
  Notification,
  NotificationRepositoryInterface,
  NotificationResponseDto,
} from "../schemas/notifications";

import { notifications } from "../schemas/notifications";
import db, { count, desc, eq } from "../src/db";

interface NotificationsApiResponse {
  data?: {
    notifications?: NotificationResponseDto[];
  };
}

interface NotificationApiClient {
  delete(url: string): Promise<unknown>;
  get<T>(url: string, config?: { params?: unknown }): Promise<{ data: T }>;
  post<T = unknown>(url: string, data?: unknown): Promise<{ data: T }>;
  put(url: string): Promise<unknown>;
}

export class NotificationRepository implements NotificationRepositoryInterface {
  private readonly api: NotificationApiClient;

  constructor(api: NotificationApiClient) {
    this.api = api;
  }

  async list(
    query: ListNotificationsQueryDto,
  ): Promise<NotificationResponseDto[]> {
    try {
      const response = await this.api.get<NotificationsApiResponse>(
        "/notifications",
        { params: query },
      );
      return response.data.data?.notifications ?? [];
    } catch (error) {
      throw this.mapAxiosError(error, "Failed to fetch notifications");
    }
  }

  async create(payload: CreateNotificationDto): Promise<unknown> {
    try {
      const response = await this.api.post("/notifications", payload);
      return response.data;
    } catch (error) {
      throw this.mapAxiosError(error, "Failed to create notification");
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw this.mapAxiosError(error, "Failed to mark notification as read");
    }
  }

  async clearByUserId(userId: string): Promise<void> {
    try {
      await this.api.delete(`/notifications/${userId}`);
    } catch (error) {
      throw this.mapAxiosError(error, "Failed to clear notifications");
    }
  }

  private mapAxiosError(error: unknown, fallbackMessage: string): Error {
    if (typeof error === "object" && error !== null) {
      const maybeError = error as {
        message?: unknown;
        response?: { data?: { message?: unknown } };
      };
      const responseMessage =
        typeof maybeError.response?.data?.message === "string"
          ? maybeError.response.data.message
          : null;
      const errorMessage =
        typeof maybeError.message === "string" ? maybeError.message : null;
      return new Error(responseMessage ?? errorMessage ?? fallbackMessage);
    }
    return new Error(fallbackMessage);
  }
}

type CreateNotificationInput = Pick<
  NewNotification,
  "actorId" | "photoId" | "recipientId" | "type"
>;

export class NotificationDbRepository {
  async findByRecipient(params: {
    limit: number;
    offset: number;
    recipientId: string;
  }): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, params.recipientId))
      .orderBy(desc(notifications.createdAt))
      .limit(params.limit)
      .offset(params.offset);
  }

  async countByRecipient(recipientId: string): Promise<number> {
    const [result] = await db
      .select({ total: count() })
      .from(notifications)
      .where(eq(notifications.recipientId, recipientId));

    return result?.total ?? 0;
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(input)
      .returning();

    if (!notification) {
      throw new Error("Failed to create notification");
    }

    return notification;
  }

  async deleteByRecipient(recipientId: string): Promise<number> {
    const deleted = await db
      .delete(notifications)
      .where(eq(notifications.recipientId, recipientId))
      .returning({ id: notifications.id });

    return deleted.length;
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const [notification] = await db
      .update(notifications)
      .set({ read: true, updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();

    return notification ?? null;
  }
}
