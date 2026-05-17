import { z } from "zod";

const commentUserDto = z.object({
	userId: z.string().min(1),
	username: z.string().min(1),
	avatarUrl: z.string().optional(),
});

export const commentResponseDto = z.object({
	commentId: z.string().min(1),
	photoId: z.string().min(1),
	user: commentUserDto,
	text: z.string().min(1).max(500),
	createdAt: z.union([z.string(), z.date()]).optional(),
	updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const commentPhotoParamsDto = z.object({
	id: z.string().min(1),
});

export const createCommentDto = z
	.object({
		text: z.string().trim().min(1).max(500),
	})
	.transform((value) => ({
		text: value.text,
	}));

export const listCommentsQueryDto = z.object({
	offset: z.coerce.number().int().min(0).default(0),
	limit: z.coerce.number().int().min(1).max(50).default(5),
});

export type CommentResponseDto = z.infer<typeof commentResponseDto>;
export type CreateCommentDto = z.infer<typeof createCommentDto>;
export type ListCommentsQueryDto = z.infer<typeof listCommentsQueryDto>;
