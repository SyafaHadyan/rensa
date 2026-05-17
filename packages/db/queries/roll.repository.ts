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
    roll_ids: string[],
  ): Promise<Map<string, string[]>> {
    const photo_idsByRollId = new Map<string, string[]>();
    for (const roll_id of roll_ids) {
      photo_idsByRollId.set(roll_id, []);
    }
    if (roll_ids.length === 0) {
      return photo_idsByRollId;
    }

    const rows = await db
      .select({
        photo_id: rollPhotos.photo_id,
        roll_id: rollPhotos.roll_id,
      })
      .from(rollPhotos)
      .where(inArray(rollPhotos.roll_id, roll_ids));

    for (const row of rows) {
      if (!(row.roll_id && row.photo_id)) {
        continue;
      }
      const existing = photo_idsByRollId.get(row.roll_id) ?? [];
      existing.push(row.photo_id);
      photo_idsByRollId.set(row.roll_id, existing);
    }

    return photo_idsByRollId;
  }

  private mapToRollResponseDto(
    roll: RollRow,
    photo_ids: string[],
  ): RollResponseDto {
    return {
      roll_id: roll.roll_id,
      user_id: roll.user_id ?? "",
      name: roll.name,
      description: roll.description ?? "",
      image_url: roll.image_url ?? DEFAULT_ROLL_IMAGE,
      photos: photo_ids,
      created_at: toIso(roll.created_at),
      updated_at: toIso(roll.updated_at),
    };
  }

  async create(payload: RollCreateDto): Promise<RollResponseDto> {
    const [created] = await db
      .insert(rolls)
      .values({
        description: payload.description ?? "",
        image_url: payload.image_url ?? DEFAULT_ROLL_IMAGE,
        name: payload.name,
        user_id: payload.user_id,
      })
      .returning();
    if (!created) {
      throw new Error("Failed to create roll");
    }

    return this.mapToRollResponseDto(created, []);
  }

  async getById(roll_id: string): Promise<RollResponseDto | null> {
    const [row] = await db
      .select()
      .from(rolls)
      .where(eq(rolls.roll_id, roll_id))
      .limit(1);
    if (!row) {
      return null;
    }

    const photo_idsByRollId = await this.getPhotoIdsByRollIds([roll_id]);
    return this.mapToRollResponseDto(row, photo_idsByRollId.get(roll_id) ?? []);
  }

  async getDefaultByUserId(user_id: string): Promise<RollResponseDto | null> {
    const [row] = await db
      .select()
      .from(rolls)
      .where(and(eq(rolls.user_id, user_id), eq(rolls.name, "All Photos")))
      .limit(1);
    if (!row) {
      return null;
    }

    const photo_idsByRollId = await this.getPhotoIdsByRollIds([row.roll_id]);
    return this.mapToRollResponseDto(
      row,
      photo_idsByRollId.get(row.roll_id) ?? [],
    );
  }

  async listContainingPhoto(
    user_id: string,
    photo_id: string,
  ): Promise<Array<SelectedRoll>> {
    const userRolls = await db
      .select({
        name: rolls.name,
        roll_id: rolls.roll_id,
      })
      .from(rolls)
      .where(eq(rolls.user_id, user_id));
    if (userRolls.length === 0) {
      return [];
    }

    const roll_ids = userRolls.map((roll) => roll.roll_id);
    const links = await db
      .select({
        roll_id: rollPhotos.roll_id,
      })
      .from(rollPhotos)
      .where(
        and(
          eq(rollPhotos.photo_id, photo_id),
          inArray(rollPhotos.roll_id, roll_ids),
        ),
      );

    const linkedRollIds = new Set(
      links
        .map((link) => link.roll_id)
        .filter((value): value is string => Boolean(value)),
    );
    return userRolls
      .filter((roll) => linkedRollIds.has(roll.roll_id))
      .map((roll) => ({
        roll_id: roll.roll_id,
        name: roll.name,
      }));
  }

  async listByUserId(
    user_id: string,
    sort: "latest" | "oldest",
  ): Promise<RollResponseDto[]> {
    const rollRows = await db
      .select()
      .from(rolls)
      .where(eq(rolls.user_id, user_id))
      .orderBy(
        sort === "oldest" ? asc(rolls.created_at) : desc(rolls.created_at),
      );

    const roll_ids = rollRows.map((roll) => roll.roll_id);
    const photo_idsByRollId = await this.getPhotoIdsByRollIds(roll_ids);
    return rollRows.map((roll) =>
      this.mapToRollResponseDto(
        roll,
        photo_idsByRollId.get(roll.roll_id) ?? [],
      ),
    );
  }

  async addPhotoToRoll(roll_id: string, photo_id: string): Promise<number> {
    const [roll] = await db
      .select({ id: rolls.roll_id })
      .from(rolls)
      .where(eq(rolls.roll_id, roll_id))
      .limit(1);
    if (!roll) {
      return 0;
    }

    await db
      .insert(rollPhotos)
      .values({
        photo_id,
        roll_id,
      })
      .onConflictDoNothing({
        target: [rollPhotos.roll_id, rollPhotos.photo_id],
      });

    return 1;
  }

  async removePhotoFromRoll(roll_id: string, photo_id: string): Promise<void> {
    await db
      .delete(rollPhotos)
      .where(
        and(eq(rollPhotos.roll_id, roll_id), eq(rollPhotos.photo_id, photo_id)),
      );
  }

  async update(
    roll_id: string,
    payload: RollUpdateDto,
  ): Promise<RollResponseDto | null> {
    const updateData: {
      description?: string;
      image_url?: string;
      name?: string;
    } = {};
    if (payload.description !== undefined) {
      updateData.description = payload.description;
    }
    if (payload.image_url !== undefined) {
      updateData.image_url = payload.image_url;
    }
    if (payload.name !== undefined) {
      updateData.name = payload.name;
    }

    const [updated] = await db
      .update(rolls)
      .set(updateData)
      .where(eq(rolls.roll_id, roll_id))
      .returning();
    if (!updated) {
      return null;
    }

    const photo_idsByRollId = await this.getPhotoIdsByRollIds([roll_id]);
    return this.mapToRollResponseDto(
      updated,
      photo_idsByRollId.get(roll_id) ?? [],
    );
  }

  async deleteById(roll_id: string): Promise<RollResponseDto | null> {
    const existing = await this.getById(roll_id);
    if (!existing) {
      return null;
    }

    await db.delete(rolls).where(eq(rolls.roll_id, roll_id));
    return existing;
  }
}
