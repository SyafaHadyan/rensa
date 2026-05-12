import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { photos } from "./photos";
import { users } from "./users";

export const comments = pgTable(
  "comments",
  {
    commentId: uuid("comment_id").primaryKey().defaultRandom(),
    photoId: uuid("photo_id").references(() => photos.photoId, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id").references(() => users.userId, {
      onDelete: "cascade",
    }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_comments_photo").on(table.photoId),
    index("idx_comments_user").on(table.userId),
  ],
);

export interface CommentResponseDto {
  comment_id: string;
  createdAt?: string;
  photoId: string;
  text: string;
  updatedAt?: string;
  userId:
    | string
    | {
        avatarUrl?: string;
        id: string;
        username: string;
      };
}

export interface CreateCommentDto {
  text: string;
  userId?: string;
}

export interface ListCommentsResult {
  comments: CommentResponseDto[];
  total: number;
}

export interface CommentRepositoryInterface {
  create(params: {
    photoId: string;
    text: string;
    userId: string;
  }): Promise<CommentResponseDto>;
  listByPhotoId(params: {
    limit: number;
    offset: number;
    photoId: string;
  }): Promise<ListCommentsResult>;
}
