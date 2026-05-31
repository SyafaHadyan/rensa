CREATE INDEX IF NOT EXISTS "idx_photos_created_photo_id" ON "photos" ("created_at" DESC, "photo_id" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_photos_user_created_photo_id" ON "photos" ("user_id", "created_at" DESC, "photo_id" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookmarks_user_created_bookmark_id" ON "bookmarks" ("user_id", "created_at" DESC, "bookmark_id" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_comments_photo_created_comment_id" ON "comments" ("photo_id", "created_at" ASC, "comment_id" ASC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_recipient_read_created_id_idx" ON "notifications" ("recipient_id", "read", "created_at" DESC, "notification_id" DESC);
