import {
	boolean,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const notificationTypeEnum = pgEnum("notification_type", [
	"photo-saved",
	"photo-bookmarked",
	"photo-commented",
]);

export const notifications = pgTable(
	"notifications",
	{
		notificationId: uuid("notification_id").primaryKey().defaultRandom(),
		recipientId: text("recipient_id").notNull(),
		actorId: text("actor_id").notNull(),
		type: notificationTypeEnum("type").notNull(),
		photoId: text("photo_id").notNull(),
		read: boolean("read").notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => ({
		recipientCreatedAtIdx: index("notifications_recipient_created_at_idx").on(
			table.recipientId,
			table.createdAt
		),
		createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
	})
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

interface Passthrough {
	[key: string]: unknown;
}

export interface NotificationActorDto extends Passthrough {
	avatarUrl?: string;
	userId: string;
	username: string;
}

export interface NotificationResponseDto extends Passthrough {
	actor: NotificationActorDto;
	createdAt?: Date | string;
	message: string;
	notificationId: string;
	photoId: string;
	read: boolean;
	recipientId: string;
	type: string;
	updatedAt?: Date | string;
}

export interface ListNotificationsQueryDto {
	limit: number;
	page: number;
	recipientId: string;
}

export interface CreateNotificationDto {
	actorId: string;
	photoId: string;
	recipientId: string;
	type: string;
}

export interface NotificationRepositoryInterface {
	clearByUserId(userId: string): Promise<void>;
	create(payload: CreateNotificationDto): Promise<unknown>;
	list(query: ListNotificationsQueryDto): Promise<NotificationResponseDto[]>;
	markAsRead(notificationId: string): Promise<void>;
}
