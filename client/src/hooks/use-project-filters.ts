// File: /client/src/hooks/use-project-filters.ts
import { useSearchParams } from "react-router";
import type { PublicProjectListQuery } from "@/types/api";
import { publicProjectListQuerySchema } from "@/types/api";

/**
 * Hook to manage project filters via URL search params
 */
export function useProjectFilters() {
	const [searchParams, setSearchParams] = useSearchParams();

	// Parse URL search params into filters, with safe defaults
	const parsed = publicProjectListQuerySchema.safeParse({
		page: searchParams.get("page"),
		limit: searchParams.get("limit"),
		category: searchParams.get("category"),
		search: searchParams.get("search"),
		status: searchParams.get("status"),
	});

	const filters: PublicProjectListQuery = parsed.success
		? parsed.data
		: {
				page: 1,
				limit: 6,
				status: "published",
			};

	/**
	 * Update filters and sync to URL
	 * Resets page to 1 if category/search/status changes
	 */
	const setFilters = (newFilters: Partial<PublicProjectListQuery>) => {
		const currentCategory = filters.category;
		const currentSearch = filters.search;
		const currentStatus = filters.status;

		const categoryChanged = newFilters.category !== currentCategory;
		const searchChanged = newFilters.search !== currentSearch;
		const statusChanged = newFilters.status !== currentStatus;

		// Reset page to 1 if major filters change
		const shouldResetPage = categoryChanged || searchChanged || statusChanged;

		const updatedFilters: PublicProjectListQuery = {
			...filters,
			...newFilters,
			page: shouldResetPage ? 1 : (newFilters.page ?? filters.page),
		};

		// Build new search params, excluding defaults
		const params = new URLSearchParams();

		if (updatedFilters.page && updatedFilters.page !== 1) {
			params.set("page", String(updatedFilters.page));
		}

		if (updatedFilters.limit && updatedFilters.limit !== 6) {
			params.set("limit", String(updatedFilters.limit));
		}

		if (updatedFilters.category) {
			params.set("category", updatedFilters.category);
		}

		if (updatedFilters.search && updatedFilters.search.trim()) {
			params.set("search", updatedFilters.search.trim());
		}

		// status='published' is default, so only include if different
		if (updatedFilters.status && updatedFilters.status !== "published") {
			params.set("status", updatedFilters.status);
		}

		// Use replace: true for search state changes to not pollute history
		setSearchParams(params, { replace: true });
	};

	return { filters, setFilters };
}
