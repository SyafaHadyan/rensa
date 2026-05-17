import type {
  NewNotification,
  Notification,
  NotificationType,
  UserProfileDto,
} from "@rensa/db/schema";

export type CreateNotificationInput = Pick<
  NewNotification,
  "recipient_id" | "actor_id" | "photo_id" | "type"
>;

export type NotificationRecord = Notification;

export type NotificationResponse = Omit<Notification, "actor_id"> & {
  actor_id: UserProfileDto | null;
};

export const notificationTypes: NotificationType[] = [
  "photo-saved",
  "photo-bookmarked",
  "photo-commented",
];

export function isNotificationType(value: string): value is NotificationType {
  return notificationTypes.includes(value as NotificationType);
}
