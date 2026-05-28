import { defineConfig } from "drizzle-kit";
import "dotenv/config";
export default defineConfig({
	dialect: "postgresql",
	schema: "./schemas/*.ts",
	out: "./migrations",
	casing: "snake_case",
	dbCredentials: {
		url:
			process.env.DATABASE_URL ||
			"postgresql://postgres:postgres@localhost:5432/rensa",
	},
});
