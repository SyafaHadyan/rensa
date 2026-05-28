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
		rollId: uuid("roll_id").primaryKey().defaultRandom(),
		userId: uuid("user_id").references(() => users.userId, {
			onDelete: "cascade",
		}),
		name: text("name").notNull(),
		description: text("description"),
		imageUrl: text("image_url"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [index("idx_rolls_user").on(table.userId)]
);

export const rollPhotos = pgTable(
	"roll_photos",
	{
		rollId: uuid("roll_id").references(() => rolls.rollId, {
			onDelete: "cascade",
		}),
		photoId: uuid("photo_id").references(() => photos.photoId, {
			onDelete: "cascade",
		}),
	},
	(table) => [primaryKey({ columns: [table.rollId, table.photoId] })]
);

interface Passthrough {
	[key: string]: unknown;
}

export interface RollCreateDto {
	description?: string;
	imageUrl?: string;
	name: string;
	userId: string;
}

export interface RollUpdateDto {
	description?: string;
	imageUrl?: string;
	name?: string;
}

export interface ListRollPhotosQueryDto {
	limit: number;
	page: number;
}

export interface RollResponseDto extends Passthrough {
	createdAt?: string;
	description: string;
	imageUrl: string;
	name: string;
	photos: string[];
	rollId: string;
	updatedAt?: string;
	userId: string;
}

export interface RollRepositoryInterface {
	addPhotoToRoll(rollId: string, photoId: string): Promise<number>;
	create(payload: RollCreateDto): Promise<RollResponseDto>;
	deleteById(rollId: string): Promise<RollResponseDto | null>;
	getById(rollId: string): Promise<RollResponseDto | null>;
	getDefaultByUserId(userId: string): Promise<RollResponseDto | null>;
	listByUserId(
		userId: string,
		sort: "latest" | "oldest"
	): Promise<RollResponseDto[]>;
	listContainingPhoto(
		userId: string,
		photoId: string
	): Promise<Array<{ name: string; rollId: string }>>;
	removePhotoFromRoll(rollId: string, photoId: string): Promise<void>;
	update(
		rollId: string,
		payload: RollUpdateDto
	): Promise<RollResponseDto | null>;
}
