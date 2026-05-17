import { CommentRepository } from "@rensa/db/queries/comment.repository";
import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import type {
	CommentRepositoryInterface,
	CreateCommentDto,
	PhotoRepositoryInterface,
} from "@rensa/db/schema";
import {
	NotFoundError,
	UnauthorizedError,
	ValidationError,
} from "@/backend/common/backend.error";
import { notificationService } from "@/backend/services/notifications/service";
import type { CommentListResult } from "@/backend/types/service.types";

export class CommentService {
	readonly commentRepository: CommentRepositoryInterface;
	readonly photoRepository: PhotoRepositoryInterface;

	constructor(
		commentRepository: CommentRepositoryInterface,
		photoRepository: PhotoRepositoryInterface
	) {
		this.commentRepository = commentRepository;
		this.photoRepository = photoRepository;
	}

	async createForPhoto(
		photoId: string,
		payload: CreateCommentDto,
		actorId?: string
	): Promise<unknown> {
		if (!actorId) {
			throw new UnauthorizedError();
		}

		const ownerId = await this.photoRepository.getOwnerId(photoId);
		if (!ownerId) {
			throw new NotFoundError("Photo not found");
		}

		try {
			const comment = await this.commentRepository.create({
				photoId,
				userId: actorId,
				text: payload.text,
			});
			await this.notifyPhotoOwner(actorId, photoId, ownerId);
			return comment;
		} catch {
			throw new ValidationError("Invalid comment payload");
		}
	}

	async listByPhotoId(
		photoId: string,
		offset: number,
		limit: number
	): Promise<CommentListResult> {
		const { comments, total } = await this.commentRepository.listByPhotoId({
			photoId,
			offset,
			limit,
		});

		return {
			comments,
			hasMore: offset + comments.length < total,
			total,
		};
	}

	private async notifyPhotoOwner(
		actorId: string,
		photoId: string,
		recipientId: string
	): Promise<void> {
		if (recipientId === actorId) {
			return;
		}

		try {
			await notificationService.create({
				actorId,
				photoId,
				recipientId,
				type: "photo-commented",
			});
		} catch (error) {
			console.error("Failed to create comment notification:", error);
		}
	}
}

export const commentService = new CommentService(
	new CommentRepository(),
	new PhotoRepository()
);
