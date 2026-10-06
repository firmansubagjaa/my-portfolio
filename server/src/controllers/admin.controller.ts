// File: /server/src/controllers/admin.controller.ts
import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../utils/validator";
import {
	adminProjectListQuerySchema,
	createProjectSchema,
	updateProjectSchema,
	slugSchema,
} from "../shared/dto";
import {
	listAdminProjects,
	findProjectById,
	createProject,
	updateProject,
	deleteProject,
} from "../models/project.model";
import { getPaginationMeta } from "../utils/pagination";
import { ApiResponse } from "../utils/api-response";
import { NotFoundError, ConflictError } from "../utils/errors";
import type { AppEnv } from "../types/app-env";

export const adminController = new Hono<AppEnv>();

// GET /api/v1/admin - List admin projects
adminController.get(
	"/",
	validate("query", adminProjectListQuerySchema),
	async (c) => {
		const validData = c.req.valid("query");
		const { page, limit, ...filters } = validData;

		try {
			const result = await listAdminProjects(filters, { page, limit });
			const pagination = getPaginationMeta({
				page,
				limit,
				totalItems: result.total,
			});

			return ApiResponse.success(c, {
				data: result.items,
				message: "Daftar proyek (admin)",
				pagination,
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes("database")) {
				throw new Error("Database error");
			}
			throw error;
		}
	},
);

// GET /api/v1/admin/check-slug - Check slug availability
// Must be registered before "/:id", otherwise "check-slug" is matched as an id.
adminController.get(
	"/check-slug",
	validate("query", z.object({ slug: slugSchema })),
	async (c) => {
		const { slug } = c.req.valid("query");

		const { db } = await import("../db");
		const { projects } = await import("../db/schema");
		const { eq } = await import("drizzle-orm");

		const result = await db
			.select({ id: projects.id })
			.from(projects)
			.where(eq(projects.slug, slug))
			.limit(1);

		return ApiResponse.success(c, {
			data: { available: result.length === 0 },
			message: "Slug availability check",
		});
	},
);

// GET /api/v1/admin/:id - Get project detail by ID
adminController.get(
	"/:id",
	validate("param", z.object({ id: z.string().uuid() })),
	async (c) => {
		const { id } = c.req.valid("param");

		const project = await findProjectById(id);
		if (!project) {
			throw new NotFoundError("Proyek tidak ditemukan");
		}

		const dto = {
			id: project.id,
			title: project.title,
			slug: project.slug,
			summary: project.summary,
			content: project.content,
			thumbnail_url: project.thumbnail_url,
			gallery_urls: project.gallery_urls,
			tech_stack: project.tech_stack,
			category: project.category,
			repo_url: project.repo_url,
			demo_url: project.demo_url,
			notebook_url: project.notebook_url,
			is_featured: project.is_featured,
			status: project.status,
			created_at: project.created_at.toISOString(),
			updated_at: project.updated_at.toISOString(),
		};

		return ApiResponse.success(c, {
			data: dto,
			message: "Detail proyek",
		});
	},
);

// POST /api/v1/admin - Create project
adminController.post(
	"/",
	validate("json", createProjectSchema),
	async (c) => {
		const input = c.req.valid("json");

		try {
			const project = await createProject(input);

			return ApiResponse.created(c, project, "Proyek berhasil dibuat");
		} catch (error) {
			// Check for unique constraint violation on slug
			if (
				error instanceof Error &&
				(error.message.includes("unique") || error.message.includes("slug"))
			) {
				throw new ConflictError("Slug sudah digunakan");
			}
			throw error;
		}
	},
);

// PUT /api/v1/admin/:id - Update project
adminController.put(
	"/:id",
	validate("param", z.object({ id: z.string().uuid() })),
	validate("json", updateProjectSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const input = c.req.valid("json");

		try {
			const project = await updateProject(id, input);

			if (!project) {
				throw new NotFoundError("Proyek tidak ditemukan");
			}

			return ApiResponse.success(c, {
				data: project,
				message: "Proyek berhasil diperbarui",
			});
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			if (
				error instanceof Error &&
				(error.message.includes("unique") || error.message.includes("slug"))
			) {
				throw new ConflictError("Slug sudah digunakan");
			}
			throw error;
		}
	},
);

// DELETE /api/v1/admin/:id - Delete project
adminController.delete(
	"/:id",
	validate("param", z.object({ id: z.string().uuid() })),
	async (c) => {
		const { id } = c.req.valid("param");

		const project = await findProjectById(id);
		if (!project) {
			throw new NotFoundError("Proyek tidak ditemukan");
		}

		await deleteProject(id);

		return ApiResponse.success(c, {
			data: null,
			message: "Proyek berhasil dihapus",
		});
	},
);
