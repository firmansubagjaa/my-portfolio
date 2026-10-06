// File: /client/src/components/projects/ProjectFilters.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABELS } from "@/config/constants";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ProjectCategory, ProjectListItemDTO, PublicProjectListQuery } from "@/types/api";
import { PROJECT_CATEGORIES } from "@/types/api";

interface ProjectFiltersProps {
	filters: PublicProjectListQuery;
	projects?: ProjectListItemDTO[];
	onFiltersChange: (filters: Partial<PublicProjectListQuery>) => void;
}

/**
 * Filter form for projects page
 * Includes search input (debounced) and category button group
 */
export function ProjectFilters({ filters, onFiltersChange }: ProjectFiltersProps) {
	const urlSearch = filters.search ?? "";
	const [searchInput, setSearchInput] = useState(urlSearch);
	const debouncedSearch = useDebouncedValue(searchInput, 300);

	// Keep latest callback in a ref so the effect below doesn't re-run on every render
	const onChangeRef = useRef(onFiltersChange);
	onChangeRef.current = onFiltersChange;

	// Sync local input when the URL changes from outside (back/forward, reset filter)
	useEffect(() => {
		setSearchInput(urlSearch);
	}, [urlSearch]);

	// Push debounced input to the URL only when it actually differs (normalized: undefined === "")
	useEffect(() => {
		if (debouncedSearch.trim() !== urlSearch) {
			onChangeRef.current({ search: debouncedSearch });
		}
		// urlSearch intentionally omitted: URL updates must not echo back into another write
	}, [debouncedSearch]);

	const handleCategoryChange = (category: ProjectCategory | undefined) => {
		onFiltersChange({ category });
	};

	const handleFeaturedToggle = () => {
		onFiltersChange({ featured: filters.featured ? undefined : true });
	};

	return (
		// <search> is the semantic equivalent of role="search"; class="block" for older engines
		<search className="mb-8 block">
			<form
				onSubmit={(e) => e.preventDefault()}
				className="space-y-6 rounded-lg border border-border bg-surface p-6"
			>
				{/* Search Input */}
				<div>
					<label htmlFor="search" className="block text-sm font-medium text-fg mb-2">
						Cari Proyek
					</label>
					<input
						id="search"
						type="search"
						placeholder="Cari berdasarkan judul, ringkasan, atau teknologi..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
					/>
				</div>

				{/* Featured Filter */}
				<fieldset>
					<legend className="block text-sm font-medium text-fg mb-3">Filter tambahan</legend>
					<div className="flex gap-2">
						<button
							type="button"
							aria-pressed={filters.featured === true}
							onClick={handleFeaturedToggle}
							className={`rounded-full px-4 py-2 font-medium transition-colors ${
								filters.featured === true
									? "bg-accent text-bg"
									: "border border-border text-fg hover:border-accent"
							}`}
						>
							⭐ Unggulan
						</button>
					</div>
				</fieldset>

				{/* Category Filter */}
				<fieldset>
					<legend className="block text-sm font-medium text-fg mb-3">Filter kategori</legend>
					<div className="flex flex-wrap gap-2">
						{/* All button */}
						<button
							type="button"
							aria-pressed={filters.category === undefined}
							onClick={() => handleCategoryChange(undefined)}
							className={`rounded-full px-4 py-2 font-medium transition-colors ${
								filters.category === undefined
									? "bg-accent text-bg"
									: "border border-border text-fg hover:border-accent"
							}`}
						>
							Semua
						</button>
						{/* Category buttons */}
						{PROJECT_CATEGORIES.map((category) => (
							<button
								key={category}
								type="button"
								aria-pressed={filters.category === category}
								onClick={() => handleCategoryChange(category)}
								className={`rounded-full px-4 py-2 font-medium transition-colors ${
									filters.category === category
										? "bg-accent text-bg"
										: "border border-border text-fg hover:border-accent"
								}`}
							>
								{CATEGORY_LABELS[category]}
							</button>
						))}
					</div>
				</fieldset>
			</form>
		</search>
	);
}
