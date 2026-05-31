import { z } from "zod";

export const uuidDto = z.uuid();

// Backward-compatible alias for existing imports in route handlers.
export const objectIdDto = uuidDto;

export const paginationQueryDto = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(10),
	cursor: z.string().min(1).optional(),
});
