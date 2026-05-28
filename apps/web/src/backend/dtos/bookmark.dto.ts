import { z } from "zod";

export const bookmarkResponseDto = z.object({
	bookmarkId: z.string(),
	userId: z.string(),
	photoId: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const createBookmarkDto = bookmarkResponseDto.omit({
	bookmarkId: true,
	createdAt: true,
	updatedAt: true,
});
export const updateBookmarkDto = bookmarkResponseDto.partial().omit({
	bookmarkId: true,
	userId: true,
	photoId: true,
	createdAt: true,
	updatedAt: true,
});

export const bookmarkStatusDto = z.object({
	bookmarkCount: z.number().int().min(0),
	isBookmarked: z.boolean(),
});

export type BookmarkResponseDto = z.infer<typeof bookmarkResponseDto>;
export type CreateBookmarkDto = z.infer<typeof createBookmarkDto>;
export type UpdateBookmarkDto = z.infer<typeof updateBookmarkDto>;
export type BookmarkStatusDto = z.infer<typeof bookmarkStatusDto>;
