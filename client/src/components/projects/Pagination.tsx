// File: /client/src/components/projects/Pagination.tsx
"use client";

interface PaginationProps {
	current: number;
	total: number;
	onChange: (page: number) => void;
}

/**
 * Pagination component for project list
 * Shows prev/next buttons and current page info
 * Scrolls to top on page change
 */
export function Pagination({ current, total, onChange }: PaginationProps) {
	const handlePageChange = (page: number) => {
		onChange(page);
		// Scroll to top of page
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const canGoToPrevious = current > 1;
	const canGoToNext = current < total;

	return (
		<nav
			aria-label="Pagination"
			className="flex items-center justify-between rounded-lg border border-[--color-border] bg-[--color-surface] px-6 py-4 mt-8"
		>
			<button
				type="button"
				onClick={() => handlePageChange(current - 1)}
				disabled={!canGoToPrevious}
				className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[--color-fg] transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:bg-[--color-bg]"
			>
				← Sebelumnya
			</button>

			<div aria-live="polite" aria-atomic="true" className="text-sm text-[--color-muted]">
				Halaman {current} dari {total}
			</div>

			<button
				type="button"
				onClick={() => handlePageChange(current + 1)}
				disabled={!canGoToNext}
				className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[--color-fg] transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:bg-[--color-bg]"
			>
				Berikutnya →
			</button>
		</nav>
	);
}
