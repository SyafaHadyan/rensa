import Redis from "ioredis";

type RedisLogger = Pick<Console, "error" | "log" | "warn">;

interface RedisConnectionOptions {
	defaultUrl?: string;
	globalKey?: string;
	logger?: RedisLogger;
	logLifecycle?: boolean;
	url?: string;
}

interface ManagedRedisClient {
	client: Redis;
	isConnected: boolean;
}

declare global {
	var __rensaRedisClients: Map<string, ManagedRedisClient> | undefined;
}

function getRedisClients() {
	globalThis.__rensaRedisClients ??= new Map();
	return globalThis.__rensaRedisClients;
}

function resolveRedisUrl(options: RedisConnectionOptions) {
	return (
		options.url ??
		process.env.REDIS_URL ??
		process.env.UPSTASH_REDIS_URL ??
		process.env.KV_URL ??
		process.env.REDIS_TLS_URL ??
		options.defaultUrl
	);
}

export function getRedis(options: RedisConnectionOptions = {}) {
	const url = resolveRedisUrl(options);
	if (!url) {
		throw new Error(
			"Redis connection URL is not configured. Set REDIS_URL to your Redis URI."
		);
	}

	const key = options.globalKey ?? url;
	const clients = getRedisClients();
	const existing = clients.get(key);
	if (existing) {
		return existing.client;
	}

	const logger = options.logger ?? console;
	const logLifecycle = options.logLifecycle ?? false;
	const managed: ManagedRedisClient = {
		client: new Redis(url, {
			maxRetriesPerRequest: 3,
			reconnectOnError(error) {
				const retryableErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
				return retryableErrors.some((targetError) =>
					error.message.includes(targetError)
				);
			},
			retryStrategy(times) {
				return Math.min(times * 50, 2000);
			},
		}),
		isConnected: false,
	};

	managed.client.on("connect", () => {
		managed.isConnected = true;
		if (logLifecycle) {
			logger.log("Redis connected successfully");
		}
	});

	managed.client.on("ready", () => {
		managed.isConnected = true;
		if (logLifecycle) {
			logger.log("Redis ready");
		}
	});

	managed.client.on("error", (error) => {
		managed.isConnected = false;
		if (logLifecycle) {
			logger.error("Redis connection error:", error.message);
		}
	});

	managed.client.on("close", () => {
		managed.isConnected = false;
		if (logLifecycle) {
			logger.warn("Redis connection closed");
		}
	});

	clients.set(key, managed);
	return managed.client;
}

export function redisConnected(options: RedisConnectionOptions = {}) {
	const url = resolveRedisUrl(options);
	if (!url) {
		return false;
	}

	const key = options.globalKey ?? url;
	return getRedisClients().get(key)?.isConnected ?? false;
}

export type RedisClient = Redis;
