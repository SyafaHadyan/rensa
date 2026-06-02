import type { JobsOptions } from "bullmq";

export const emailJobOptions = {
	attempts: 5,
	backoff: {
		type: "exponential",
		delay: 30_000,
	},
	removeOnComplete: 1000,
	removeOnFail: 5000,
} as const satisfies JobsOptions;

export const notificationJobOptions = {
	attempts: 3,
	backoff: {
		type: "exponential",
		delay: 5000,
	},
	removeOnComplete: 1000,
	removeOnFail: 5000,
} as const satisfies JobsOptions;

export const photoJobOptions = {
	attempts: 3,
	backoff: {
		type: "exponential",
		delay: 10_000,
	},
	removeOnComplete: 500,
	removeOnFail: 5000,
} as const satisfies JobsOptions;
