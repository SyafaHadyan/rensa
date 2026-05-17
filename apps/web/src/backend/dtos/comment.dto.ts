import { z } from "zod";

const commentUserDto = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  avatar_url: z.string().optional(),
});

export const commentResponseDto = z.object({
  comment_id: z.string().min(1),
  photo_id: z.string().min(1),
  user_id: z.union([z.string().min(1), commentUserDto]),
  text: z.string().min(1).max(500),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

export const commentPhotoParamsDto = z.object({
  id: z.string().min(1),
});

export const createCommentDto = z
  .object({
    text: z.string().trim().min(1).max(500),
    user_id: z.string().min(1).optional(),
    userId: z.string().min(1).optional(),
  })
  .transform((value) => ({
    text: value.text,
    user_id: value.user_id,
  }));

export const listCommentsQueryDto = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export type CommentResponseDto = z.infer<typeof commentResponseDto>;
export type CreateCommentDto = z.infer<typeof createCommentDto>;
export type ListCommentsQueryDto = z.infer<typeof listCommentsQueryDto>;
