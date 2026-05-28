import { asc, count, eq } from "drizzle-orm";
import type {
	CommentRepositoryInterface,
	CommentResponseDto,
	ListCommentsResult,
} from "../schemas/comments";
import { comments } from "../schemas/comments";
import { users } from "../schemas/users";
import db from "../src/db";

const toIso = (value: Date | null): string | undefined =>
	value ? value.toISOString() : undefined;

export class CommentRepository implements CommentRepositoryInterface {
	async create(params: {
		photoId: string;
		userId: string;
		text: string;
	}): Promise<CommentResponseDto> {
		const [row] = await db
			.insert(comments)
			.values({
				photoId: params.photoId,
				text: params.text,
				userId: params.userId,
			})
			.returning();
		if (!row) {
			throw new Error("Failed to create comment");
		}

		return {
			commentId: row.commentId,
			photoId: row.photoId ?? "",
			user: {
				userId: row.userId ?? "",
				username: "",
			},
			text: row.text,
			createdAt: toIso(row.createdAt),
			updatedAt: toIso(row.updatedAt),
		};
	}

	async listByPhotoId(params: {
		photoId: string;
		offset: number;
		limit: number;
	}): Promise<ListCommentsResult> {
		const rows = await db
			.select({
				avatarUrl: users.avatarUrl,
				commentId: comments.commentId,
				createdAt: comments.createdAt,
				photoId: comments.photoId,
				text: comments.text,
				updatedAt: comments.updatedAt,
				userId: comments.userId,
				username: users.username,
			})
			.from(comments)
			.leftJoin(users, eq(comments.userId, users.userId))
			.where(eq(comments.photoId, params.photoId))
			.orderBy(asc(comments.createdAt))
			.limit(params.limit)
			.offset(params.offset);

		const [countRow] = await db
			.select({ total: count() })
			.from(comments)
			.where(eq(comments.photoId, params.photoId));

		const mapped = rows.map((row) => ({
			commentId: row.commentId,
			photoId: row.photoId ?? "",
			user: {
				userId: row.userId ?? "",
				username: row.username ?? "",
				avatarUrl: row.avatarUrl ?? undefined,
			},
			text: row.text,
			createdAt: toIso(row.createdAt),
			updatedAt: toIso(row.updatedAt),
		}));

		return {
			comments: mapped,
			total: Number(countRow?.total ?? 0),
		};
	}
}
