// File: /server/src/utils/api-response.ts
import { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import type { AppEnv } from "../types/app-env";
import type { ApiSuccess, ApiError, PaginationMeta } from "../shared/dto";
import { AppError } from "./errors";

interface SuccessOptions<T> {
	data: T;
	message?: string;
	status?: StatusCode;
	pagination?: PaginationMeta;
}

export const ApiResponse = {
	success: async <T>(
		c: Context<AppEnv>,
		options: SuccessOptions<T>,
	): Promise<Response> => {
		const { data, message = "Berhasil", status = 200, pagination } = options;

		const body: ApiSuccess<T> = {
			success: true,
			status,
			category: "SUCCESS",
			message,
			data,
			...(pagination && { pagination }),
			timestamp: new Date().toISOString(),
		};

		return c.json(body, status as any);
	},

	created: async <T>(
		c: Context<AppEnv>,
		data: T,
		message?: string,
	): Promise<Response> => {
		return ApiResponse.success(c, {
			data,
			message: message ?? "Dibuat",
			status: 201,
		});
	},

	error: async (c: Context<AppEnv>, err: AppError): Promise<Response> => {
		const body: ApiError = {
			success: false,
			status: err.status,
			category: err.category,
			message: err.message,
			...(err.errors && { errors: err.errors }),
			timestamp: new Date().toISOString(),
		};

		return c.json(body, err.status as any);
	},
};
