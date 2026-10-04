// File: /client/src/hooks/queries/use-projects.ts
import { useQuery } from "@tanstack/react-query";
import { getProjectBySlug, getPublicProjects } from "@/services/projects.service";
export const projectKeys = {
	all: ["projects"],
	lists: () => [...projectKeys.all, "list"],
	list: (filters = {}) => [...projectKeys.lists(), filters],
	details: () => [...projectKeys.all, "detail"],
	detail: (slug) => [...projectKeys.details(), slug],
};
/**
 * Hook to fetch public projects with pagination and filtering
 */
export function useProjects(params = {}) {
	return useQuery({
		queryKey: projectKeys.list(params),
		queryFn: () => getPublicProjects(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
		placeholderData: (previousData) => previousData, // Keep previous data during filter changes
	});
}
/**
 * Hook to fetch a single project by slug
 */
export function useProject(slug, enabled = true) {
	return useQuery({
		queryKey: projectKeys.detail(slug),
		queryFn: () => getProjectBySlug(slug),
		enabled,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}
