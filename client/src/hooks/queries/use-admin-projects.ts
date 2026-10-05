// File: /client/src/hooks/queries/use-admin-projects.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type AdminProjectFilters,
	checkSlugAvailability,
	createProject,
	deleteProject,
	getAdminProject,
	getAdminProjects,
	updateProject,
} from "@/services/admin-projects.service";
import type { ProjectStatus, UpdateProjectInput } from "@/types/api";

// Query key factory
const adminProjectsKeys = {
	all: ["admin", "projects"] as const,
	list: (filters?: AdminProjectFilters, page?: number, limit?: number) =>
		[...adminProjectsKeys.all, "list", filters, page, limit] as const,
	stats: ["admin", "projects", "stats"] as const,
	detail: (id: string) => [...adminProjectsKeys.all, "detail", id] as const,
	checkSlug: (slug: string) => ["admin", "check-slug", slug] as const,
};

export function useAdminProjects(
	page: number = 1,
	limit: number = 10,
	filters?: AdminProjectFilters,
) {
	return useQuery({
		queryKey: adminProjectsKeys.list(filters, page, limit),
		queryFn: () => getAdminProjects(page, limit, filters),
		staleTime: 2 * 60 * 1000,
		// Keep the current rows on screen while the next page/filter loads
		placeholderData: keepPreviousData,
	});
}

// Largest page the admin list endpoint accepts
const STATS_PAGE_LIMIT = 50;

export interface AdminProjectStats {
	total: number;
	published: number;
	draft: number;
	archived: number;
}

/**
 * There is no stats endpoint. One page of up to 50 projects is fetched and its statuses are
 * counted client-side. Only when there are more projects than that do we fall back to
 * per-status limit=1 requests (reading pagination.total_items), and those run one after
 * another: the API uses a single-connection DB pool, so parallel requests queue up and
 * can time out.
 */
async function fetchAdminProjectStats(): Promise<AdminProjectStats> {
	const page = await getAdminProjects(1, STATS_PAGE_LIMIT);
	const total = page.pagination.total_items;

	if (total <= page.items.length) {
		const counts: AdminProjectStats = { total, published: 0, draft: 0, archived: 0 };
		for (const item of page.items) counts[item.status] += 1;
		return counts;
	}

	const countFor = async (status: ProjectStatus) =>
		(await getAdminProjects(1, 1, { status })).pagination.total_items;
	const published = await countFor("published");
	const draft = await countFor("draft");
	const archived = await countFor("archived");
	return { total, published, draft, archived };
}

// The key sits under adminProjectsKeys.all, so create/update/delete invalidation refreshes it
export function useAdminProjectStats() {
	return useQuery({
		queryKey: adminProjectsKeys.stats,
		queryFn: fetchAdminProjectStats,
		staleTime: 2 * 60 * 1000,
	});
}

export function useAdminProject(id: string) {
	return useQuery({
		queryKey: adminProjectsKeys.detail(id),
		queryFn: () => getAdminProject(id),
		staleTime: 5 * 60 * 1000,
		// /admin/projects/new has no id; don't request /api/v1/admin/
		enabled: id.length > 0,
	});
}

export function useCreateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminProjectsKeys.all });
		},
	});
}

export function useUpdateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) => updateProject(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminProjectsKeys.all });
		},
	});
}

export function useDeleteProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminProjectsKeys.all });
		},
	});
}

// HIGH-1: Slug availability check with proper stale time and enabled logic
export function useCheckSlugAvailability(slug: string, enabled: boolean = true) {
	return useQuery({
		queryKey: adminProjectsKeys.checkSlug(slug),
		queryFn: () => checkSlugAvailability(slug),
		enabled: enabled && slug.length > 0,
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
		retry: 1,
	});
}
