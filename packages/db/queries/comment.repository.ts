import { and, asc, count, eq, gt, or } from "drizzle-orm";
import type {
	CommentRepositoryInterface,
	CommentResponseDto,
	ListCommentsResult,
} from "../schemas/comments";
import { comments } from "../schemas/comments";
import { users } from "../schemas/users";
import db from "../src/db";
import {
	decodeTimestampCursor,
	encodeTimestampCursor,
} from "../src/pagination-cursor";

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
		cursor?: string;
		photoId: string;
		offset: number;
		limit: number;
	}): Promise<ListCommentsResult> {
		const decodedCursor = decodeTimestampCursor(params.cursor);
		const cursorWhereClause = decodedCursor
			? or(
					gt(comments.createdAt, decodedCursor.timestamp),
					and(
						eq(comments.createdAt, decodedCursor.timestamp),
						gt(comments.commentId, decodedCursor.id)
					)
				)
			: undefined;
		const whereClause = and(
			...(
				[eq(comments.photoId, params.photoId), cursorWhereClause] as const
			).filter(Boolean)
		);
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
			.where(whereClause)
			.orderBy(asc(comments.createdAt), asc(comments.commentId))
			.limit(params.cursor ? params.limit + 1 : params.limit)
			.offset(params.cursor ? 0 : params.offset);

		const [countRow] = await db
			.select({ total: count() })
			.from(comments)
			.where(eq(comments.photoId, params.photoId));

		const hasMore = rows.length > params.limit;
		const visibleRows = hasMore ? rows.slice(0, params.limit) : rows;
		const mapped = visibleRows.map((row) => ({
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
			nextCursor: hasMore
				? encodeTimestampCursor(
						visibleRows.at(-1)?.createdAt ?? null,
						visibleRows.at(-1)?.commentId ?? ""
					)
				: undefined,
			total: Number(countRow?.total ?? 0),
		};
	}
}
