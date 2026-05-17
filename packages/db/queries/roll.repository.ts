import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type {
	RollCreateDto,
	RollRepositoryInterface,
	RollResponseDto,
	RollUpdateDto,
} from "../schemas/rolls";
import { rollPhotos, rolls } from "../schemas/rolls";
import db from "../src/db";

type RollRow = typeof rolls.$inferSelect;
const DEFAULT_ROLL_IMAGE = "/images/image6.JPG";

const toIso = (value: Date | null): string | undefined =>
	value ? value.toISOString() : undefined;

export class RollRepository implements RollRepositoryInterface {
	private async getPhotoIdsByRollIds(
		rollIds: string[]
	): Promise<Map<string, string[]>> {
		const photoIdsByRollId = new Map<string, string[]>();
		for (const rollId of rollIds) {
			photoIdsByRollId.set(rollId, []);
		}
		if (rollIds.length === 0) {
			return photoIdsByRollId;
		}

		const rows = await db
			.select({
				photoId: rollPhotos.photoId,
				rollId: rollPhotos.rollId,
			})
			.from(rollPhotos)
			.where(inArray(rollPhotos.rollId, rollIds));

		for (const row of rows) {
			if (!(row.rollId && row.photoId)) {
				continue;
			}
			const existing = photoIdsByRollId.get(row.rollId) ?? [];
			existing.push(row.photoId);
			photoIdsByRollId.set(row.rollId, existing);
		}

		return photoIdsByRollId;
	}

	private mapToRollResponseDto(
		roll: RollRow,
		photoIds: string[]
	): RollResponseDto {
		return {
			rollId: roll.rollId,
			userId: roll.userId ?? "",
			name: roll.name,
			description: roll.description ?? "",
			imageUrl: roll.imageUrl ?? DEFAULT_ROLL_IMAGE,
			photos: photoIds,
			createdAt: toIso(roll.createdAt),
			updatedAt: toIso(roll.updatedAt),
		};
	}

	async create(payload: RollCreateDto): Promise<RollResponseDto> {
		const [created] = await db
			.insert(rolls)
			.values({
				description: payload.description ?? "",
				imageUrl: payload.imageUrl ?? DEFAULT_ROLL_IMAGE,
				name: payload.name,
				userId: payload.userId,
			})
			.returning();
		if (!created) {
			throw new Error("Failed to create roll");
		}

		return this.mapToRollResponseDto(created, []);
	}

	async getById(rollId: string): Promise<RollResponseDto | null> {
		const [row] = await db
			.select()
			.from(rolls)
			.where(eq(rolls.rollId, rollId))
			.limit(1);
		if (!row) {
			return null;
		}

		const photoIdsByRollId = await this.getPhotoIdsByRollIds([rollId]);
		return this.mapToRollResponseDto(row, photoIdsByRollId.get(rollId) ?? []);
	}

	async getDefaultByUserId(userId: string): Promise<RollResponseDto | null> {
		const [row] = await db
			.select()
			.from(rolls)
			.where(and(eq(rolls.userId, userId), eq(rolls.name, "All Photos")))
			.limit(1);
		if (!row) {
			return null;
		}

		const photoIdsByRollId = await this.getPhotoIdsByRollIds([row.rollId]);
		return this.mapToRollResponseDto(
			row,
			photoIdsByRollId.get(row.rollId) ?? []
		);
	}

	async listContainingPhoto(
		userId: string,
		photoId: string
	): Promise<Array<{ name: string; rollId: string }>> {
		const userRolls = await db
			.select({
				name: rolls.name,
				rollId: rolls.rollId,
			})
			.from(rolls)
			.where(eq(rolls.userId, userId));
		if (userRolls.length === 0) {
			return [];
		}

		const rollIds = userRolls.map((roll) => roll.rollId);
		const links = await db
			.select({
				rollId: rollPhotos.rollId,
			})
			.from(rollPhotos)
			.where(
				and(
					eq(rollPhotos.photoId, photoId),
					inArray(rollPhotos.rollId, rollIds)
				)
			);

		const linkedRollIds = new Set(
			links
				.map((link) => link.rollId)
				.filter((value): value is string => Boolean(value))
		);
		return userRolls
			.filter((roll) => linkedRollIds.has(roll.rollId))
			.map((roll) => ({
				rollId: roll.rollId,
				name: roll.name,
			}));
	}

	async listByUserId(
		userId: string,
		sort: "latest" | "oldest"
	): Promise<RollResponseDto[]> {
		const rollRows = await db
			.select()
			.from(rolls)
			.where(eq(rolls.userId, userId))
			.orderBy(
				sort === "oldest" ? asc(rolls.createdAt) : desc(rolls.createdAt)
			);

		const rollIds = rollRows.map((roll) => roll.rollId);
		const photoIdsByRollId = await this.getPhotoIdsByRollIds(rollIds);
		return rollRows.map((roll) =>
			this.mapToRollResponseDto(roll, photoIdsByRollId.get(roll.rollId) ?? [])
		);
	}

	async addPhotoToRoll(rollId: string, photoId: string): Promise<number> {
		const [roll] = await db
			.select({ id: rolls.rollId })
			.from(rolls)
			.where(eq(rolls.rollId, rollId))
			.limit(1);
		if (!roll) {
			return 0;
		}

		const inserted = await db
			.insert(rollPhotos)
			.values({
				photoId,
				rollId,
			})
			.onConflictDoNothing({
				target: [rollPhotos.rollId, rollPhotos.photoId],
			})
			.returning({ rollId: rollPhotos.rollId });

		return inserted.length;
	}

	async removePhotoFromRoll(rollId: string, photoId: string): Promise<void> {
		await db
			.delete(rollPhotos)
			.where(
				and(eq(rollPhotos.rollId, rollId), eq(rollPhotos.photoId, photoId))
			);
	}

	async update(
		rollId: string,
		payload: RollUpdateDto
	): Promise<RollResponseDto | null> {
		const updateData: {
			description?: string;
			imageUrl?: string;
			name?: string;
		} = {};
		if (payload.description !== undefined) {
			updateData.description = payload.description;
		}
		if (payload.imageUrl !== undefined) {
			updateData.imageUrl = payload.imageUrl;
		}
		if (payload.name !== undefined) {
			updateData.name = payload.name;
		}

		const [updated] = await db
			.update(rolls)
			.set(updateData)
			.where(eq(rolls.rollId, rollId))
			.returning();
		if (!updated) {
			return null;
		}

		const photoIdsByRollId = await this.getPhotoIdsByRollIds([rollId]);
		return this.mapToRollResponseDto(
			updated,
			photoIdsByRollId.get(rollId) ?? []
		);
	}

	async deleteById(rollId: string): Promise<RollResponseDto | null> {
		const existing = await this.getById(rollId);
		if (!existing) {
			return null;
		}

		await db.delete(rolls).where(eq(rolls.rollId, rollId));
		return existing;
	}
}
