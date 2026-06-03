import {
	and,
	asc,
	count,
	desc,
	eq,
	gt,
	ilike,
	inArray,
	lt,
	or,
} from "drizzle-orm";
import { bookmarks } from "../schemas/bookmarks";
import type {
	CreatePendingUploadedPhotoDto,
	CreateUploadedPhotoDto,
	ListPhotosQueryDto,
	ListPhotosResult,
	MarkPhotoProcessingReadyDto,
	PhotoRepositoryInterface,
	PhotoResponseDto,
	PhotoUploadStatusDto,
	UploadedPhotoDto,
} from "../schemas/photos";
import { photoMetadata, photos } from "../schemas/photos";
import { users } from "../schemas/users";
import db from "../src/db";
import {
	decodeTimestampCursor,
	encodeTimestampCursor,
} from "../src/pagination-cursor";

type PhotoRow = typeof photos.$inferSelect;
type PhotoMetadataRow = typeof photoMetadata.$inferSelect;
type PhotoUser = Pick<
	typeof users.$inferSelect,
	"avatarUrl" | "userId" | "username"
>;

const toIso = (value: Date | null): string | undefined =>
	value ? value.toISOString() : undefined;

export class PhotoRepository implements PhotoRepositoryInterface {
	async createUploadedPhoto(
		payload: CreateUploadedPhotoDto
	): Promise<UploadedPhotoDto> {
		const [photo] = await db
			.insert(photos)
			.values({
				camera: payload.camera,
				category: payload.category,
				color: payload.color,
				description: payload.description,
				processingStatus: "ready",
				style: payload.style,
				title: payload.title,
				url: payload.url,
				userId: payload.userId,
			})
			.returning();
		if (!photo) {
			throw new Error("Failed to persist photo");
		}

		if (
			payload.width !== undefined ||
			payload.height !== undefined ||
			payload.format !== undefined ||
			payload.size !== undefined ||
			payload.uploadedAt !== undefined ||
			payload.exif !== undefined
		) {
			await db
				.insert(photoMetadata)
				.values({
					exif: payload.exif,
					format: payload.format,
					height: payload.height,
					photoMetadataId: photo.photoId,
					size: payload.size,
					uploadedAt: payload.uploadedAt,
					width: payload.width,
				})
				.onConflictDoUpdate({
					target: photoMetadata.photoMetadataId,
					set: {
						exif: payload.exif,
						format: payload.format,
						height: payload.height,
						size: payload.size,
						uploadedAt: payload.uploadedAt,
						width: payload.width,
					},
				});
		}

		return {
			...photo,
			exif: payload.exif,
			format: payload.format,
			height: payload.height,
			size: payload.size,
			uploadedAt: payload.uploadedAt,
			width: payload.width,
		};
	}

	async createPendingUploadedPhoto(
		payload: CreatePendingUploadedPhotoDto
	): Promise<UploadedPhotoDto> {
		const [photo] = await db
			.insert(photos)
			.values({
				camera: payload.camera,
				category: payload.category,
				color: payload.color,
				description: payload.description,
				processingStatus: "pending",
				sourcePublicId: payload.sourcePublicId,
				style: payload.style,
				title: payload.title,
				url: payload.sourceUrl,
				userId: payload.userId,
			})
			.returning();
		if (!photo) {
			throw new Error("Failed to persist pending photo");
		}

		if (payload.exif !== undefined) {
			await db.insert(photoMetadata).values({
				exif: payload.exif,
				photoMetadataId: photo.photoId,
			});
		}

		return {
			...photo,
			exif: payload.exif,
		};
	}

	private async countBookmarksByPhotoIds(
		photoIds: string[]
	): Promise<Map<string, number>> {
		const bookmarkCountByPhotoId = new Map<string, number>();
		for (const photoId of photoIds) {
			bookmarkCountByPhotoId.set(photoId, 0);
		}
		if (photoIds.length === 0) {
			return bookmarkCountByPhotoId;
		}

		const rows = await db
			.select({
				count: count(bookmarks.photoId),
				photoId: bookmarks.photoId,
			})
			.from(bookmarks)
			.where(inArray(bookmarks.photoId, photoIds))
			.groupBy(bookmarks.photoId);

		for (const row of rows) {
			if (!row.photoId) {
				continue;
			}
			bookmarkCountByPhotoId.set(row.photoId, Number(row.count));
		}

		return bookmarkCountByPhotoId;
	}

