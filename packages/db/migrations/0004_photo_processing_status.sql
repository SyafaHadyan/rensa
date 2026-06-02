ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "processing_status" text DEFAULT 'ready' NOT NULL;
ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "processing_error" text;
ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "source_public_id" text;
ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "processed_at" timestamp with time zone;

UPDATE "photos"
SET "processing_status" = 'ready'
WHERE "processing_status" IS NULL;
