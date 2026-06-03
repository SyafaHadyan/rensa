import { afterEach, beforeAll } from "vitest";

beforeAll(() => {
	if (!process.env.TEST_DATABASE_URL) {
		throw new Error(
			"Integration tests require TEST_DATABASE_URL pointing at a disposable test database."
		);
	}

	if (!process.env.TEST_REDIS_URL) {
		throw new Error(
			"Integration tests require TEST_REDIS_URL pointing at disposable Redis."
		);
	}
});

afterEach(async () => {
	// Shared cleanup hooks live here so integration tests do not accidentally
	// target a developer's local database without explicit test URLs.
});
