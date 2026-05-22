import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "../schemas";

export type { SQL } from "drizzle-orm";
export { and, count, desc, eq } from "drizzle-orm";

const db = drizzle(
	process.env.DATABASE_URL ||
		"postgresql://postgres:postgres@localhost:5432/rensa",
	{ schema, casing: "snake_case" }
);

export default db;
