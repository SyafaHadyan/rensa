import db from "@rensa/db";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";

let migrationPromise: Promise<void> | null = null;

function runMigrations() {
	if (!migrationPromise) {
		const migrationsFolder = path.join(process.cwd(), "drizzle");
		migrationPromise = migrate(db, { migrationsFolder }).then(() => {
			console.log("Web database migrations applied");
		});
	}

	return migrationPromise;
}

export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	await runMigrations();
}
