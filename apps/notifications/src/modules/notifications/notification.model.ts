import type {
	NewNotification,
	Notification,
	NotificationType,
	UserProfileDto,
} from "@rensa/db/schema";

export type CreateNotificationInput = Pick<
	NewNotification,
	"recipientId" | "actorId" | "photoId" | "type"
>;

export type NotificationRecord = Notification;

export type NotificationResponse = Omit<Notification, "actorId"> & {
	actor: UserProfileDto;
};

export const notificationTypes: NotificationType[] = [
	"photo-saved",
	"photo-bookmarked",
	"photo-commented",
];

export function isNotificationType(value: string): value is NotificationType {
	return notificationTypes.includes(value as NotificationType);
}
