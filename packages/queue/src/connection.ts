import { closeRedis, getRedis, type RedisClient } from "@rensa/cache";

const QUEUE_REDIS_GLOBAL_KEY = "rensa:queue";

const resolveRedisUrl = () =>
	process.env.TEST_REDIS_URL || process.env.REDIS_URL;

export const getQueueConnection = () => {
	const url = resolveRedisUrl();
	if (!url) {
		throw new Error("REDIS_URL is required for BullMQ queues.");
	}

	return getRedis({
		globalKey: QUEUE_REDIS_GLOBAL_KEY,
		redisOptions: {
			enableReadyCheck: false,
			maxRetriesPerRequest: null,
		},
		url,
	});
};

export const closeQueueConnection = async () => {
	await closeRedis({
		globalKey: QUEUE_REDIS_GLOBAL_KEY,
		url: resolveRedisUrl(),
	});
};

export type QueueRedisConnection = RedisClient;
