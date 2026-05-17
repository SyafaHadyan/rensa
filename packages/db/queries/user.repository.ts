import { and, eq } from "drizzle-orm";
import { bookmarks } from "../schemas/bookmarks";
import {
  type UserProfileDto,
  type UserRegisterDto,
  type UserRepositoryInterface,
  type UserResponseDto,
  type UserWithPasswordResponseDto,
  users,
} from "../schemas/users";
import db from "../src/db";

const toIso = (value: Date | null): string | undefined =>
  value ? value.toISOString() : undefined;

export class UserRepository implements UserRepositoryInterface {
  private async getBookmarkPhotoIds(userId: string): Promise<string[]> {
    const rows = await db
      .select({ photoId: bookmarks.photoId })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    return rows
      .map((row) => row.photoId)
      .filter((value): value is string => Boolean(value));
  }

  async create(user: UserRegisterDto): Promise<UserResponseDto> {
    const [created] = await db
      .insert(users)
      .values({
        email: user.email,
        password: user.password,
        role: "user",
        username: user.username,
        verified: false,
      })
      .returning();
    if (!created) {
      throw new Error("Failed to create user");
    }

    return {
      avatar: created.avatar ?? "",
      bookmarks: await this.getBookmarkPhotoIds(created.userId),
      createdAt: toIso(created.createdAt),
      email: created.email,
      role: created.role ?? "user",
      updatedAt: toIso(created.updatedAt),
      user_id: created.userId,
      username: created.username,
      verified: created.verified ?? false,
    };
  }

  async getById(id: string): Promise<UserResponseDto | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.userId, id))
      .limit(1);
    if (!row) {
      return null;
    }

    return {
      avatar: row.avatar ?? "",
      bookmarks: await this.getBookmarkPhotoIds(id),
      createdAt: toIso(row.createdAt),
      email: row.email,
      role: row.role ?? "user",
      updatedAt: toIso(row.updatedAt),
      user_id: row.userId,
      username: row.username,
      verified: row.verified ?? false,
    };
  }

  async getByEmail(email: string): Promise<UserWithPasswordResponseDto | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!row) {
      return null;
    }

    return {
      avatar: row.avatar ?? "",
      bookmarks: await this.getBookmarkPhotoIds(row.userId),
      createdAt: toIso(row.createdAt),
      email: row.email,
      password: row.password,
      role: row.role ?? "user",
      updatedAt: toIso(row.updatedAt),
      user_id: row.userId,
      username: row.username,
      verified: row.verified ?? false,
    };
  }

  async getProfileById(id: string): Promise<UserProfileDto | null> {
    const [row] = await db
      .select({
        avatar: users.avatar,
        email: users.email,
        userId: users.userId,
        username: users.username,
      })
      .from(users)
      .where(eq(users.userId, id))
      .limit(1);
    if (!row) {
      return null;
    }

    return {
      avatar: row.avatar ?? undefined,
      email: row.email,
      id: row.userId,
      username: row.username,
    };
  }

  async updateProfile(params: {
    avatar: string;
    email: string;
    userId: string;
    username: string;
  }): Promise<UserProfileDto | null> {
    const [row] = await db
      .update(users)
      .set({
        avatar: params.avatar,
        email: params.email,
        updatedAt: new Date(),
        username: params.username,
      })
      .where(eq(users.userId, params.userId))
      .returning({
        avatar: users.avatar,
        email: users.email,
        userId: users.userId,
        username: users.username,
      });
    if (!row) {
      return null;
    }

    return {
      avatar: row.avatar ?? undefined,
      email: row.email,
      id: row.userId,
      username: row.username,
    };
  }

  async verifyEmail(email: string): Promise<boolean> {
    const [updated] = await db
      .update(users)
      .set({
        updatedAt: new Date(),
        verified: true,
      })
      .where(eq(users.email, email))
      .returning({ id: users.userId });

    return Boolean(updated);
  }

  async resetPassword(params: {
    email: string;
    password: string;
    userId: string;
  }): Promise<boolean> {
    const [updated] = await db
      .update(users)
      .set({
        password: params.password,
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(users.email, params.email), eq(users.userId, params.userId)),
      )
      .returning({ id: users.userId });

    return Boolean(updated);
  }

  async updateBookmarks(
    userId: string,
    photoId: string,
    action: "increment" | "decrement",
  ): Promise<UserResponseDto | null> {
    if (action === "increment") {
      await db
        .insert(bookmarks)
        .values({
          photoId,
          userId,
        })
        .onConflictDoNothing({
          target: [bookmarks.photoId, bookmarks.userId],
        });
    } else {
      await db
        .delete(bookmarks)
        .where(
          and(eq(bookmarks.photoId, photoId), eq(bookmarks.userId, userId)),
        );
    }

    return this.getById(userId);
  }
}
