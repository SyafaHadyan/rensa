import { z } from "zod";
import { uuidDto } from "./common.dto";

export const userResponseDto = z.object({
	userId: uuidDto,
	email: z.email(),
	username: z.string(),
	avatarUrl: z.string().default(""),
	bookmarks: z.array(uuidDto).default([]),
	role: z.enum(["user", "admin"]),
	verified: z.boolean().default(false),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export const userUpdateDto = userResponseDto
	.omit({
		userId: true,
		email: true,
		role: true,
		bookmarks: true,
		verified: true,
		createdAt: true,
		updatedAt: true,
	})
	.partial();

export const userLoginDto = z.object({
	email: z.email(),
	password: z.string().min(1),
});

export const userRegisterDto = z.object({
	email: z.email(),
	username: z.string().min(1),
	password: z.string().min(8),
});

export const userIdParamDto = z.object({
	userId: uuidDto,
});

export type UserWithPasswordResponseDto = z.infer<typeof userResponseDto> & {
	password: string;
};
export type UserUpdateDto = z.infer<typeof userUpdateDto>;
export type UserResponseDto = z.infer<typeof userResponseDto>;
export type UserLoginDto = z.infer<typeof userLoginDto>;
export type UserRegisterDto = z.infer<typeof userRegisterDto>;
