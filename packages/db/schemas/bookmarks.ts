import { index, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { photos } from "./photos";
import { users } from "./users";

export const bookmarks = pgTable(
	"bookmarks",
	{
		bookmarkId: uuid("bookmark_id").primaryKey().defaultRandom(),
		photoId: uuid("photo_id").references(() => photos.photoId, {
			onDelete: "cascade",
		}),
		userId: uuid("user_id").references(() => users.userId, {
			onDelete: "cascade",
		}),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [
		unique("bookmarks_photo_id_user_id_unique").on(table.photoId, table.userId),
		index("idx_bookmarks_photo").on(table.photoId),
	]
);

export interface BookmarkActionDto {
	action: "add" | "remove";
}

export interface BookmarkStatusDto {
	bookmarkCount: number;
	isBookmarked: boolean;
}

export interface BookmarkRepositoryInterface {
	add(userId: string, photoId: string): Promise<boolean>;
	countByPhotoId(photoId: string): Promise<number>;
	exists(userId: string, photoId: string): Promise<boolean>;
	remove(userId: string, photoId: string): Promise<void>;
}
