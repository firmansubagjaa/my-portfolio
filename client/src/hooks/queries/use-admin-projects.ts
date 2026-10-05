// File: /client/src/hooks/queries/use-admin-projects.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getAdminProjects,
	getAdminProject,
	createProject,
	updateProject,
	deleteProject,
	checkSlugAvailability,
} from "@/services/admin-projects.service";

// Query key factory
const adminProjectsKeys = {
	all: ["admin", "projects"] as const,
	list: (filters?: Record<string, any>, page?: number, limit?: number) => [
		...adminProjectsKeys.all,
		"list",
		filters,
		page,
		limit,
	] as const,
	detail: (id: string) => [...adminProjectsKeys.all, "detail", id] as const,
	checkSlug: (slug: string) => ["admin", "check-slug", slug] as const,
};

export function useAdminProjects(
	page: number = 1,
	limit: number = 10,
	filters?: { category?: string; search?: string; status?: string | string[] },
) {
	return useQuery({
		queryKey: adminProjectsKeys.list(filters, page, limit),
		queryFn: () => getAdminProjects(page, limit, filters),
		staleTime: 2 * 60 * 1000,
	});
}

export function useAdminProject(id: string) {
	return useQuery({
		queryKey: adminProjectsKeys.detail(id),
		queryFn: () => getAdminProject(id),
		staleTime: 5 * 60 * 1000,
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
		mutationFn: ({ id, data }: { id: string; data: any }) =>
			updateProject(id, data),
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
