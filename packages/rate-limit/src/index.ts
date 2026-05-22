import { randomUUID } from "node:crypto";
import { getRedis, type RedisClient } from "@rensa/cache";

export interface RateLimitResult {
	limit: number;
	remaining: number;
	reset: number;
	success: boolean;
}

export interface SlidingWindowConfig {
	limit: number;
	prefix: string;
	redis?: RedisClient;
	windowMs: number;
}

export interface RateLimiter {
	limit: (identifier: string) => Promise<RateLimitResult>;
}

const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local member = ARGV[3]
local min = now - window

redis.call("ZREMRANGEBYSCORE", key, 0, min)
redis.call("ZADD", key, now, member)
local count = redis.call("ZCARD", key)
redis.call("PEXPIRE", key, window)
local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")

return { count, oldest[2] or now }
`;

function normalizeIdentifier(identifier: string) {
	return identifier.trim() || "unknown";
}

export function createSlidingWindowRateLimiter(
	config: SlidingWindowConfig
): RateLimiter {
	return {
		async limit(identifier: string) {
			const redis = config.redis ?? getRedis();
			const now = Date.now();
			const member = `${now}:${randomUUID()}`;
			const key = `${config.prefix}:${normalizeIdentifier(identifier)}`;
			const response = (await redis.eval(
				SLIDING_WINDOW_SCRIPT,
				1,
				key,
				now,
				config.windowMs,
				member
			)) as [number | string, number | string];

			const requestCount = Number(response[0]);
			const oldestRequestAt = Number(response[1]);
			const reset = oldestRequestAt + config.windowMs;
			const remaining = Math.max(0, config.limit - requestCount);

			return {
				success: requestCount <= config.limit,
				limit: config.limit,
				remaining,
				reset,
			};
		},
	};
}

export const loginLimiter = createSlidingWindowRateLimiter({
	limit: 5,
	prefix: "login_limit",
	windowMs: 10 * 60 * 1000,
});

export const registerLimiter = createSlidingWindowRateLimiter({
	limit: 3,
	prefix: "register_limit",
	windowMs: 60 * 60 * 1000,
});

export const logoutLimiter = createSlidingWindowRateLimiter({
	limit: 10,
	prefix: "logout_limit",
	windowMs: 10 * 60 * 1000,
});

export const contactFormLimiter = createSlidingWindowRateLimiter({
	limit: 5,
	prefix: "contact_limit",
	windowMs: 60 * 60 * 1000,
});

export const bugReportLimiter = createSlidingWindowRateLimiter({
	limit: 3,
	prefix: "bugreport_limit",
	windowMs: 24 * 60 * 60 * 1000,
});

export const verificationEmailLimiter = createSlidingWindowRateLimiter({
	limit: 3,
	prefix: "verification_limit",
	windowMs: 60 * 60 * 1000,
});

export const forgotPasswordLimiter = createSlidingWindowRateLimiter({
	limit: 3,
	prefix: "forgot_password_limit",
	windowMs: 60 * 60 * 1000,
});

export const resetPasswordLimiter = createSlidingWindowRateLimiter({
	limit: 5,
	prefix: "reset_password_limit",
	windowMs: 10 * 60 * 1000,
});

export const photoUploadLimiter = createSlidingWindowRateLimiter({
	limit: 5,
	prefix: "photo_upload_limit",
	windowMs: 2 * 60 * 1000,
});
