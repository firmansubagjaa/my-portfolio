// File: /client/src/components/bento/BentoGrid.tsx
"use client";
import { AnimatePresence, LayoutGroup } from "motion/react";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Bento grid layout with featured projects support
 * - Featured projects (first 2): col-span-4 row-span-2
 * - Other featured projects: col-span-3
 * - Regular projects: col-span-2
 * - Responsive: 1 column on mobile, 6 columns on desktop, 12 on large screens
 */
export function BentoGrid({ children, projects = [] }) {
	return _jsx(LayoutGroup, {
		children: _jsx(AnimatePresence, {
			mode: "popLayout",
			children: _jsx("div", {
				className: "grid grid-cols-1 gap-6 md:grid-cols-6 lg:grid-cols-12 auto-rows-[300px]",
				children:
					children &&
					children.map((child, index) => {
						const project = projects[index];
						let colSpan = "md:col-span-2 lg:col-span-2";
						let rowSpan = "md:row-span-1 lg:row-span-1";
						// Featured projects (first 2) take up 4x2 on desktop
						if (project?.is_featured && index < 2) {
							colSpan = "md:col-span-3 lg:col-span-4";
							rowSpan = "md:row-span-2 lg:row-span-2";
						}
						// Other featured projects take 3x1
						else if (project?.is_featured) {
							colSpan = "md:col-span-3 lg:col-span-3";
							rowSpan = "md:row-span-1 lg:row-span-1";
						}
						return _jsx(
							"div",
							{ className: `${colSpan} ${rowSpan} col-span-1`, children: child },
							project?.id || index,
						);
					}),
			}),
		}),
	});
}
