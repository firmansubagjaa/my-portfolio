// File: /server/src/utils/errors.ts
import type { StatusCode } from "hono/utils/http-status";
import { z } from "zod";
import type { ApiErrorCategory } from "../shared/dto";

export class AppError extends Error {
	constructor(
		public readonly status: StatusCode,
		public readonly category: ApiErrorCategory,
		message: string,
		public readonly errors?: Record<string, string[]>,
	) {
		super(message);
		this.name = new.target.name;
	}
}

export class BadRequestError extends AppError {
	constructor(message: string = "Permintaan tidak valid") {
		super(400, "BAD_REQUEST", message);
	}
}

export class ValidationError extends AppError {
	constructor(
		message: string = "Validasi gagal",
		errors?: Record<string, string[]>,
	) {
		super(400, "VALIDATION_ERROR", message, errors);
	}

	static fromZod(error: z.ZodError<any>): ValidationError {
		const fieldErrors = z.flattenError(error).fieldErrors;
		const errors: Record<string, string[]> = {};

		for (const [field, messages] of Object.entries(fieldErrors)) {
			if (messages && Array.isArray(messages)) {
				errors[field] = messages;
			}
		}

		return new ValidationError("Validasi gagal", errors);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string = "Anda tidak memiliki akses") {
		super(401, "UNAUTHORIZED", message);
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string = "Akses ditolak") {
		super(403, "FORBIDDEN", message);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = "Tidak ditemukan") {
		super(404, "NOT_FOUND", message);
	}
}

export class ConflictError extends AppError {
	constructor(message: string = "Data sudah ada") {
		super(409, "CONFLICT", message);
	}
}

export class PayloadTooLargeError extends AppError {
	constructor(message: string = "Ukuran file terlalu besar") {
		super(413, "PAYLOAD_TOO_LARGE", message);
	}
}

export class UnsupportedMediaTypeError extends AppError {
	constructor(message: string = "Format file tidak didukung") {
		super(415, "UNSUPPORTED_MEDIA_TYPE", message);
	}
}

export class RateLimitError extends AppError {
	constructor(message: string = "Terlalu banyak permintaan") {
		super(429, "RATE_LIMITED", message);
	}
}
