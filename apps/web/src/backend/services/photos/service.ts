import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import { UserRepository } from "@rensa/db/queries/user.repository";
import type {
  ListPhotosQueryDto,
  PhotoRepositoryInterface,
  UserRepositoryInterface,
} from "@rensa/db/schema";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/backend/common/backend.error";
import type { PaginatedPhotoListResult } from "@/backend/types/service.types";

export class PhotoService {
  readonly photoRepository: PhotoRepositoryInterface;
  readonly userRepository: UserRepositoryInterface;

  constructor(
    photoRepository: PhotoRepositoryInterface,
    userRepository: UserRepositoryInterface,
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

  async getById(photo_id: string): Promise<unknown> {
    const photo = await this.photoRepository.getById(photo_id);
    if (!photo) {
      throw new NotFoundError("Photo not found");
    }
    const user = await this.userRepository.getById(photo.user.user_id);
    return { ...photo, user };
  }

  async getOwnerId(photo_id: string): Promise<string> {
    const ownerId = await this.photoRepository.getOwnerId(photo_id);
    if (!ownerId) {
      throw new NotFoundError("Photo not found");
    }
    return ownerId;
  }

  async deleteById(photo_id: string, actor_id: string): Promise<void> {
    const ownerId = await this.getOwnerId(photo_id);
    if (ownerId !== actor_id) {
      throw new ForbiddenError("Forbidden: You don't own this photo");
    }
    await this.photoRepository.deleteById(photo_id);
  }

  async listBookmarkedByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedPhotoListResult> {
    const { photos, total } = await this.photoRepository.listBookmarkedByUser(
      userId,
      page,
      limit,
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

  async updateBookmark(params: {
    photo_id: string;
    user_id: string;
    action: "increment" | "decrement";
    actor_id?: string;
  }): Promise<{
    bookmarks: string[];
    is_bookmarked: boolean;
  }> {
    if (!params.actor_id) {
      throw new UnauthorizedError();
    }
    if (params.actor_id !== params.user_id) {
      throw new ForbiddenError("Cannot update bookmarks for another user");
    }

    const photo_exists = await this.photoRepository.exists(params.photo_id);
    if (!photo_exists) {
      throw new NotFoundError("Photo not found");
    }

    const updated_user = await this.userRepository.updateBookmarks(
      params.user_id,
      params.photo_id,
      params.action,
    );
    if (!updated_user) {
      throw new NotFoundError("User not found");
    }

    return {
      bookmarks: updated_user.bookmarks,
      is_bookmarked: params.action === "increment",
    };
  }
}

const photoRepository = new PhotoRepository();
const userRepository = new UserRepository();

export const photoService = new PhotoService(photoRepository, userRepository);
