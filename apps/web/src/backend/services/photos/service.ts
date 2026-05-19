import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import { UserRepository } from "@rensa/db/queries/user.repository";
import type {
	ListPhotosQueryDto,
	PhotoRepositoryInterface,
	UserRepositoryInterface,
} from "@rensa/db/schema";
import { ForbiddenError, NotFoundError } from "@/backend/common/backend.error";
import type { PaginatedPhotoListResult } from "@/backend/types/service.types";
import cloudinary, { getCloudinaryPublicIdFromUrl } from "@/lib/cloudinary";

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
		const { photos, total } = await this.photoRepository.list(query);
		const totalPages = Math.ceil(total / query.limit);
		return {
			photos,
			currentPage: query.page,
			totalPages,
			hasMore: query.page < totalPages,
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
			const result = await cloudinary.uploader.destroy(publicId, {
				resource_type: "image",
			});
			if (result.result !== "ok" && result.result !== "not found") {
				throw new Error(`Failed to delete Cloudinary asset: ${result.result}`);
			}
		}

		await this.photoRepository.deleteById(photoId);
	}

	async listBookmarkedByUser(
		userId: string,
		page: number,
		limit: number
	): Promise<PaginatedPhotoListResult> {
		const { photos, total } = await this.photoRepository.listBookmarkedByUser(
			userId,
			page,
			limit
		);
		const totalPages = Math.ceil(total / limit);
		return {
			photos,
			currentPage: page,
			totalPages,
			hasMore: page < totalPages,
			total,
		};
	}
}

const photoRepository = new PhotoRepository();
const userRepository = new UserRepository();

export const photoService = new PhotoService(photoRepository, userRepository);
