// File: /client/src/services/admin-projects.service.ts
import type {
	CreateProjectInput,
	ProjectCategory,
	ProjectDTO,
	ProjectListItemDTO,
	ProjectListResponse,
	ProjectStatus,
	UpdateProjectInput,
} from "@/types/api";
import { apiDelete, apiFetchEnvelope, apiGet, apiPost, apiPut } from "./api-client";

export interface AdminProjectFilters {
	category?: ProjectCategory;
	search?: string;
	status?: ProjectStatus | ProjectStatus[];
}

export async function getAdminProjects(
	page: number = 1,
	limit: number = 10,
	filters?: AdminProjectFilters,
): Promise<ProjectListResponse<ProjectListItemDTO>> {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	if (filters?.category) {
		params.append("category", filters.category);
	}
	if (filters?.search?.trim()) {
		params.append("search", filters.search.trim());
	}
	if (filters?.status) {
		if (Array.isArray(filters.status)) {
			for (const s of filters.status) params.append("status", s);
		} else {
			params.append("status", filters.status);
		}
	}

	// Pagination lives on the envelope, so read the full envelope (apiGet only returns data)
	const res = await apiFetchEnvelope<ProjectListItemDTO[]>(`/api/v1/admin?${params}`, {
		method: "GET",
	});
	if (!res.pagination) {
		throw new Error("Respons daftar proyek tidak menyertakan pagination");
	}
	return { items: res.data, pagination: res.pagination };
}

export async function getAdminProject(id: string): Promise<ProjectDTO> {
	return apiGet<ProjectDTO>(`/api/v1/admin/${id}`);
}

export async function createProject(data: CreateProjectInput): Promise<ProjectDTO> {
	return apiPost<ProjectDTO>(`/api/v1/admin`, data);
}

export async function updateProject(id: string, data: UpdateProjectInput): Promise<ProjectDTO> {
	return apiPut<ProjectDTO>(`/api/v1/admin/${id}`, data);
}

export async function deleteProject(id: string): Promise<void> {
	return apiDelete(`/api/v1/admin/${id}`);
}

export async function checkSlugAvailability(slug: string): Promise<{
	available: boolean;
}> {
	return apiGet(`/api/v1/admin/check-slug?slug=${encodeURIComponent(slug)}`);
}
