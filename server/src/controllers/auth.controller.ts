// File: /server/src/controllers/auth.controller.ts
import { Hono } from "hono";
import { validate } from "../utils/validator";
import { loginSchema } from "../shared/dto";
import { findUserByUsername } from "../models/user.model";
import { signSession } from "../utils/jwt";
import {
	setSessionCookie,
	clearSessionCookie,
	requireAuth,
} from "../middlewares/auth";
import { UnauthorizedError } from "../utils/errors";
import { ApiResponse } from "../utils/api-response";
import { loginRateLimiter } from "../middlewares/rate-limit";
import type { AppEnv } from "../types/app-env";

// Dummy hash for timing attack mitigation
// Generated once when module loads
const DUMMY_HASH = await Bun.password.hash(
	"dummy-password-for-timing-attack-mitigation",
);

export const authController = new Hono<AppEnv>();

authController.post(
	"/login",
	loginRateLimiter,
	validate("json", loginSchema),
	async (c) => {
		const validData = c.req.valid("json");
		const { username, password } = validData;

		const user = await findUserByUsername(username);

		// Always verify password to avoid timing attacks
		if (user) {
			const isPasswordValid = await Bun.password.verify(
				password,
				user.password_hash,
			);
			if (!isPasswordValid) {
				throw new UnauthorizedError("Username atau password salah");
			}
		} else {
			// Still verify with dummy hash even if user not found
			await Bun.password.verify(password, DUMMY_HASH);
			throw new UnauthorizedError("Username atau password salah");
		}

		// Password is valid, create session
		const token = await signSession({
			sub: user.id,
			username: user.username,
		});

		await setSessionCookie(c, token);

		return ApiResponse.success(c, {
			data: {
				id: user.id,
				username: user.username,
			},
			message: "Berhasil masuk",
		});
	},
);

authController.post("/logout", async (c) => {
	clearSessionCookie(c);

	return ApiResponse.success(c, {
		data: null,
		message: "Berhasil keluar",
	});
});

authController.get("/me", requireAuth, async (c) => {
	const user = c.get("user");

	return ApiResponse.success(c, {
		data: user,
	});
});
