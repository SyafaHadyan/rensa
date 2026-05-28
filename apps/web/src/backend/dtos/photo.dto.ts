import { z } from "zod";
import { paginationQueryDto, uuidDto } from "./common.dto";

const populatedPhotoUserDto = z
	.object({
		userId: uuidDto,
		username: z.string().optional(),
		avatarUrl: z.string().optional(),
	})
	.passthrough();

export const photoResponseDto = z
	.object({
		photoId: uuidDto,
		userId: z.union([uuidDto, populatedPhotoUserDto]),
		url: z.string().url(),
		title: z.string(),
		description: z.string().default(""),
		category: z.string().default(""),
		style: z.string().default(""),
		color: z.string().default(""),
		camera: z.string().default(""),
		bookmarks: z.number().int().min(0).default(0),
		createdAt: z.string().optional(),
		updatedAt: z.string().optional(),
	})
	.passthrough();

export const createPhotoDto = z.object({
	userId: uuidDto,
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
		userId: true,
		url: true,
	})
	.partial();

export const photoIdParamDto = z.object({
	id: uuidDto,
});

export const listPhotosQueryDto = paginationQueryDto.extend({
	sort: z.enum(["recent", "popular", "oldest"]).default("recent"),
	userId: uuidDto.optional(),
	filters: z
		.string()
		.transform((value) =>
			value
				.split(",")
				.map((item) => item.trim())
				.filter(Boolean)
		)
		.optional(),
});

export const photoBookmarkQueryDto = paginationQueryDto
	.extend({
		userId: uuidDto.optional(),
	})
	.refine((value) => value.userId, {
		message: "userId is required",
	})
	.transform((value) => ({
		limit: value.limit,
		page: value.page,
		userId: value.userId as string,
	}));

export type PhotoResponseDto = z.infer<typeof photoResponseDto>;
export type CreatePhotoDto = z.infer<typeof createPhotoDto>;
export type UpdatePhotoDto = z.infer<typeof updatePhotoDto>;
export type ListPhotosQueryDto = z.infer<typeof listPhotosQueryDto>;
