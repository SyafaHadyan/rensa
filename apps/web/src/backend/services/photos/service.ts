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

interface PaginatedPhotosResult {
  currentPage: number;
  hasMore: boolean;
  photos: unknown[];
  total: number;
  totalPages: number;
}

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

  async list(query: ListPhotosQueryDto): Promise<PaginatedPhotosResult> {
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
    const user = await this.userRepository.getById(photo?.user?.user_id as string);
    if (!photo) {
      throw new NotFoundError("Photo not found");
    }
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
    const ownerId = await this.getOwnerId(photoId);
    if (ownerId !== actorId) {
      throw new ForbiddenError("Forbidden: You don't own this photo");
    }
    await this.photoRepository.deleteById(photoId);
  }

  async listBookmarkedByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedPhotosResult> {
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
    photoId: string;
    userId: string;
    action: "increment" | "decrement";
    actorId?: string;
  }): Promise<{
    bookmarks: string[];
    isBookmarked: boolean;
  }> {
    if (!params.actorId) {
      throw new UnauthorizedError();
    }
    if (params.actorId !== params.userId) {
      throw new ForbiddenError("Cannot update bookmarks for another user");
    }

    const photoExists = await this.photoRepository.exists(params.photoId);
    if (!photoExists) {
      throw new NotFoundError("Photo not found");
    }

    const updatedUser = await this.userRepository.updateBookmarks(
      params.userId,
      params.photoId,
      params.action,
    );
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return {
      bookmarks: updatedUser.bookmarks,
      isBookmarked: params.action === "increment",
    };
  }
}