	private serializePhoto(
		photo: PhotoRow,
		bookmarksCount: number,
		user?: PhotoUser | null,
		metadata?: PhotoMetadataRow | null
	): PhotoResponseDto {
		return {
			photoId: photo.photoId,
			url: photo.url,
			user: {
				userId: photo.userId as string,
				username: user?.username ?? "",
				avatarUrl: user?.avatarUrl ?? "",
			},
			title: photo.title,
			description: photo.description ?? "",
			category: photo.category ?? "",
			style: photo.style ?? "",
			color: photo.color ?? "",
			camera: photo.camera ?? "",
			bookmarks: bookmarksCount,
			createdAt: toIso(photo.createdAt),
			updatedAt: toIso(photo.updatedAt),
			...(metadata
				? {
						metadata: {
							exif: metadata.exif ?? undefined,
							format: metadata.format ?? undefined,
							height: metadata.height ?? undefined,
							size: metadata.size ?? undefined,
							uploadedAt: toIso(metadata.uploadedAt),
							width: metadata.width ?? undefined,
						},
					}
				: {}),
		};
	}

	private async getUsersByIds(
		userIds: string[]
	): Promise<Map<string, PhotoUser>> {
		const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
		const usersById = new Map<string, PhotoUser>();
		if (uniqueUserIds.length === 0) {
			return usersById;
		}

		const userRows = await db
			.select({
				avatarUrl: users.avatarUrl,
				userId: users.userId,
				username: users.username,
			})
			.from(users)
			.where(inArray(users.userId, uniqueUserIds));

		for (const user of userRows) {
			usersById.set(user.userId, user);
		}

		return usersById;
	}

	private async mapPhotosToResponseDtos(
		photoRows: PhotoRow[]
	): Promise<PhotoResponseDto[]> {
		const photoIds = photoRows.map((photo) => photo.photoId);
		const usersById = await this.getUsersByIds(
			photoRows
				.map((photo) => photo.userId)
				.filter((value): value is string => Boolean(value))
		);
		const bookmarkCountByPhotoId =
			await this.countBookmarksByPhotoIds(photoIds);
		return photoRows.map((photo) =>
			this.serializePhoto(
				photo,
				bookmarkCountByPhotoId.get(photo.photoId) ?? 0,
				photo.userId ? usersById.get(photo.userId) : null
			)
		);
	}

	private async getPhotosByIdsInOrder(photoIds: string[]): Promise<PhotoRow[]> {
		if (photoIds.length === 0) {
			return [];
		}

		const photoRows = await db
			.select()
			.from(photos)
			.where(
				and(
					inArray(photos.photoId, photoIds),
					eq(photos.processingStatus, "ready")
				)
			);

		const orderByPhotoId = new Map(photoIds.map((id, index) => [id, index]));
		photoRows.sort(
			(a, b) =>
				(orderByPhotoId.get(a.photoId) ?? Number.MAX_SAFE_INTEGER) -
				(orderByPhotoId.get(b.photoId) ?? Number.MAX_SAFE_INTEGER)
		);

		return photoRows;
	}

	private buildFilterWhere(filters?: string[]) {
		if (!(filters && filters.length > 0)) {
			return;
		}
		const conditions = filters.flatMap((filter) => {
			const needle = `%${filter}%`;
			return [
				ilike(photos.camera, needle),
				ilike(photos.category, needle),
				ilike(photos.style, needle),
				ilike(photos.color, needle),
			];
		});
		return or(...conditions);
	}

	private buildPhotoCursorWhere(
		sort: "oldest" | "popular" | "recent",
		cursor?: string
	) {
		const decodedCursor = decodeTimestampCursor(cursor);
		if (!(decodedCursor && sort !== "popular")) {
			return;
		}

		if (sort === "oldest") {
			return or(
				gt(photos.createdAt, decodedCursor.timestamp),
				and(
					eq(photos.createdAt, decodedCursor.timestamp),
					gt(photos.photoId, decodedCursor.id)
				)
			);
		}

		return or(
			lt(photos.createdAt, decodedCursor.timestamp),
			and(
				eq(photos.createdAt, decodedCursor.timestamp),
				lt(photos.photoId, decodedCursor.id)
			)
		);
	}

