// File: /client/src/components/bento/bento-layout.ts
// Shared by BentoGrid and BentoSkeleton so both produce identical cells (no CLS).

export const BENTO_GRID_CLASS =
	"grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[minmax(220px,auto)]";

/**
 * Cell span rules (issue #4, 3.7):
 * - first featured item: 4 cols x 2 rows
 * - other featured items: 3 cols
 * - regular items: 2 cols
 */
export function bentoCellClass(isFeatured: boolean, isFirstFeatured: boolean): string {
	if (isFeatured && isFirstFeatured) return "md:col-span-4 md:row-span-2";
	if (isFeatured) return "md:col-span-3";
	return "md:col-span-2";
}
