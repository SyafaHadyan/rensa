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
import type { PaginatedPhotoListResult } from "@/backend/types/service.types";

export class RollService {
  readonly photoRepository: PhotoRepositoryInterface;
  readonly rollRepository: RollRepositoryInterface;

  constructor(
    rollRepository: RollRepositoryInterface,
    photoRepository: PhotoRepositoryInterface,
  ) {
    this.rollRepository = rollRepository;
    this.photoRepository = photoRepository;
  }

  async listByUserId(
    userId: string,
    sort: "latest" | "oldest",
  ): Promise<{ rolls: unknown[] }> {
    const rolls = await this.rollRepository.listByUserId(userId, sort);
    return { rolls };
  }

  create(payload: RollCreateDto, actor_id?: string): Promise<unknown> {
    if (!actor_id) {
      throw new UnauthorizedError();
    }
    if (payload.user_id !== actor_id) {
      throw new ForbiddenError("Cannot create rolls for another user");
    }
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
    return roll.user_id;
  }

  async getDefaultByUserId(actor_id?: string): Promise<unknown> {
    if (!actor_id) {
      throw new UnauthorizedError();
    }
    const defaultRoll = await this.rollRepository.getDefaultByUserId(actor_id);
    if (!defaultRoll) {
      throw new NotFoundError("Default roll not found");
    }
    return defaultRoll;
  }

  async update(
    rollId: string,
    payload: RollUpdateDto,
    actor_id?: string,
  ): Promise<unknown> {
    if (!actor_id) {
      throw new UnauthorizedError();
    }

    const ownerId = await this.getOwnerId(rollId);
    if (ownerId !== actor_id) {
      throw new ForbiddenError("Forbidden. You don't own this roll.");
    }

    const updatedRoll = await this.rollRepository.update(rollId, payload);
    if (!updatedRoll) {
      throw new NotFoundError("Roll not found");
    }

    return updatedRoll;
  }

  async deleteById(rollId: string, actor_id?: string): Promise<unknown> {
    if (!actor_id) {
      throw new UnauthorizedError();
    }

    const ownerId = await this.getOwnerId(rollId);
    if (ownerId !== actor_id) {
      throw new ForbiddenError("Forbidden: You don't own this roll");
    }

    const deletedRoll = await this.rollRepository.deleteById(rollId);
    if (!deletedRoll) {
      throw new NotFoundError("Roll not found");
    }
    return deletedRoll;
  }

  async listContainingPhoto(
    photo_id: string,
    actor_id?: string,
  ): Promise<{ isSaved: boolean; rollIds: string[]; rolls: unknown[] }> {
    if (!actor_id) {
      throw new UnauthorizedError();
    }

    const rolls = await this.rollRepository.listContainingPhoto(
      actor_id,
      photo_id,
    );
    return {
      isSaved: rolls.length > 0,
      rollIds: rolls.map((roll) => roll.roll_id),
      rolls,
    };
  }

  async addPhotoToRoll(
    rollId: string,
    photo_id: string,
    actor_id?: string,
  ): Promise<number> {
    if (!actor_id) {
      throw new UnauthorizedError();
    }
    const ownerId = await this.getOwnerId(rollId);
    if (ownerId !== actor_id) {
      throw new ForbiddenError("Forbidden");
    }

    const photoExists = await this.photoRepository.exists(photo_id);
    if (!photoExists) {
      throw new NotFoundError("Photo not found");
    }

    return this.rollRepository.addPhotoToRoll(rollId, photo_id);
  }

  async removePhotoFromRoll(
    rollId: string,
    photo_id: string,
    actor_id?: string,
  ): Promise<void> {
    if (!actor_id) {
      throw new UnauthorizedError();
    }
    const ownerId = await this.getOwnerId(rollId);
    if (ownerId !== actor_id) {
      throw new ForbiddenError("Forbidden");
    }
    await this.rollRepository.removePhotoFromRoll(rollId, photo_id);
  }

  async listPhotos(
    rollId: string,
    query: ListRollPhotosQueryDto,
  ): Promise<PaginatedPhotoListResult> {
    const roll = await this.rollRepository.getById(rollId);
    if (!roll) {
      throw new NotFoundError("Roll not found");
    }

    const { photos, total } = await this.photoRepository.listByIds(
      roll.photos,
      query.page,
      query.limit,
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
}

const rollRepository = new RollRepository();
const photoRepository = new PhotoRepository();

export const rollService = new RollService(rollRepository, photoRepository);
