// File: /client/src/components/bento/BentoSkeleton.tsx
import { Skeleton } from "@/components/ui/Skeleton";
import { BENTO_GRID_CLASS, bentoCellClass } from "./bento-layout";

// Typical first page: 1 lead featured, 2 featured, 3 regular — same spans as BentoGrid
const SKELETON_CELLS = [
	bentoCellClass(true, true),
	bentoCellClass(true, false),
	bentoCellClass(true, false),
	bentoCellClass(false, false),
	bentoCellClass(false, false),
	bentoCellClass(false, false),
];

export function BentoSkeleton() {
	return (
		<div aria-busy="true">
			<span className="sr-only">Memuat proyek</span>
			<ul className={BENTO_GRID_CLASS} aria-hidden="true">
				{SKELETON_CELLS.map((cell, i) => (
					<li key={i} className={`${cell} min-h-[220px]`}>
						<Skeleton className="h-full w-full rounded-xl" />
					</li>
				))}
			</ul>
		</div>
	);
}
