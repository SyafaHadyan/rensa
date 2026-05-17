import { count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { bookmarks } from "../schemas/bookmarks";
import type {
  CreateUploadedPhotoDto,
  ListPhotosQueryDto,
  ListPhotosResult,
  PhotoRepositoryInterface,
  PhotoResponseDto,
  UploadedPhotoDto,
} from "../schemas/photos";
import { photoMetadata, photos } from "../schemas/photos";
import db from "../src/db";

type PhotoRow = typeof photos.$inferSelect;
type PhotoMetadataRow = typeof photoMetadata.$inferSelect;

const toIso = (value: Date | null): string | undefined =>
  value ? value.toISOString() : undefined;

export class PhotoRepository implements PhotoRepositoryInterface {
  async createUploadedPhoto(
    payload: CreateUploadedPhotoDto,
  ): Promise<UploadedPhotoDto> {
    const [photo] = await db
      .insert(photos)
      .values({
        camera: payload.camera,
        category: payload.category,
        color: payload.color,
        description: payload.description,
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

  private async countBookmarksByPhotoIds(
    photoIds: string[],
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

  private serilizePhoto(
    photo: PhotoRow,
    bookmarksCount: number,
    metadata?: PhotoMetadataRow | null,
  ): PhotoResponseDto {
    return {
      photo_id: photo.photoId,
      url: photo.url,
      user: {
        user_id: photo.userId as string,
        username: "", // Placeholder, as username is not available in this context
        avatar_url: "", // Placeholder, as avatar URL is not available in this context
      },
      title: photo.title,
      description: photo.description ?? "",
      category: photo.category ?? "",
      style: photo.style ?? "",
      color: photo.color ?? "",
      camera: photo.camera ?? "",
      bookmarks: bookmarksCount,
      created_at: toIso(photo.createdAt),
      updated_at: toIso(photo.updatedAt),
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

  private async mapPhotosToResponseDtos(
    photoRows: PhotoRow[],
  ): Promise<PhotoResponseDto[]> {
    const photoIds = photoRows.map((photo) => photo.photoId);
    const bookmarkCountByPhotoId =
      await this.countBookmarksByPhotoIds(photoIds);
    return photoRows.map((photo) =>
      this.serilizePhoto(photo, bookmarkCountByPhotoId.get(photo.photoId) ?? 0),
    );
  }

  private async getPhotosByIdsInOrder(photoIds: string[]): Promise<PhotoRow[]> {
    if (photoIds.length === 0) {
      return [];
    }

    const photoRows = await db
      .select()
      .from(photos)
      .where(inArray(photos.photoId, photoIds));

    const orderByPhotoId = new Map(photoIds.map((id, index) => [id, index]));
    photoRows.sort(
      (a, b) =>
        (orderByPhotoId.get(a.photoId) ?? Number.MAX_SAFE_INTEGER) -
        (orderByPhotoId.get(b.photoId) ?? Number.MAX_SAFE_INTEGER),
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
        ilike(photos.category, needle),
        ilike(photos.style, needle),
        ilike(photos.color, needle),
      ];
    });
    return or(...conditions);
  }

  async list(query: ListPhotosQueryDto): Promise<ListPhotosResult> {
    const from = (query.page - 1) * query.limit;
    const whereClause = this.buildFilterWhere(query.filters);
    let photoRows: PhotoRow[] = [];

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
        .orderBy(desc(photos.createdAt))
        .limit(query.limit)
        .offset(from);
    }

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

  async getById(id: string): Promise<PhotoResponseDto | null> {
    const [row] = await db
      .select()
      .from(photos)
      .where(eq(photos.photoId, id))
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
    return this.serilizePhoto(
      row,
      bookmarkCountByPhotoId.get(id) ?? 0,
      metadata,
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

  async listByIds(
    ids: string[],
    page: number,
    limit: number,
  ): Promise<ListPhotosResult> {
    if (ids.length === 0) {
      return {
        photos: [],
        total: 0,
      };
    }

    const from = (page - 1) * limit;
    const whereClause = inArray(photos.photoId, ids);

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
  ): Promise<ListPhotosResult> {
    const from = (page - 1) * limit;

    const bookmarkRows = await db
      .select({ photoId: bookmarks.photoId })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit)
      .offset(from);
    const [countRow] = await db
      .select({ total: count() })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    const photoIds = bookmarkRows
      .map((row) => row.photoId)
      .filter((value): value is string => Boolean(value));
    if (photoIds.length === 0) {
      return {
        photos: [],
        total: Number(countRow?.total ?? 0),
      };
    }

    const photoRows = await this.getPhotosByIdsInOrder(photoIds);

    const photosResult = await this.mapPhotosToResponseDtos(photoRows);
    return {
      photos: photosResult,
      total: Number(countRow?.total ?? photosResult.length),
    };
  }
}
