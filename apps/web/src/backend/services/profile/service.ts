import { UserRepository } from "@rensa/db/queries/user.repository";
import type { UserProfileDto, UserRepositoryInterface } from "@rensa/db/schema";
import sharp from "sharp";
import {
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
	ValidationError,
} from "@/backend/common/backend.error";
import { updateProfileDto } from "@/backend/dtos/profile.dto";
import cloudinary, {
	getCloudinaryPublicIdFromUrl,
	validateCloudinaryUrl,
} from "@/lib/cloudinary";
import {
	isAcceptedProfileAvatarFile,
	PROFILE_AVATAR_MAX_INPUT_SIZE_BYTES,
	PROFILE_AVATAR_MAX_INPUT_SIZE_MB,
	PROFILE_AVATAR_OUTPUT_MIME_TYPE,
} from "@/shared/configs/profile-avatar.config";

interface UpdateProfileParams {
	actorId?: string;
	avatarFile?: File | null;
	userId: string;
	username: string;
}

const isUniqueConstraintError = (error: unknown): boolean => {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const maybeError = error as { code?: unknown; constraint?: unknown };
	return (
		maybeError.code === "23505" ||
		(typeof maybeError.constraint === "string" &&
			maybeError.constraint.includes("username"))
	);
};

export class ProfileService {
	readonly userRepository: UserRepositoryInterface;

	constructor(userRepository: UserRepositoryInterface) {
		this.userRepository = userRepository;
	}

	async getById(userId: string): Promise<UserProfileDto> {
		const user = await this.userRepository.getProfileById(userId);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		return user;
	}

	async updateProfile(params: UpdateProfileParams): Promise<UserProfileDto> {
		if (!params.actorId) {
			throw new UnauthorizedError(
				"Unauthorized. Please login to update profile."
			);
		}
		if (params.actorId !== params.userId) {
			throw new ForbiddenError("Unauthorized to update this profile");
		}

		const payload = updateProfileDto.parse({ username: params.username });
		const user = await this.userRepository.getProfileById(params.userId);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		const avatarUpload = params.avatarFile
			? await this.uploadAvatar({
					file: params.avatarFile,
					userId: params.userId,
				})
			: null;
		const avatarUrl = avatarUpload
			? avatarUpload.avatarUrl
			: (user.avatarUrl ?? "");

		try {
			const updatedUser = await this.userRepository.updateProfile({
				avatarUrl,
				email: user.email,
				userId: params.userId,
				username: payload.username,
			});

			if (!updatedUser) {
				throw new NotFoundError("User not found");
			}

			if (avatarUpload) {
				try {
					await this.deletePreviousAvatar(user.avatarUrl, params.userId);
				} catch {
					// Keep the profile update successful even if cleanup of the old asset fails.
				}
			}

			return updatedUser;
		} catch (error) {
			if (avatarUpload) {
				try {
					await cloudinary.uploader.destroy(avatarUpload.publicId);
				} catch {
					// Preserve the original database/update error.
				}
			}
			if (isUniqueConstraintError(error)) {
				throw new ValidationError("Username is already taken");
			}
			throw error;
		}
	}

	private async uploadAvatar(params: {
		file: File;
		userId: string;
	}): Promise<{ avatarUrl: string; publicId: string }> {
		if (params.file.size > PROFILE_AVATAR_MAX_INPUT_SIZE_BYTES) {
			throw new ValidationError(
				`Image must be ${PROFILE_AVATAR_MAX_INPUT_SIZE_MB}MB or smaller.`
			);
		}
		if (!isAcceptedProfileAvatarFile(params.file)) {
			throw new ValidationError("Only JPG, PNG, or WebP files are allowed.");
		}

		const arrayBuffer = await params.file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const output = await sharp(buffer)
			.rotate()
			.resize({ fit: "cover", height: 400, width: 400 })
			.jpeg({ quality: 88 })
			.toBuffer();
		const base64File = `data:${PROFILE_AVATAR_OUTPUT_MIME_TYPE};base64,${output.toString(
			"base64"
		)}`;

		const uploadRes = await cloudinary.uploader.upload(base64File, {
			fetch_format: "auto",
			folder: `user_profile/${params.userId}`,
			quality: "auto",
			resource_type: "image",
		});

		if (!validateCloudinaryUrl(uploadRes.secure_url)) {
			await cloudinary.uploader.destroy(uploadRes.public_id);
			throw new ValidationError("Invalid avatar upload URL");
		}

		return { avatarUrl: uploadRes.secure_url, publicId: uploadRes.public_id };
	}

	private async deletePreviousAvatar(
		avatarUrl: string | undefined,
		userId: string
	): Promise<void> {
		if (!avatarUrl) {
			return;
		}

		const publicId = getCloudinaryPublicIdFromUrl(avatarUrl);
		if (!publicId?.startsWith(`user_profile/${userId}/`)) {
			return;
		}

		await cloudinary.uploader.destroy(publicId);
	}
}

export const profileService = new ProfileService(new UserRepository());
