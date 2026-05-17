import { BookmarkRepository } from "@rensa/db/queries/bookmark.repository";
import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import type {
	BookmarkRepositoryInterface,
	BookmarkStatusDto,
	PhotoRepositoryInterface,
} from "@rensa/db/schema";
import { NotFoundError } from "@/backend/common/backend.error";
import { notificationService } from "@/backend/services/notifications/service";

export class BookmarkService {
	readonly bookmarkRepository: BookmarkRepositoryInterface;
	readonly photoRepository: PhotoRepositoryInterface;

	constructor(
		bookmarkRepository: BookmarkRepositoryInterface,
		photoRepository: PhotoRepositoryInterface
	) {
		this.bookmarkRepository = bookmarkRepository;
		this.photoRepository = photoRepository;
	}

	async getStatus(userId: string, photoId: string): Promise<BookmarkStatusDto> {
		await this.assertPhotoExists(photoId);
		return this.getCurrentStatus(userId, photoId);
	}

	async add(userId: string, photoId: string): Promise<BookmarkStatusDto> {
		await this.assertPhotoExists(photoId);
		const inserted = await this.bookmarkRepository.add(userId, photoId);
		if (inserted) {
			await this.notifyPhotoOwner(userId, photoId);
		}
		return this.getCurrentStatus(userId, photoId);
	}

	async remove(userId: string, photoId: string): Promise<BookmarkStatusDto> {
		await this.assertPhotoExists(photoId);
		await this.bookmarkRepository.remove(userId, photoId);
		return this.getCurrentStatus(userId, photoId);
	}

	private async assertPhotoExists(photoId: string): Promise<void> {
		const photoExists = await this.photoRepository.exists(photoId);
		if (!photoExists) {
			throw new NotFoundError("Photo not found");
		}
	}

	private async getCurrentStatus(
		userId: string,
		photoId: string
	): Promise<BookmarkStatusDto> {
		const [isBookmarked, bookmarkCount] = await Promise.all([
			this.bookmarkRepository.exists(userId, photoId),
			this.bookmarkRepository.countByPhotoId(photoId),
		]);
		return {
			bookmarkCount,
			isBookmarked,
		};
	}

	private async notifyPhotoOwner(
		actorId: string,
		photoId: string
	): Promise<void> {
		const recipientId = await this.photoRepository.getOwnerId(photoId);
		if (!(recipientId && recipientId !== actorId)) {
			return;
		}

		try {
			await notificationService.create({
				actorId,
				photoId,
				recipientId,
				type: "photo-bookmarked",
			});
		} catch (error) {
			console.error("Failed to create bookmark notification:", error);
		}
	}
}

const bookmarkRepository = new BookmarkRepository();
const photoRepository = new PhotoRepository();

export const bookmarkService = new BookmarkService(
	bookmarkRepository,
	photoRepository
);
