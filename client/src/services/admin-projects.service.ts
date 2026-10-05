// File: /client/src/services/admin-projects.service.ts
import { apiGet, apiPost, apiPut, apiDelete } from "./api-client";
import type { ProjectDTO } from "@/types/api";

export async function getAdminProjects(
	page: number = 1,
	limit: number = 10,
	filters?: { category?: string; search?: string; status?: string | string[] },
) {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	if (filters?.category) {
		params.append("category", filters.category);
	}
	if (filters?.search) {
		params.append("search", filters.search);
	}
	if (filters?.status) {
		if (Array.isArray(filters.status)) {
			filters.status.forEach((s) => params.append("status", s));
		} else {
			params.append("status", filters.status);
		}
	}

	return apiGet<ProjectDTO[]>(`/api/v1/admin?${params}`);
}

export async function getAdminProject(id: string): Promise<ProjectDTO> {
	return apiGet(`/api/v1/admin/${id}`);
}

export async function createProject(data: any): Promise<ProjectDTO> {
	return apiPost(`/api/v1/admin`, data);
}

export async function updateProject(id: string, data: any): Promise<ProjectDTO> {
	return apiPut(`/api/v1/admin/${id}`, data);
}

export async function deleteProject(id: string): Promise<void> {
	return apiDelete(`/api/v1/admin/${id}`);
}

export async function checkSlugAvailability(slug: string): Promise<{
	available: boolean;
}> {
	return apiGet(`/api/v1/admin/check-slug?slug=${encodeURIComponent(slug)}`);
}
