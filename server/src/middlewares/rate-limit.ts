// File: /server/src/middlewares/rate-limit.ts
import { rateLimiter } from "hono-rate-limiter";
import { RateLimitError } from "../utils/errors";
import type { AppEnv } from "../types/app-env";

function getClientIp(headerValue: string | string[] | undefined): string {
	if (!headerValue) return "unknown";

	const ips = Array.isArray(headerValue) ? headerValue : headerValue.split(",");
	return ips[0]?.trim() || "unknown";
}

// Login rate limiter: 5 requests per 15 minutes
export const loginRateLimiter = rateLimiter<AppEnv>({
	keyGenerator: (c) => {
		const xForwardedFor = c.req.header("x-forwarded-for");
		const xRealIp = c.req.header("x-real-ip");
		return getClientIp(xForwardedFor || xRealIp);
	},
	limit: 5,
	windowMs: 15 * 60 * 1000,
	handler: () => {
		throw new RateLimitError("Terlalu banyak percobaan, coba lagi nanti");
	},
});

// Upload rate limiter: 20 requests per 15 minutes
export const uploadRateLimiter = rateLimiter<AppEnv>({
	keyGenerator: (c) => {
		const xForwardedFor = c.req.header("x-forwarded-for");
		const xRealIp = c.req.header("x-real-ip");
		return getClientIp(xForwardedFor || xRealIp);
	},
	limit: 20,
	windowMs: 15 * 60 * 1000,
	handler: () => {
		throw new RateLimitError("Terlalu banyak permintaan, coba lagi nanti");
	},
});
