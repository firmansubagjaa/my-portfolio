// File: /server/src/utils/pagination.ts
import type { PaginationMeta } from "../shared/dto";

export interface GetPaginationParamsArgs {
	page: number;
	limit: number;
}

export interface GetPaginationParamsResult {
	limit: number;
	offset: number;
}

export function getPaginationParams(
	args: GetPaginationParamsArgs,
): GetPaginationParamsResult {
	const { page, limit } = args;
	const offset = (page - 1) * limit;
	return { limit, offset };
}

export interface GetPaginationMetaArgs {
	page: number;
	limit: number;
	totalItems: number;
}

export function getPaginationMeta(args: GetPaginationMetaArgs): PaginationMeta {
	const { page, limit, totalItems } = args;

	const totalPages = Math.max(1, Math.ceil(totalItems / limit));
	const hasNextPage = page < totalPages;
	const hasPrevPage = page > 1;

	return {
		current_page: page,
		limit,
		total_items: totalItems,
		total_pages: totalPages,
		has_next_page: hasNextPage,
		has_prev_page: hasPrevPage,
	};
}
