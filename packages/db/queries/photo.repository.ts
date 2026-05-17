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
import { users } from "../schemas/users";
import db from "../src/db";

type PhotoRow = typeof photos.$inferSelect;
type PhotoMetadataRow = typeof photoMetadata.$inferSelect;
type PhotoUser = Pick<
  typeof users.$inferSelect,
  "avatar" | "user_id" | "username"
>;

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
        user_id: payload.user_id,
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
      payload.uploaded_at !== undefined ||
      payload.exif !== undefined
    ) {
      await db
        .insert(photoMetadata)
        .values({
          exif: payload.exif,
          format: payload.format,
          height: payload.height,
          photo_metadata_id: photo.photo_id,
          size: payload.size,
          uploaded_at: payload.uploaded_at,
          width: payload.width,
        })
        .onConflictDoUpdate({
          target: photoMetadata.photo_metadata_id,
          set: {
            exif: payload.exif,
            format: payload.format,
            height: payload.height,
            size: payload.size,
            uploaded_at: payload.uploaded_at,
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
      uploaded_at: payload.uploaded_at,
      width: payload.width,
    };
  }

  private async countBookmarksByPhotoIds(
    photoIds: string[],
  ): Promise<Map<string, number>> {
    const bookmarkCountByPhotoId = new Map<string, number>();
    for (const photo_id of photoIds) {
      bookmarkCountByPhotoId.set(photo_id, 0);
    }
    if (photoIds.length === 0) {
      return bookmarkCountByPhotoId;
    }

    const rows = await db
      .select({
        count: count(bookmarks.photo_id),
        photo_id: bookmarks.photo_id,
      })
      .from(bookmarks)
      .where(inArray(bookmarks.photo_id, photoIds))
      .groupBy(bookmarks.photo_id);

    for (const row of rows) {
      if (!row.photo_id) {
        continue;
      }
      bookmarkCountByPhotoId.set(row.photo_id, Number(row.count));
    }

    return bookmarkCountByPhotoId;
  }

  private serializePhoto(
    photo: PhotoRow,
    bookmarksCount: number,
    user?: PhotoUser | null,
    metadata?: PhotoMetadataRow | null,
  ): PhotoResponseDto {
    return {
      photo_id: photo.photo_id,
      url: photo.url,
      user: {
        user_id: photo.user_id as string,
        username: user?.username ?? "",
        avatar_url: user?.avatar ?? "",
      },
      title: photo.title,
      description: photo.description ?? "",
      category: photo.category ?? "",
      style: photo.style ?? "",
      color: photo.color ?? "",
      camera: photo.camera ?? "",
      bookmarks: bookmarksCount,
      created_at: toIso(photo.created_at),
      updated_at: toIso(photo.updated_at),
      ...(metadata
        ? {
            metadata: {
              exif: metadata.exif ?? undefined,
              format: metadata.format ?? undefined,
              height: metadata.height ?? undefined,
              size: metadata.size ?? undefined,
              uploaded_at: toIso(metadata.uploaded_at),
              width: metadata.width ?? undefined,
            },
          }
        : {}),
    };
  }

  private async getUsersByIds(
    userIds: string[],
  ): Promise<Map<string, PhotoUser>> {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
    const usersById = new Map<string, PhotoUser>();
    if (uniqueUserIds.length === 0) {
      return usersById;
    }

    const userRows = await db
      .select({
        avatar: users.avatar,
        user_id: users.user_id,
        username: users.username,
      })
      .from(users)
      .where(inArray(users.user_id, uniqueUserIds));

    for (const user of userRows) {
      usersById.set(user.user_id, user);
    }

    return usersById;
  }

  private async mapPhotosToResponseDtos(
    photoRows: PhotoRow[],
  ): Promise<PhotoResponseDto[]> {
    const photoIds = photoRows.map((photo) => photo.photo_id);
    const usersById = await this.getUsersByIds(
      photoRows
        .map((photo) => photo.user_id)
        .filter((value): value is string => Boolean(value)),
    );
    const bookmarkCountByPhotoId =
      await this.countBookmarksByPhotoIds(photoIds);
    return photoRows.map((photo) =>
      this.serializePhoto(
        photo,
        bookmarkCountByPhotoId.get(photo.photo_id) ?? 0,
        photo.user_id ? usersById.get(photo.user_id) : null,
      ),
    );
  }

  private async getPhotosByIdsInOrder(photoIds: string[]): Promise<PhotoRow[]> {
    if (photoIds.length === 0) {
      return [];
    }

    const photoRows = await db
      .select()
      .from(photos)
      .where(inArray(photos.photo_id, photoIds));

    const orderByPhotoId = new Map(photoIds.map((id, index) => [id, index]));
    photoRows.sort(
      (a, b) =>
        (orderByPhotoId.get(a.photo_id) ?? Number.MAX_SAFE_INTEGER) -
        (orderByPhotoId.get(b.photo_id) ?? Number.MAX_SAFE_INTEGER),
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
          photo_id: photos.photo_id,
        })
        .from(photos)
        .leftJoin(bookmarks, eq(bookmarks.photo_id, photos.photo_id))
        .where(whereClause)
        .groupBy(photos.photo_id)
        .orderBy(desc(count(bookmarks.bookmark_id)), desc(photos.created_at))
        .limit(query.limit)
        .offset(from);

      const orderedPhotoIds = popularRows.map((row) => row.photo_id);
      photoRows = await this.getPhotosByIdsInOrder(orderedPhotoIds);
    } else {
      photoRows = await db
        .select()
        .from(photos)
        .where(whereClause)
        .orderBy(desc(photos.created_at))
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
      .where(eq(photos.photo_id, id))
      .limit(1);
    if (!row) {
      return null;
    }

    const bookmarkCountByPhotoId = await this.countBookmarksByPhotoIds([id]);
    const [metadata] = await db
      .select()
      .from(photoMetadata)
      .where(eq(photoMetadata.photo_metadata_id, id))
      .limit(1);
    const usersById = await this.getUsersByIds(
      row.user_id ? [row.user_id] : [],
    );
    return this.serializePhoto(
      row,
      bookmarkCountByPhotoId.get(id) ?? 0,
      row.user_id ? usersById.get(row.user_id) : null,
      metadata,
    );
  }

  async getOwnerId(id: string): Promise<string | null> {
    const [row] = await db
      .select({ userId: photos.user_id })
      .from(photos)
      .where(eq(photos.photo_id, id))
      .limit(1);
    return row?.userId ?? null;
  }

  async deleteById(id: string): Promise<void> {
    await db.delete(photos).where(eq(photos.photo_id, id));
  }

  async exists(id: string): Promise<boolean> {
    const [row] = await db
      .select({ id: photos.photo_id })
      .from(photos)
      .where(eq(photos.photo_id, id))
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
    const whereClause = inArray(photos.photo_id, ids);

    const photoRows = await db
      .select()
      .from(photos)
      .where(whereClause)
      .orderBy(desc(photos.created_at))
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
      .select({ photo_id: bookmarks.photo_id })
      .from(bookmarks)
      .where(eq(bookmarks.user_id, userId))
      .orderBy(desc(bookmarks.created_at))
      .limit(limit)
      .offset(from);
    const [countRow] = await db
      .select({ total: count() })
      .from(bookmarks)
      .where(eq(bookmarks.user_id, userId));

    const photoIds = bookmarkRows
      .map((row) => row.photo_id)
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
