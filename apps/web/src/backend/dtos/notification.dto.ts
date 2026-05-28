import { z } from "zod";
import { paginationQueryDto } from "./common.dto";

const notificationActorDto = z.object({
	userId: z.string().min(1),
	username: z.string().min(1),
	avatarUrl: z.string().optional(),
});

export const notificationResponseDto = z.object({
	notificationId: z.string().min(1),
	recipientId: z.string().min(1),
	actor: notificationActorDto,
	photoId: z.string().min(1),
	type: z.string().min(1),
	read: z.boolean(),
	message: z.string(),
	createdAt: z.union([z.string(), z.date()]).optional(),
	updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const listNotificationsQueryDto = paginationQueryDto
	.extend({
		recipientId: z.string().min(1).optional(),
	})
	.refine((value) => value.recipientId, {
		message: "recipientId is required",
	})
	.transform((value) => ({
		limit: value.limit,
		page: value.page,
		recipientId: value.recipientId as string,
	}));

export const createNotificationDto = z
	.object({
		actorId: z.string().min(1).optional(),
		recipientId: z.string().min(1).optional(),
		photoId: z.string().min(1).optional(),
		type: z.string().min(1),
	})
	.refine((value) => value.actorId, {
		message: "actorId is required",
	})
	.refine((value) => value.recipientId, {
		message: "recipientId is required",
	})
	.refine((value) => value.photoId, {
		message: "photoId is required",
	})
	.transform((value) => ({
		actorId: value.actorId as string,
		recipientId: value.recipientId as string,
		photoId: value.photoId as string,
		type: value.type,
	}));

export const notificationIdParamDto = z.object({
	id: z.string().min(1),
});

export type NotificationResponseDto = z.infer<typeof notificationResponseDto>;
export type ListNotificationsQueryDto = z.infer<
	typeof listNotificationsQueryDto
>;
export type CreateNotificationDto = z.infer<typeof createNotificationDto>;
