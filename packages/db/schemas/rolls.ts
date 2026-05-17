import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { photos } from "./photos";
import { users } from "./users";

export const rolls = pgTable(
  "rolls",
  {
    roll_id: uuid("roll_id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => users.user_id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    description: text("description"),
    image_url: text("image_url"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_rolls_user").on(table.user_id)],
);

export const rollPhotos = pgTable(
  "roll_photos",
  {
    roll_id: uuid("roll_id").references(() => rolls.roll_id, {
      onDelete: "cascade",
    }),
    photo_id: uuid("photo_id").references(() => photos.photo_id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.roll_id, table.photo_id] })],
);

interface Passthrough {
  [key: string]: unknown;
}

export interface RollCreateDto {
  description?: string;
  image_url?: string;
  name: string;
  user_id: string;
}

export interface RollUpdateDto {
  description?: string;
  image_url?: string;
  name?: string;
}

export interface ListRollPhotosQueryDto {
  limit: number;
  page: number;
}

export interface RollResponseDto extends Passthrough {
  created_at?: string;
  description: string;
  image_url: string;
  name: string;
  photos: string[];
  roll_id: string;
  updated_at?: string;
  user_id: string;
}

export interface RollRepositoryInterface {
  addPhotoToRoll(rollId: string, photo_id: string): Promise<number>;
  create(payload: RollCreateDto): Promise<RollResponseDto>;
  deleteById(rollId: string): Promise<RollResponseDto | null>;
  getById(rollId: string): Promise<RollResponseDto | null>;
  getDefaultByUserId(userId: string): Promise<RollResponseDto | null>;
  listByUserId(
    userId: string,
    sort: "latest" | "oldest",
  ): Promise<RollResponseDto[]>;
  listContainingPhoto(
    userId: string,
    photo_id: string,
  ): Promise<Array<{ name: string; roll_id: string }>>;
  removePhotoFromRoll(rollId: string, photo_id: string): Promise<void>;
  update(
    rollId: string,
    payload: RollUpdateDto,
  ): Promise<RollResponseDto | null>;
}
