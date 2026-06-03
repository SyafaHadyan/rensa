import { defineConfig, defineProject } from "vitest/config";

const unitInclude = [
	"apps/**/*.{test,spec}.{ts,tsx}",
	"packages/**/*.{test,spec}.{ts,tsx}",
];

export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
		},
		projects: [
			defineProject({
				test: {
					name: "unit",
					environment: "node",
					include: unitInclude,
					exclude: [
						"**/*.integration.test.{ts,tsx}",
						"**/node_modules/**",
						"**/.next/**",
					],
					setupFiles: ["./packages/test-utils/src/vitest.setup.ts"],
				},
			}),
			defineProject({
				test: {
					name: "integration",
					environment: "node",
					include: ["**/*.integration.test.{ts,tsx}"],
					setupFiles: ["./packages/test-utils/src/vitest.integration.setup.ts"],
					testTimeout: 60_000,
				},
			}),
		],
	},
});
