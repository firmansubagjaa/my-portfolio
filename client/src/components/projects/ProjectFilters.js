// File: /client/src/components/projects/ProjectFilters.tsx
"use client";
import { useEffect, useState } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PROJECT_CATEGORIES } from "@/types/api";
/**
 * Filter form for projects page
 * Includes search input (debounced) and category button group
 */
export function ProjectFilters({ filters, onFiltersChange }) {
	const [searchInput, setSearchInput] = useState(filters.search || "");
	const debouncedSearch = useDebouncedValue(searchInput, 300);
	// Update filters when debounced search changes
	useEffect(() => {
		if (debouncedSearch !== filters.search) {
			onFiltersChange({ search: debouncedSearch });
		}
	}, [debouncedSearch, filters.search, onFiltersChange]);
	const handleCategoryChange = (category) => {
		onFiltersChange({ category });
	};
	return _jsxs("form", {
		role: "search",
		className: "mb-8 space-y-6 rounded-lg border border-[--color-border] bg-[--color-surface] p-6",
		children: [
			_jsxs("div", {
				children: [
					_jsx("label", {
						htmlFor: "search",
						className: "block text-sm font-medium text-[--color-fg] mb-2",
						children: "Cari Proyek",
					}),
					_jsx("input", {
						id: "search",
						type: "search",
						placeholder: "Cari berdasarkan judul, ringkasan, atau teknologi...",
						value: searchInput,
						onChange: (e) => setSearchInput(e.target.value),
						className:
							"w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-4 py-2 text-[--color-fg] placeholder-[--color-muted] focus:border-[--color-accent] focus:outline-none focus:ring-2 focus:ring-[--color-accent]/20",
					}),
				],
			}),
			_jsxs("div", {
				children: [
					_jsx("label", {
						className: "block text-sm font-medium text-[--color-fg] mb-3",
						children: "Kategori",
					}),
					_jsxs("div", {
						className: "flex flex-wrap gap-2",
						children: [
							"// All button",
							_jsx("button", {
								type: "button",
								"aria-pressed": filters.category === undefined,
								onClick: () => handleCategoryChange(undefined),
								className: `rounded-full px-4 py-2 font-medium transition-colors ${
									filters.category === undefined
										? "bg-[--color-accent] text-[--color-bg]"
										: "border border-[--color-border] text-[--color-fg] hover:border-[--color-accent]"
								}`,
								children: "Semua",
							}),
							PROJECT_CATEGORIES.map((category) =>
								_jsx(
									"button",
									{
										type: "button",
										"aria-pressed": filters.category === category,
										onClick: () => handleCategoryChange(category),
										className: `rounded-full px-4 py-2 font-medium transition-colors ${
											filters.category === category
												? "bg-[--color-accent] text-[--color-bg]"
												: "border border-[--color-border] text-[--color-fg] hover:border-[--color-accent]"
										}`,
										children: category,
									},
									category,
								),
							),
						],
					}),
				],
			}),
		],
	});
}
