// File: /server/src/shared/dto.ts
import { z } from "zod";
export const PROJECT_STATUSES = ["draft", "published", "archived"];
export const PROJECT_CATEGORIES = [
    "fullstack",
    "ai_ml",
    "frontend",
    "backend",
    "experiment",
];
export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export const projectCategorySchema = z.enum(PROJECT_CATEGORIES);
export const slugSchema = z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .max(100, "Slug maksimal 100 karakter")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung");
export const createProjectSchema = z.object({
    title: z
        .string()
        .min(3, "Judul minimal 3 karakter")
        .max(120, "Judul maksimal 120 karakter"),
    slug: slugSchema,
    summary: z
        .string()
        .min(10, "Ringkasan minimal 10 karakter")
        .max(280, "Ringkasan maksimal 280 karakter"),
    content: z.string().min(1, "Konten wajib diisi"),
    thumbnail_url: z.string().url().nullable().optional().default(null),
    gallery_urls: z
        .array(z.string().url())
        .max(12, "Maksimal 12 gambar galeri")
        .default([]),
    tech_stack: z
        .array(z.string().min(1).max(30))
        .max(20, "Maksimal 20 teknologi")
        .default([]),
    category: projectCategorySchema,
    repo_url: z.string().url().nullable().optional().default(null),
    demo_url: z.string().url().nullable().optional().default(null),
    notebook_url: z.string().url().nullable().optional().default(null),
    is_featured: z.boolean().default(false),
    status: projectStatusSchema.default("draft"),
});
export const updateProjectSchema = createProjectSchema.partial();
export const projectListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(6),
    category: projectCategorySchema.optional(),
    search: z.string().trim().max(100).optional(),
    status: projectStatusSchema.optional(),
});
export const loginSchema = z.object({
    username: z
        .string()
        .min(3, "Username minimal 3 karakter")
        .max(50, "Username maksimal 50 karakter")
        .trim(),
    password: z
        .string()
        .min(8, "Password minimal 8 karakter")
        .max(128, "Password maksimal 128 karakter"),
});