	private buildBookmarkCursorWhere(cursor?: string) {
		const decodedCursor = decodeTimestampCursor(cursor);
		if (!decodedCursor) {
			return;
		}

		return or(
			lt(bookmarks.createdAt, decodedCursor.timestamp),
			and(
				eq(bookmarks.createdAt, decodedCursor.timestamp),
				lt(bookmarks.bookmarkId, decodedCursor.id)
			)
		);
	}

	async list(query: ListPhotosQueryDto): Promise<ListPhotosResult> {
		const from = (query.page - 1) * query.limit;
		const filterWhereClause = this.buildFilterWhere(query.filters);
		const cursorWhereClause = this.buildPhotoCursorWhere(
			query.sort,
			query.cursor
		);
		const ownerWhereClause = query.userId
			? eq(photos.userId, query.userId)
			: undefined;
		const whereClause = and(
			...(
				[
					eq(photos.processingStatus, "ready"),
					filterWhereClause,
					ownerWhereClause,
					cursorWhereClause,
				] as const
			).filter(Boolean)
		);
		let photoRows: PhotoRow[] = [];
		let nextCursor: string | undefined;

		if (query.sort === "popular") {
			const popularRows = await db
				.select({
					photoId: photos.photoId,
				})
				.from(photos)
				.leftJoin(bookmarks, eq(bookmarks.photoId, photos.photoId))
				.where(whereClause)
				.groupBy(photos.photoId)
				.orderBy(desc(count(bookmarks.bookmarkId)), desc(photos.createdAt))
				.limit(query.limit)
				.offset(from);

			const orderedPhotoIds = popularRows.map((row) => row.photoId);
			photoRows = await this.getPhotosByIdsInOrder(orderedPhotoIds);
		} else {
			photoRows = await db
				.select()
				.from(photos)
				.where(whereClause)
				.orderBy(
					...(query.sort === "oldest"
						? [asc(photos.createdAt), asc(photos.photoId)]
						: [desc(photos.createdAt), desc(photos.photoId)])
				)
				.limit(query.limit + 1);

			const hasMore = photoRows.length > query.limit;
			if (hasMore) {
				photoRows = photoRows.slice(0, query.limit);
			}

			const lastPhoto = photoRows.at(-1);
			nextCursor = hasMore
				? encodeTimestampCursor(
						lastPhoto?.createdAt ?? null,
						lastPhoto?.photoId ?? ""
					)
				: undefined;
		}

		const [countRow] = await db
			.select({ total: count() })
			.from(photos)
			.where(whereClause);

		const photosResult = await this.mapPhotosToResponseDtos(photoRows);
		return {
			nextCursor,
			photos: photosResult,
			total: Number(countRow?.total ?? 0),
		};
	}

	async getById(id: string): Promise<PhotoResponseDto | null> {
		const [row] = await db
			.select()
			.from(photos)
			.where(and(eq(photos.photoId, id), eq(photos.processingStatus, "ready")))
			.limit(1);
		if (!row) {
			return null;
		}

		const bookmarkCountByPhotoId = await this.countBookmarksByPhotoIds([id]);
		const [metadata] = await db
			.select()
			.from(photoMetadata)
			.where(eq(photoMetadata.photoMetadataId, id))
			.limit(1);
		const usersById = await this.getUsersByIds(row.userId ? [row.userId] : []);
		return this.serializePhoto(
			row,
			bookmarkCountByPhotoId.get(id) ?? 0,
			row.userId ? usersById.get(row.userId) : null,
			metadata
		);
	}

	async getOwnerId(id: string): Promise<string | null> {
		const [row] = await db
			.select({ userId: photos.userId })
			.from(photos)
			.where(eq(photos.photoId, id))
			.limit(1);
		return row?.userId ?? null;
	}

	async getUploadStatus(id: string): Promise<PhotoUploadStatusDto | null> {
		const [row] = await db
			.select()
			.from(photos)
			.where(eq(photos.photoId, id))
			.limit(1);
		if (!row) {
			return null;
		}

		const [metadata] = await db
			.select()
			.from(photoMetadata)
			.where(eq(photoMetadata.photoMetadataId, id))
			.limit(1);

		return {
			metadata: metadata
				? {
						exif: metadata.exif ?? undefined,
						format: metadata.format ?? undefined,
						height: metadata.height ?? undefined,
						size: metadata.size ?? undefined,
						uploadedAt: metadata.uploadedAt,
						width: metadata.width ?? undefined,
					}
				: undefined,
			photoId: row.photoId,
			processingError: row.processingError,
			processingStatus: row.processingStatus,
			url: row.processingStatus === "ready" ? row.url : undefined,
			userId: row.userId,
		};
	}

