import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { existsSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { schema } from "../schemas";

export type { SQL } from "drizzle-orm";
export { and, count, desc, eq } from "drizzle-orm";

const databaseUrl =
	process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rensa";

function getMigrationsFolder(): string {
	const candidates = [
		path.join(process.cwd(), "drizzle"),
		path.join(process.cwd(), "apps", "web", "drizzle"),
	];

	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	throw new Error(
		`Web migration folder not found. Checked: ${candidates.join(", ")}`
	);
}

{
	const migrationPool = new Pool({ connectionString: databaseUrl });
	try {
		const migrationDb = drizzle(migrationPool, { casing: "snake_case" });
		await migrate(migrationDb, {
			migrationsFolder: getMigrationsFolder(),
			migrationsTable: "__drizzle_migrations_web",
		});
		console.log("Web database migrations applied");
	} finally {
		await migrationPool.end();
	}
}

const appPool = new Pool({ connectionString: databaseUrl });
const db = drizzle(appPool, { schema, casing: "snake_case" });

export default db;
