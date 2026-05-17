import { z } from "zod";
import { paginationQueryDto, uuidDto } from "./common.dto";

export const rollResponseDto = z
  .object({
    roll_id: uuidDto,
    user_id: uuidDto,
    name: z.string(),
    description: z.string().default(""),
    image_url: z.string().default("/images/image6.JPG"),
    photos: z.array(uuidDto).default([]),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const rollCreateDto = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    image_url: z.string().optional(),
    user_id: uuidDto,
  })
  .transform((value) => ({
    name: value.name,
    description: value.description,
    image_url: value.image_url,
    user_id: value.user_id,
  }));

export const rollUpdateDto = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    image_url: z.string().optional(),
    imageUrl: z.string().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.image_url !== undefined || {
        message: "At least one roll field must be provided",
      },
  )
  .transform((value) => ({
    name: value.name,
    description: value.description,
    image_url: value.image_url,
  }));

export const rollIdParamDto = z
  .object({
    roll_id: uuidDto.optional(),
  })
  .refine((value) => value.roll_id, {
    message: "roll_id is required",
  })
  .transform((value) => ({
    roll_id: value.roll_id as string,
  }));

export const photoIdParamDto = z
  .object({
    photo_id: uuidDto.optional(),
  })
  .refine((value) => value.photo_id, {
    message: "photo_id is required",
  })
  .transform((value) => ({
    photo_id: value.photo_id as string,
  }));

export const listRollsQueryDto = z
  .object({
    user_id: uuidDto.optional(),
    userId: uuidDto.optional(),
    sort: z.enum(["latest", "oldest"]).default("latest"),
  })
  .refine((value) => value.user_id, {
    message: "user_id is required",
  })
  .transform((value) => ({
    sort: value.sort,
    user_id: value.user_id as string,
  }));

export const listRollPhotosQueryDto = paginationQueryDto;

export const isSavedQueryDto = z
  .object({
    photo_id: uuidDto.optional(),
  })
  .refine((value) => value.photo_id, {
    message: "photo_id is required",
  })
  .transform((value) => ({
    photo_id: value.photo_id as string,
  }));

export type RollCreateDto = z.infer<typeof rollCreateDto>;
export type RollUpdateDto = z.infer<typeof rollUpdateDto>;
export type RollResponseDto = z.infer<typeof rollResponseDto>;
export type ListRollPhotosQueryDto = z.infer<typeof listRollPhotosQueryDto>;
