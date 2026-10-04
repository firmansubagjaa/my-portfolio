// File: /server/src/middlewares/error-handler.ts
import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { AppError, ValidationError, ConflictError } from "../utils/errors";
import { ApiResponse } from "../utils/api-response";
import type { AppEnv } from "../types/app-env";
import type { ApiErrorCategory } from "../shared/dto";
import { isProduction } from "../config/env";

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
	// Handle AppError (custom errors)
	if (err instanceof AppError) {
		return ApiResponse.error(c, err);
	}

	// Handle HTTPException from Hono
	if (err instanceof HTTPException) {
		const status = err.status as unknown as number;
		let category: ApiErrorCategory = "INTERNAL_ERROR";

		if (status === 401) category = "UNAUTHORIZED";
		else if (status === 403) category = "FORBIDDEN";
		else if (status === 404) category = "NOT_FOUND";
		else if (status === 413) category = "PAYLOAD_TOO_LARGE";
		else if (status >= 400 && status < 500) category = "BAD_REQUEST";

		// biome-ignore lint/suspicious/noExplicitAny: Cast required to access error properties
		const appError = new AppError(status as any, category, err.message);
		return ApiResponse.error(c, appError);
	}

	// Handle Zod validation error
	if (err instanceof z.ZodError) {
		const validationError = ValidationError.fromZod(err);
		return ApiResponse.error(c, validationError);
	}

	// Handle PostgreSQL unique constraint violation
	if (typeof err === "object" && err !== null && "code" in err) {
		// biome-ignore lint/suspicious/noExplicitAny: Error typing from Postgres driver is loose
		const error = err as any;
		if (error.code === "23505") {
			const conflictError = new ConflictError(
				"Data dengan nilai unik tersebut sudah ada",
			);
			return ApiResponse.error(c, conflictError);
		}

		// Check if error is wrapped by Drizzle in cause
		if (
			error.cause &&
			typeof error.cause === "object" &&
			"code" in error.cause
		) {
			// biome-ignore lint/suspicious/noExplicitAny: Cause may have loose typing
			const cause = error.cause as any;
			if (cause.code === "23505") {
				const conflictError = new ConflictError(
					"Data dengan nilai unik tersebut sudah ada",
				);
				return ApiResponse.error(c, conflictError);
			}
		}
	}

	// Default 500 error
	console.error("Unhandled error:", err);

	const message = isProduction
		? "Terjadi kesalahan pada server"
		: err instanceof Error
			? err.message
			: String(err);
	const appError = new AppError(500, "INTERNAL_ERROR", message);
	return ApiResponse.error(c, appError);
};

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) => {
	const method = c.req.method;
	const path = c.req.path;
	const appError = new AppError(
		404,
		"NOT_FOUND",
		`Endpoint ${method} ${path} tidak ditemukan`,
	);
	return ApiResponse.error(c, appError);
};
