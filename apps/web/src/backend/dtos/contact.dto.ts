import { z } from "zod";
import { paginationQueryDto } from "./common.dto";

export const contactStatusDto = z.enum(["new", "read", "responded"]);

export const contactResponseDto = z
	.object({
		contactId: z.string().min(1),
		name: z.string().min(1),
		email: z.email(),
		subject: z.string().min(1),
		message: z.string().min(1),
		ipAddress: z.string().min(1),
		userAgent: z.string().optional(),
		status: contactStatusDto,
		respondedAt: z.union([z.string(), z.date()]).optional(),
		createdAt: z.union([z.string(), z.date()]).optional(),
		updatedAt: z.union([z.string(), z.date()]).optional(),
	})
	.passthrough();

export const createContactDto = z.object({
	name: z.string().trim().min(2).max(100),
	email: z.email().transform((value) => value.trim().toLowerCase()),
	subject: z.string().trim().min(5).max(200),
	message: z.string().trim().min(10).max(5000),
});

export const listContactsQueryDto = paginationQueryDto.extend({
	status: contactStatusDto.default("new"),
});

export type ContactResponseDto = z.infer<typeof contactResponseDto>;
export type CreateContactDto = z.infer<typeof createContactDto>;
export type ListContactsQueryDto = z.infer<typeof listContactsQueryDto>;
