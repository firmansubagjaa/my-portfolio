// File: /client/src/components/bento/BentoSkeleton.tsx
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton loader for BentoGrid
 * Matches the exact grid layout of BentoGrid to prevent CLS (Cumulative Layout Shift)
 */
export function BentoSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-6 lg:grid-cols-12 auto-rows-[300px]">
			{/* Featured 1 - 4x2 */}
			<div className="col-span-1 md:col-span-3 lg:col-span-4 md:row-span-2 lg:row-span-2">
				<Skeleton className="h-full w-full rounded-lg" />
			</div>

			{/* Featured 2 - 4x2 */}
			<div className="col-span-1 md:col-span-3 lg:col-span-4 md:row-span-2 lg:row-span-2">
				<Skeleton className="h-full w-full rounded-lg" />
			</div>

			{/* Regular 1 - 2x1 */}
			<div className="col-span-1 md:col-span-2 lg:col-span-2">
				<Skeleton className="h-full w-full rounded-lg" />
			</div>

			{/* Other featured 1 - 3x1 */}
			<div className="col-span-1 md:col-span-3 lg:col-span-3">
				<Skeleton className="h-full w-full rounded-lg" />
			</div>

			{/* Other featured 2 - 3x1 */}
			<div className="col-span-1 md:col-span-3 lg:col-span-3">
				<Skeleton className="h-full w-full rounded-lg" />
			</div>

			{/* Regular 2 - 2x1 */}
			<div className="col-span-1 md:col-span-2 lg:col-span-2">
				<Skeleton className="h-full w-full rounded-lg" />
			</div>
		</div>
	);
}
