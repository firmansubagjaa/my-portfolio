// File: /server/src/controllers/project.controller.ts
import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../utils/validator";
import { publicProjectListQuerySchema, slugSchema } from "../shared/dto";
import { listProjects, findPublicProjectBySlug } from "../models/project.model";
import { getPaginationMeta } from "../utils/pagination";
import { ApiResponse } from "../utils/api-response";
import { NotFoundError } from "../utils/errors";
import type { AppEnv } from "../types/app-env";

export const projectController = new Hono<AppEnv>();

// GET /api/v1/projects - List public projects
projectController.get(
	"/",
	validate("query", publicProjectListQuerySchema),
	async (c) => {
		const validData = c.req.valid("query");
		const { page, limit, ...filters } = validData;

		const result = await listProjects(filters, { page, limit });

		const pagination = getPaginationMeta({
			page,
			limit,
			totalItems: result.total,
		});

		return ApiResponse.success(c, {
			data: result.items,
			message: "Daftar proyek",
			pagination,
		});
	},
);

// GET /api/v1/projects/:slug - Get project detail
projectController.get(
	"/:slug",
	validate("param", z.object({ slug: slugSchema })),
	async (c) => {
		const validData = c.req.valid("param");
		const { slug } = validData;

		const project = await findPublicProjectBySlug(slug);

		if (!project) {
			throw new NotFoundError("Proyek tidak ditemukan");
		}

		return ApiResponse.success(c, {
			data: project,
			message: "Detail proyek",
		});
	},
);
