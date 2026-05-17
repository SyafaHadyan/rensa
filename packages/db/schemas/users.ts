import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

export const users = pgTable("users", {
  userId: uuid("user_id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  role: userRoleEnum("role").default("user"),
  verified: boolean("verified").default(false),
  passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export interface UserRegisterDto {
  email: string;
  password: string;
  username: string;
}

export interface UserResponseDto {
  avatar: string;
  bookmarks: string[];
  createdAt?: string;
  email: string;
  role: "user" | "admin";
  updatedAt?: string;
  user_id: string;
  username: string;
  verified: boolean;
}

export type UserWithPasswordResponseDto = UserResponseDto & {
  password: string;
};

export interface UserRepositoryInterface {
  create(user: UserRegisterDto): Promise<UserResponseDto>;
  getByEmail(email: string): Promise<UserWithPasswordResponseDto | null>;
  getById(id: string): Promise<UserResponseDto | null>;
  getProfileById(id: string): Promise<UserProfileDto | null>;
  resetPassword(params: {
    email: string;
    password: string;
    userId: string;
  }): Promise<boolean>;
  updateBookmarks(
    userId: string,
    photoId: string,
    action: "increment" | "decrement",
  ): Promise<UserResponseDto | null>;
  updateProfile(params: {
    avatar: string;
    email: string;
    userId: string;
    username: string;
  }): Promise<UserProfileDto | null>;
  verifyEmail(email: string): Promise<boolean>;
}

export interface UserProfileDto {
  avatar?: string;
  email: string;
  id: string;
  username: string;
}
