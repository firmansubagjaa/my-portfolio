// File: /server/src/middlewares/auth.ts
import { createMiddleware } from "hono/factory";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { env, isProduction } from "../config/env";
import { verifySession, getSessionMaxAgeSeconds } from "../utils/jwt";
import { UnauthorizedError } from "../utils/errors";
import type { AppEnv } from "../types/app-env";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
	const token = getCookie(c, env.COOKIE_NAME);

	if (!token) {
		throw new UnauthorizedError("Silakan login terlebih dahulu");
	}

	const payload = await verifySession(token);
	c.set("user", {
		id: payload.sub,
		username: payload.username,
	});

	await next();
});

// biome-ignore lint/suspicious/noExplicitAny: Hono context requires any type
export async function setSessionCookie(c: any, token: string): Promise<void> {
	setCookie(c, env.COOKIE_NAME, token, {
		httpOnly: true,
		secure: isProduction,
		sameSite: "Lax",
		path: "/",
		maxAge: getSessionMaxAgeSeconds(),
	});
}

// biome-ignore lint/suspicious/noExplicitAny: Hono context requires any type
export function clearSessionCookie(c: any): void {
	deleteCookie(c, env.COOKIE_NAME, {
		path: "/",
	});
}
