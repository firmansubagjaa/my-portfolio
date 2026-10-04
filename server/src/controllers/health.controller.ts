// File: /server/src/controllers/health.controller.ts
import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { ApiResponse } from "../utils/api-response";
import type { AppEnv } from "../types/app-env";

export const healthController = new Hono<AppEnv>();

healthController.get("/", async (c) => {
	try {
		await db.execute(sql`select 1`);

		return ApiResponse.success(c, {
			data: {
				status: "ok",
				database: "up",
			},
		});
	} catch {
		throw new Error("Database connection failed");
	}
});
