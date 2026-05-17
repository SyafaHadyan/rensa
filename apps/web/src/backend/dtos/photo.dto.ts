import { z } from "zod";
import { paginationQueryDto, uuidDto } from "./common.dto";

const populatedPhotoUserDto = z
  .object({
    user_id: uuidDto,
    username: z.string().optional(),
    avatar: z.string().optional(),
  })
  .passthrough();

export const photoResponseDto = z
  .object({
    photo_id: uuidDto,
    user_id: z.union([uuidDto, populatedPhotoUserDto]),
    url: z.string().url(),
    title: z.string(),
    description: z.string().default(""),
    category: z.string().default(""),
    style: z.string().default(""),
    color: z.string().default(""),
    camera: z.string().default(""),
    bookmarks: z.number().int().min(0).default(0),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const createPhotoDto = z.object({
  user_id: uuidDto,
  url: z.string().url(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  style: z.string().optional(),
  color: z.string().optional(),
  camera: z.string().optional(),
});

export const updatePhotoDto = createPhotoDto
  .omit({
    user_id: true,
    url: true,
  })
  .partial();

export const photoIdParamDto = z.object({
  id: uuidDto,
});

export const listPhotosQueryDto = paginationQueryDto.extend({
  sort: z.enum(["recent", "popular"]).default("recent"),
  filters: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .optional(),
});

export const photoBookmarkQueryDto = paginationQueryDto
  .extend({
    user_id: uuidDto.optional(),
    userId: uuidDto.optional(),
  })
  .refine((value) => value.user_id, {
    message: "user_id is required",
  })
  .transform((value) => ({
    limit: value.limit,
    page: value.page,
    user_id: value.user_id as string,
  }));

export type PhotoResponseDto = z.infer<typeof photoResponseDto>;
export type CreatePhotoDto = z.infer<typeof createPhotoDto>;
export type UpdatePhotoDto = z.infer<typeof updatePhotoDto>;
export type ListPhotosQueryDto = z.infer<typeof listPhotosQueryDto>;
