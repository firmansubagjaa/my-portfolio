// File: /server/src/utils/pagination.test.ts
import { describe, it, expect } from "bun:test";
import { getPaginationParams, getPaginationMeta } from "./pagination";

describe("pagination", () => {
	describe("getPaginationMeta", () => {
		it("should return correct pagination meta for first page", () => {
			const result = getPaginationMeta({ page: 1, limit: 6, totalItems: 12 });
			expect(result).toEqual({
				current_page: 1,
				limit: 6,
				total_items: 12,
				total_pages: 2,
				has_next_page: true,
				has_prev_page: false,
			});
		});

		it("should return correct pagination meta for last page", () => {
			const result = getPaginationMeta({ page: 2, limit: 6, totalItems: 12 });
			expect(result).toEqual({
				current_page: 2,
				limit: 6,
				total_items: 12,
				total_pages: 2,
				has_next_page: false,
				has_prev_page: true,
			});
		});

		it("should handle empty results", () => {
			const result = getPaginationMeta({ page: 1, limit: 6, totalItems: 0 });
			expect(result).toEqual({
				current_page: 1,
				limit: 6,
				total_items: 0,
				total_pages: 1,
				has_next_page: false,
				has_prev_page: false,
			});
		});

		it("should calculate correct offset", () => {
			const result = getPaginationParams({ page: 3, limit: 6 });
			expect(result).toEqual({
				limit: 6,
				offset: 12,
			});
		});
	});
});
