import { z } from "zod";
import { paginationQueryDto, uuidDto } from "./common.dto";

export const rollResponseDto = z
	.object({
		rollId: uuidDto,
		userId: uuidDto,
		name: z.string(),
		description: z.string().default(""),
		imageUrl: z.string().default("/images/image6.JPG"),
		photos: z.array(uuidDto).default([]),
		createdAt: z.string().optional(),
		updatedAt: z.string().optional(),
	})
	.passthrough();

export const rollCreateDto = z
	.object({
		name: z.string().min(1),
		description: z.string().optional(),
		imageUrl: z.string().optional(),
	})
	.transform((value) => ({
		name: value.name,
		description: value.description,
		imageUrl: value.imageUrl,
	}));

export const rollUpdateDto = z
	.object({
		name: z.string().min(1).optional(),
		description: z.string().optional(),
		imageUrl: z.string().optional(),
	})
	.refine(
		(value) =>
			value.name !== undefined ||
			value.description !== undefined ||
			value.imageUrl !== undefined || {
				message: "At least one roll field must be provided",
			}
	)
	.transform((value) => ({
		name: value.name,
		description: value.description,
		imageUrl: value.imageUrl,
	}));

export const rollIdParamDto = z
	.object({
		rollId: uuidDto.optional(),
	})
	.refine((value) => value.rollId, {
		message: "rollId is required",
	})
	.transform((value) => ({
		rollId: value.rollId as string,
	}));

export const photoIdParamDto = z
	.object({
		photoId: uuidDto.optional(),
	})
	.refine((value) => value.photoId, {
		message: "photoId is required",
	})
	.transform((value) => ({
		photoId: value.photoId as string,
	}));

export const listRollsQueryDto = z
	.object({
		userId: uuidDto.optional(),
		sort: z.enum(["latest", "oldest"]).default("latest"),
	})
	.refine((value) => value.userId, {
		message: "userId is required",
	})
	.transform((value) => ({
		sort: value.sort,
		userId: value.userId as string,
	}));

export const listRollPhotosQueryDto = paginationQueryDto;

export const isSavedQueryDto = z
	.object({
		photoId: uuidDto.optional(),
	})
	.refine((value) => value.photoId, {
		message: "photoId is required",
	})
	.transform((value) => ({
		photoId: value.photoId as string,
	}));

export type RollCreateDto = z.infer<typeof rollCreateDto>;
export type RollUpdateDto = z.infer<typeof rollUpdateDto>;
export type RollResponseDto = z.infer<typeof rollResponseDto>;
export type ListRollPhotosQueryDto = z.infer<typeof listRollPhotosQueryDto>;
