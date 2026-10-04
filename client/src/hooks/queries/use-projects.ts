// File: /client/src/hooks/queries/use-projects.ts
import { useQuery } from "@tanstack/react-query";
import { getProjectBySlug, getPublicProjects } from "@/services/projects.service";
import type { ProjectDTO, ProjectListResponse, PublicProjectListQuery } from "@/types/api";

export const projectKeys = {
	all: ["projects"] as const,
	lists: () => [...projectKeys.all, "list"] as const,
	list: (filters: Partial<PublicProjectListQuery> = {}) =>
		[...projectKeys.lists(), filters] as const,
	details: () => [...projectKeys.all, "detail"] as const,
	detail: (slug: string) => [...projectKeys.details(), slug] as const,
};

/**
 * Hook to fetch public projects with pagination and filtering
 */
export function useProjects(params: Partial<PublicProjectListQuery> = {}) {
	return useQuery<ProjectListResponse>({
		queryKey: projectKeys.list(params),
		queryFn: () => getPublicProjects(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
		placeholderData: (previousData) => previousData, // Keep previous data during filter changes
	});
}

/**
 * Hook to fetch a single project by slug
 */
export function useProject(slug: string, enabled: boolean = true) {
	return useQuery<ProjectDTO>({
		queryKey: projectKeys.detail(slug),
		queryFn: () => getProjectBySlug(slug),
		enabled,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}
