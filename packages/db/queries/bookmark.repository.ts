import { and, count, eq } from "drizzle-orm";
import type { BookmarkRepositoryInterface } from "../schemas/bookmarks";
import { bookmarks } from "../schemas/bookmarks";
import db from "../src/db";

export class BookmarkRepository implements BookmarkRepositoryInterface {
  async add(userId: string, photoId: string): Promise<boolean> {
    const inserted = await db
      .insert(bookmarks)
      .values({
        photoId,
        userId,
      })
      .onConflictDoNothing({
        target: [bookmarks.photoId, bookmarks.userId],
      })
      .returning({ bookmarkId: bookmarks.bookmarkId });

    return inserted.length > 0;
  }

  async countByPhotoId(photoId: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(bookmarks)
      .where(eq(bookmarks.photoId, photoId));

    return Number(row?.total ?? 0);
  }

  async exists(userId: string, photoId: string): Promise<boolean> {
    const [row] = await db
      .select({ bookmarkId: bookmarks.bookmarkId })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.photoId, photoId)))
      .limit(1);

    return Boolean(row);
  }

  async remove(userId: string, photoId: string): Promise<void> {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.photoId, photoId)));
  }
}
