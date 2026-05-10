import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { schema } from "../schemas";

export type { SQL } from "drizzle-orm";
export { and, count, desc, eq } from "drizzle-orm";

const databaseUrl =
	process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rensa";

const appPool = new Pool({ connectionString: databaseUrl });
const db = drizzle(appPool, { schema, casing: "snake_case" });

let migrationPromise: Promise<void> | null = null;

function ensureMigrations() {
	if (!migrationPromise) {
		migrationPromise = (async () => {
			const migrationPool = new Pool({ connectionString: databaseUrl });
			try {
				const migrationDb = drizzle(migrationPool, { casing: "snake_case" });
				await migrate(migrationDb, {
					migrationsFolder: "drizzle",
					migrationsTable: "__drizzle_migrations_web",
				});
				console.log("Web database migrations applied");
			} finally {
				await migrationPool.end();
			}
		})();
	}

	return migrationPromise;
}

const originalQuery = appPool.query.bind(appPool);
appPool.query = ((...args: Parameters<typeof originalQuery>) =>
	ensureMigrations().then(() => originalQuery(...args))) as typeof appPool.query;

export default db;
