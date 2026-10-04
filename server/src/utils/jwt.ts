// File: /server/src/utils/jwt.ts
import { SignJWT, jwtVerify } from "jose";
import { env } from "../config/env";
import { UnauthorizedError } from "./errors";

export interface SessionPayload {
	sub: string;
	username: string;
}

const ISSUER = "portfolio-api";
const AUDIENCE = "portfolio-admin";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function signSession(payload: SessionPayload): Promise<string> {
	const token = await new SignJWT({ username: payload.username })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(payload.sub)
		.setIssuer(ISSUER)
		.setAudience(AUDIENCE)
		.setIssuedAt()
		.setExpirationTime(env.JWT_EXPIRES_IN)
		.sign(secret);

	return token;
}

export async function verifySession(token: string): Promise<SessionPayload> {
	try {
		const result = await jwtVerify(token, secret, {
			algorithms: ["HS256"],
			issuer: ISSUER,
			audience: AUDIENCE,
		});

		const sub = result.payload.sub;
		const username = result.payload.username;

		if (typeof sub !== "string" || typeof username !== "string") {
			throw new UnauthorizedError("Sesi tidak valid atau kedaluwarsa");
		}

		return {
			sub,
			username,
		};
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			throw error;
		}
		throw new UnauthorizedError("Sesi tidak valid atau kedaluwarsa");
	}
}

export function getSessionMaxAgeSeconds(): number {
	const expiresIn = env.JWT_EXPIRES_IN;
	const match = expiresIn.match(/^(\d+)([smhd])$/);

	if (!match || !match[1] || !match[2]) {
		return 7 * 24 * 60 * 60; // default 7 days
	}

	const value = parseInt(match[1]);
	const unit: string = match[2];

	switch (unit) {
		case "s":
			return value;
		case "m":
			return value * 60;
		case "h":
			return value * 60 * 60;
		case "d":
			return value * 24 * 60 * 60;
		default:
			return 7 * 24 * 60 * 60;
	}
}
