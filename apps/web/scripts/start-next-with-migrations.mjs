import { spawn } from "node:child_process";
import process from "node:process";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const databaseUrl =
	process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rensa";

async function runMigrations() {
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
}

function startNext() {
	const [subcommand, ...args] = process.argv.slice(2);
	if (!subcommand) {
		throw new Error("Missing Next.js subcommand");
	}

	const child = spawn("next", [subcommand, ...args], {
		stdio: "inherit",
		shell: true,
	});

	child.on("exit", (code, signal) => {
		if (signal) {
			process.kill(process.pid, signal);
			return;
		}

		process.exit(code ?? 1);
	});
}

await runMigrations();
startNext();
