import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import { RollRepository } from "@rensa/db/queries/roll.repository";
import type {
	ListRollPhotosQueryDto,
	PhotoRepositoryInterface,
	RollCreateDto,
	RollRepositoryInterface,
	RollUpdateDto,
} from "@rensa/db/schema";
import {
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from "@/backend/common/backend.error";
import { notificationService } from "@/backend/services/notifications/service";
import type { PaginatedPhotoListResult } from "@/backend/types/service.types";

export const DEFAULT_ROLL_NAME = "All Photos";

export class RollService {
	readonly photoRepository: PhotoRepositoryInterface;
	readonly rollRepository: RollRepositoryInterface;

	constructor(
		rollRepository: RollRepositoryInterface,
		photoRepository: PhotoRepositoryInterface
	) {
		this.rollRepository = rollRepository;
		this.photoRepository = photoRepository;
	}

	async listByUserId(
		userId: string,
		sort: "latest" | "oldest"
	): Promise<{ rolls: unknown[] }> {
		const rolls = await this.rollRepository.listByUserId(userId, sort);
		return { rolls };
	}

	create(
		payload: Omit<RollCreateDto, "userId">,
		actorId?: string
	): Promise<unknown> {
		if (!actorId) {
			throw new UnauthorizedError();
		}
		return this.rollRepository.create({
			...payload,
			userId: actorId,
		});
	}

	createForUser(payload: RollCreateDto): Promise<unknown> {
		return this.rollRepository.create(payload);
	}

	async getById(rollId: string): Promise<unknown> {
		const roll = await this.rollRepository.getById(rollId);
		if (!roll) {
			throw new NotFoundError("Roll not found");
		}
		return roll;
	}

	async getOwnerId(rollId: string): Promise<string> {
		const roll = await this.rollRepository.getById(rollId);
		if (!roll) {
			throw new NotFoundError("Roll not found");
		}
		return roll.userId;
	}

	async getDefaultByUserId(actorId?: string): Promise<unknown> {
		if (!actorId) {
			throw new UnauthorizedError();
		}
		const defaultRoll = await this.rollRepository.getDefaultByUserId(actorId);
		if (!defaultRoll) {
			throw new NotFoundError("Default roll not found");
		}
		return defaultRoll;
	}

	async update(
		rollId: string,
		payload: RollUpdateDto,
		actorId?: string
	): Promise<unknown> {
		if (!actorId) {
			throw new UnauthorizedError();
		}

		const ownerId = await this.getOwnerId(rollId);
		if (ownerId !== actorId) {
			throw new ForbiddenError("Forbidden. You don't own this roll.");
		}

		const updatedRoll = await this.rollRepository.update(rollId, payload);
		if (!updatedRoll) {
			throw new NotFoundError("Roll not found");
		}

		return updatedRoll;
	}

	async deleteById(rollId: string, actorId?: string): Promise<unknown> {
		if (!actorId) {
			throw new UnauthorizedError();
		}

		const roll = await this.rollRepository.getById(rollId);
		if (!roll) {
			throw new NotFoundError("Roll not found");
		}

		if (roll.userId !== actorId) {
			throw new ForbiddenError("Forbidden: You don't own this roll");
		}

		if (roll.name === DEFAULT_ROLL_NAME) {
			throw new ForbiddenError("The default All Photos roll cannot be deleted");
		}

		const deletedRoll = await this.rollRepository.deleteById(rollId);
		if (!deletedRoll) {
			throw new NotFoundError("Roll not found");
		}
		return deletedRoll;
	}

	async listContainingPhoto(
		photoId: string,
		actorId?: string
	): Promise<{ isSaved: boolean; rollIds: string[]; rolls: unknown[] }> {
		if (!actorId) {
			throw new UnauthorizedError();
		}

		const rolls = await this.rollRepository.listContainingPhoto(
			actorId,
			photoId
		);
		return {
			isSaved: rolls.length > 0,
			rollIds: rolls.map((roll) => roll.rollId),
			rolls,
		};
	}

	async addPhotoToRoll(
		rollId: string,
		photoId: string,
		actorId?: string
	): Promise<number> {
		if (!actorId) {
			throw new UnauthorizedError();
		}
		const ownerId = await this.getOwnerId(rollId);
		if (ownerId !== actorId) {
			throw new ForbiddenError("Forbidden");
		}

		const photoExists = await this.photoRepository.exists(photoId);
		if (!photoExists) {
			throw new NotFoundError("Photo not found");
		}

		const modifiedCount = await this.rollRepository.addPhotoToRoll(
			rollId,
			photoId
		);
		if (modifiedCount > 0) {
			await this.notifyPhotoOwner(actorId, photoId);
		}
		return modifiedCount;
	}

	async removePhotoFromRoll(
		rollId: string,
		photoId: string,
		actorId?: string
	): Promise<void> {
		if (!actorId) {
			throw new UnauthorizedError();
		}
		const ownerId = await this.getOwnerId(rollId);
		if (ownerId !== actorId) {
			throw new ForbiddenError("Forbidden");
		}
		await this.rollRepository.removePhotoFromRoll(rollId, photoId);
	}

	async listPhotos(
		rollId: string,
		query: ListRollPhotosQueryDto
	): Promise<PaginatedPhotoListResult> {
		const roll = await this.rollRepository.getById(rollId);
		if (!roll) {
			throw new NotFoundError("Roll not found");
		}

		const { photos, total } = await this.photoRepository.listByIds(
			roll.photos,
			query.page,
			query.limit
		);
		const totalPages = Math.ceil(total / query.limit);
		return {
			photos,
			currentPage: query.page,
			totalPages,
			hasMore: query.page < totalPages,
			total,
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
				type: "photo-saved",
			});
		} catch (error) {
			console.error("Failed to create roll save notification:", error);
		}
	}
}

const rollRepository = new RollRepository();
const photoRepository = new PhotoRepository();

export const rollService = new RollService(rollRepository, photoRepository);