	async deleteById(id: string): Promise<void> {
		await db.delete(photos).where(eq(photos.photoId, id));
	}

	async exists(id: string): Promise<boolean> {
		const [row] = await db
			.select({ id: photos.photoId })
			.from(photos)
			.where(eq(photos.photoId, id))
			.limit(1);
		return Boolean(row);
	}

	async markProcessingReady(
		id: string,
		payload: MarkPhotoProcessingReadyDto
	): Promise<void> {
		await db
			.update(photos)
			.set({
				processedAt: new Date(),
				processingError: null,
				processingStatus: "ready",
				publicId: payload.publicId,
				updatedAt: new Date(),
				url: payload.url,
			})
			.where(eq(photos.photoId, id));

		await db
			.insert(photoMetadata)
			.values({
				format: payload.format,
				height: payload.height,
				photoMetadataId: id,
				size: payload.size,
				uploadedAt: payload.uploadedAt,
				width: payload.width,
			})
			.onConflictDoUpdate({
				target: photoMetadata.photoMetadataId,
				set: {
					format: payload.format,
					height: payload.height,
					size: payload.size,
					uploadedAt: payload.uploadedAt,
					width: payload.width,
				},
			});
	}

	async markProcessingFailed(id: string, error: string): Promise<void> {
		await db
			.update(photos)
			.set({
				processedAt: new Date(),
				processingError: error,
				processingStatus: "failed",
				updatedAt: new Date(),
			})
			.where(eq(photos.photoId, id));
	}

	async listByIds(
		ids: string[],
		page: number,
		limit: number
	): Promise<ListPhotosResult> {
		if (ids.length === 0) {
			return {
				photos: [],
				total: 0,
			};
		}

		const from = (page - 1) * limit;
		const whereClause = and(
			inArray(photos.photoId, ids),
			eq(photos.processingStatus, "ready")
		);

		const photoRows = await db
			.select()
			.from(photos)
			.where(whereClause)
			.orderBy(desc(photos.createdAt))
			.limit(limit)
			.offset(from);
		const [countRow] = await db
			.select({ total: count() })
			.from(photos)
			.where(whereClause);

		const photosResult = await this.mapPhotosToResponseDtos(photoRows);
		return {
			photos: photosResult,
			total: Number(countRow?.total ?? 0),
		};
	}

	async listBookmarkedByUser(
		userId: string,
		page: number,
		limit: number,
		cursor?: string
	): Promise<ListPhotosResult> {
		const from = (page - 1) * limit;
		const cursorWhereClause = this.buildBookmarkCursorWhere(cursor);
		const whereClause = and(
			...([eq(bookmarks.userId, userId), cursorWhereClause] as const).filter(
				Boolean
			)
		);

		const bookmarkRows = await db
			.select({
				bookmarkId: bookmarks.bookmarkId,
				createdAt: bookmarks.createdAt,
				photoId: bookmarks.photoId,
			})
			.from(bookmarks)
			.where(whereClause)
			.orderBy(desc(bookmarks.createdAt), desc(bookmarks.bookmarkId))
			.limit(cursor ? limit + 1 : limit)
			.offset(cursor ? 0 : from);
		const [countRow] = await db
			.select({ total: count() })
			.from(bookmarks)
			.where(eq(bookmarks.userId, userId));
		const hasMore = bookmarkRows.length > limit;
		const visibleBookmarkRows = hasMore
			? bookmarkRows.slice(0, limit)
			: bookmarkRows;

		const photoIds = visibleBookmarkRows
			.map((row) => row.photoId)
			.filter((value): value is string => Boolean(value));
		const lastBookmark = visibleBookmarkRows.at(-1);
		const nextCursor = hasMore
			? encodeTimestampCursor(
					lastBookmark?.createdAt ?? null,
					lastBookmark?.bookmarkId ?? ""
				)
			: undefined;
		if (photoIds.length === 0) {
			return {
				nextCursor,
				photos: [],
				total: Number(countRow?.total ?? 0),
			};
		}

		const photoRows = await this.getPhotosByIdsInOrder(photoIds);

		const photosResult = await this.mapPhotosToResponseDtos(photoRows);
		return {
			nextCursor,
			photos: photosResult,
			total: Number(countRow?.total ?? photosResult.length),
		};
	}
}
