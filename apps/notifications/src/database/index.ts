import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { Pool } from "pg";
import { env } from "../config/env";
import { notifications, notificationTypeEnum } from "./schema";

const schema = { notificationTypeEnum, notifications };

export const pool = new Pool({
	connectionString: env.databaseUrl,
});

export const db = drizzle(pool, { schema });

let isConnected = false;
let migrationPromise: Promise<void> | null = null;

function runMigrations() {
	if (!migrationPromise) {
		const migrationsFolder = path.join(process.cwd(), "drizzle");
		migrationPromise = migrate(db, { migrationsFolder }).then(() => {
			console.log("Notifications database migrations applied");
		});
	}

	return migrationPromise;
}

export async function connectDatabase() {
	if (isConnected) {
		return;
	}

	const client = await pool.connect();
	try {
		await client.query("select 1");
	} finally {
		client.release();
	}

	await runMigrations();
	isConnected = true;
	console.log("PostgreSQL connected");
}
