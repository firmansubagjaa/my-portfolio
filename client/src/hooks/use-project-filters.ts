// File: /client/src/hooks/use-project-filters.ts
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { PublicProjectListQuery } from "@/types/api";
import { publicProjectListQuerySchema } from "@/types/api";

const DEFAULT_FILTERS: PublicProjectListQuery = { page: 1, limit: 6, status: "published" };

// Keys that reset pagination when they change
const RESET_PAGE_KEYS = ["category", "search", "status"] as const;

/** URL is the source of truth; invalid params fall back to defaults (no crash, no redirect). */
function parseFilters(searchParams: URLSearchParams): PublicProjectListQuery {
	const parsed = publicProjectListQuerySchema.safeParse(Object.fromEntries(searchParams));
	return parsed.success ? parsed.data : DEFAULT_FILTERS;
}

/** Serialize filters, dropping default/empty values so URLs stay clean. */
function toSearchParams(f: PublicProjectListQuery): URLSearchParams {
	const params = new URLSearchParams();
	const search = f.search?.trim();
	if (search) params.set("search", search);
	if (f.category) params.set("category", f.category);
	if (f.status && f.status !== DEFAULT_FILTERS.status) params.set("status", f.status);
	if (f.limit && f.limit !== DEFAULT_FILTERS.limit) params.set("limit", String(f.limit));
	if (f.page && f.page !== 1) params.set("page", String(f.page));
	return params;
}

export function useProjectFilters() {
	const [searchParams, setSearchParams] = useSearchParams();
	const query = searchParams.toString();

	// `query` is the stable serialized form of searchParams (the object identity changes every render)
	const filters = useMemo(() => parseFilters(searchParams), [query]);

	const setFilters = useCallback(
		(patch: Partial<PublicProjectListQuery>) => {
			setSearchParams(
				(prev) => {
					const current = parseFilters(prev);
					const resetsPage = RESET_PAGE_KEYS.some(
						(key) => key in patch && (patch[key] || undefined) !== (current[key] || undefined),
					);
					const next = toSearchParams({
						...current,
						...patch,
						page: resetsPage ? 1 : (patch.page ?? current.page),
					});
					return next;
				},
				// Typing in search shouldn't pollute history; page/category changes should be back-able
				{ replace: "search" in patch && Object.keys(patch).length === 1 },
			);
		},
		[setSearchParams],
	);

	return { filters, setFilters };
}
