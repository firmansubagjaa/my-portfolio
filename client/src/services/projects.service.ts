// File: /client/src/services/projects.service.ts

import type {
	ProjectDTO,
	ProjectListItemDTO,
	ProjectListResponse,
	PublicProjectListQuery,
} from "@shared/dto";
import { apiFetchEnvelope, apiGet } from "./api-client";

/**
 * Get public projects with optional filtering
 */
export async function getPublicProjects(
	params: Partial<PublicProjectListQuery> = {},
): Promise<ProjectListResponse> {
	// Build query string, skipping undefined/empty values
	const searchParams = new URLSearchParams();

	if (params.page && params.page !== 1) {
		searchParams.append("page", String(params.page));
	}

	if (params.limit && params.limit !== 6) {
		searchParams.append("limit", String(params.limit));
	}

	if (params.category) {
		searchParams.append("category", params.category);
	}

	if (params.search?.trim()) {
		searchParams.append("search", params.search.trim());
	}

	// status='published' is default, so only include if different
	if (params.status && params.status !== "published") {
		searchParams.append("status", params.status);
	}

	const queryString = searchParams.toString();
	const url = queryString ? `/api/v1/projects?${queryString}` : "/api/v1/projects";

	// Server returns { data: [...], pagination } at the envelope level
	const res = await apiFetchEnvelope<ProjectListItemDTO[]>(url, { method: "GET" });
	if (!res.pagination) {
		throw new Error("Respons daftar proyek tidak menyertakan pagination");
	}
	return { items: res.data, pagination: res.pagination };
}

/**
 * Get project by slug
 */
export async function getProjectBySlug(slug: string): Promise<ProjectDTO> {
	return apiGet<ProjectDTO>(`/api/v1/projects/${slug}`);
}
