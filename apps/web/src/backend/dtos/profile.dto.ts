import { z } from "zod";
import { uuidDto } from "./common.dto";

export const profileIdParamDto = z.object({
	userId: uuidDto,
});

export const updateProfileDto = z.object({
	username: z.string().trim().min(1).max(50),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
