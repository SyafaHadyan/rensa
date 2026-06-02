import IORedis from "ioredis";

let connection: IORedis | undefined;

const resolveRedisUrl = () =>
	process.env.TEST_REDIS_URL || process.env.REDIS_URL;

export const getQueueConnection = () => {
	if (connection) {
		return connection;
	}

	const url = resolveRedisUrl();
	if (!url) {
		throw new Error("REDIS_URL is required for BullMQ queues.");
	}

	connection = new IORedis(url, {
		maxRetriesPerRequest: null,
		enableReadyCheck: false,
	});

	return connection;
};

export const closeQueueConnection = async () => {
	await connection?.quit();
	connection = undefined;
};
