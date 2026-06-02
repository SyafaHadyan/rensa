import cloudinary, { getCloudinaryPublicIdFromUrl } from "@rensa/cloudinary";
import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import { UserRepository } from "@rensa/db/queries/user.repository";
import type {
	ListPhotosQueryDto,
	PhotoRepositoryInterface,
	UserRepositoryInterface,
} from "@rensa/db/schema";
import { ForbiddenError, NotFoundError } from "@/backend/common/backend.error";
import type { PaginatedPhotoListResult } from "@/backend/types/service.types";
import { withTimeout } from "@/lib/timeout";

const CLOUDINARY_DESTROY_TIMEOUT_MS = 10_000;

export class PhotoService {
	readonly photoRepository: PhotoRepositoryInterface;
	readonly userRepository: UserRepositoryInterface;

	constructor(
		photoRepository: PhotoRepositoryInterface,
		userRepository: UserRepositoryInterface
	) {
		this.photoRepository = photoRepository;
		this.userRepository = userRepository;
	}

	async list(query: ListPhotosQueryDto): Promise<PaginatedPhotoListResult> {
		const { nextCursor, photos, total } =
			await this.photoRepository.list(query);
		const totalPages = Math.ceil(total / query.limit);
		return {
			photos,
			currentPage: query.page,
			totalPages,
			hasMore: query.cursor ? Boolean(nextCursor) : query.page < totalPages,
			nextCursor,
			total,
		};
	}

	async getById(photoId: string): Promise<unknown> {
		const photo = await this.photoRepository.getById(photoId);
		if (!photo) {
			throw new NotFoundError("Photo not found");
		}
		const user = await this.userRepository.getById(photo.user.userId);
		return { ...photo, user };
	}

	async getOwnerId(photoId: string): Promise<string> {
		const ownerId = await this.photoRepository.getOwnerId(photoId);
		if (!ownerId) {
			throw new NotFoundError("Photo not found");
		}
		return ownerId;
	}

	async deleteById(photoId: string, actorId: string): Promise<void> {
		const photo = await this.photoRepository.getById(photoId);
		if (!photo) {
			throw new NotFoundError("Photo not found");
		}
		if (photo.user.userId !== actorId) {
			throw new ForbiddenError("Forbidden: You don't own this photo");
		}

		const publicId = getCloudinaryPublicIdFromUrl(photo.url);
		if (publicId) {
			const result = await withTimeout(
				cloudinary.uploader.destroy(publicId, {
					resource_type: "image",
				}),
				CLOUDINARY_DESTROY_TIMEOUT_MS,
				"Cloudinary photo delete timed out"
			);
			if (result.result !== "ok" && result.result !== "not found") {
				throw new Error(`Failed to delete Cloudinary asset: ${result.result}`);
			}
		}

		await this.photoRepository.deleteById(photoId);
	}

	async listBookmarkedByUser(
		userId: string,
		page: number,
		limit: number,
		cursor?: string
	): Promise<PaginatedPhotoListResult> {
		const { nextCursor, photos, total } =
			await this.photoRepository.listBookmarkedByUser(
				userId,
				page,
				limit,
				cursor
			);
		const totalPages = Math.ceil(total / limit);
		return {
			photos,
			currentPage: page,
			totalPages,
			hasMore: cursor ? Boolean(nextCursor) : page < totalPages,
			nextCursor,
			total,
		};
	}
}

const photoRepository = new PhotoRepository();
const userRepository = new UserRepository();

export const photoService = new PhotoService(photoRepository, userRepository);
