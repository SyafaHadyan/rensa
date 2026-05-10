import { Ratelimit } from "@upstash/ratelimit";
import getRedis from "@/lib/redis";

type RatelimitLimiter = ReturnType<typeof Ratelimit.slidingWindow>;

function createLazyRatelimit(opts: {
	limiter: RatelimitLimiter;
	prefix: string;
}) {
	let instance: Ratelimit | null = null;
	let warned = false;

	return {
		limit: async (
			...args: Parameters<Ratelimit["limit"]>
		): Promise<Awaited<ReturnType<Ratelimit["limit"]>>> => {
			try {
				if (!instance) {
					const redis = getRedis();
					instance = new Ratelimit({
						redis,
						limiter: opts.limiter,
						prefix: opts.prefix,
					});
				}

				return await (
					instance.limit as (
						...a: Parameters<Ratelimit["limit"]>
					) => ReturnType<Ratelimit["limit"]>
				)(...args);
			} catch (error) {
				if (!warned) {
					console.error(
						`Rate limit disabled for ${opts.prefix}:`,
						error instanceof Error ? error.message : error
					);
					warned = true;
				}

				return {
					limit: Number.MAX_SAFE_INTEGER,
					pending: Promise.resolve(),
					remaining: Number.MAX_SAFE_INTEGER,
					reset: Math.floor(Date.now() / 1000) + 60,
					success: true,
				} as Awaited<ReturnType<Ratelimit["limit"]>>;
			}
		},
	} as unknown as Ratelimit;
}

// Create a rate limiter that allows 5 requests per 10 minutes
export const loginLimiter = createLazyRatelimit({
	limiter: Ratelimit.slidingWindow(5, "10 m"),
	prefix: "login_limit",
});

export const registerLimiter = createLazyRatelimit({
	limiter: Ratelimit.slidingWindow(3, "1 h"),
	prefix: "register_limit",
});

export const logoutLimiter = createLazyRatelimit({
	limiter: Ratelimit.slidingWindow(10, "10 m"),
	prefix: "logout_limit",
});

export const contactFormLimiter = createLazyRatelimit({
	limiter: Ratelimit.slidingWindow(5, "1 h"),
	prefix: "contact_limit",
});

export const bugReportLimiter = createLazyRatelimit({
	limiter: Ratelimit.slidingWindow(3, "24 h"),
	prefix: "bugreport_limit",
});

export const verificationEmailLimiter = createLazyRatelimit({
	limiter: Ratelimit.slidingWindow(3, "1 h"),
	prefix: "verification_limit",
});

export const forgotPasswordLimiter = createLazyRatelimit({
	limiter: Ratelimit.slidingWindow(3, "1 h"),
	prefix: "forgot_password_limit",
});

export const resetPasswordLimiter = createLazyRatelimit({
	limiter: Ratelimit.slidingWindow(5, "10 m"),
	prefix: "reset_password_limit",
});
export const photoUploadLimiter = createLazyRatelimit({
	limiter: Ratelimit.slidingWindow(5, "2 m"),
	prefix: "photo_upload_limit",
});
