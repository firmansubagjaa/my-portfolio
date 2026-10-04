import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: /client/src/components/bento/BentoSkeleton.tsx
import { Skeleton } from "@/components/ui/Skeleton";
/**
 * Skeleton loader for BentoGrid
 * Matches the exact grid layout of BentoGrid to prevent CLS (Cumulative Layout Shift)
 */
export function BentoSkeleton() {
	return _jsxs("div", {
		className: "grid grid-cols-1 gap-6 md:grid-cols-6 lg:grid-cols-12 auto-rows-[300px]",
		children: [
			_jsx("div", {
				className: "col-span-1 md:col-span-3 lg:col-span-4 md:row-span-2 lg:row-span-2",
				children: _jsx(Skeleton, { className: "h-full w-full rounded-lg" }),
			}),
			_jsx("div", {
				className: "col-span-1 md:col-span-3 lg:col-span-4 md:row-span-2 lg:row-span-2",
				children: _jsx(Skeleton, { className: "h-full w-full rounded-lg" }),
			}),
			_jsx("div", {
				className: "col-span-1 md:col-span-2 lg:col-span-2",
				children: _jsx(Skeleton, { className: "h-full w-full rounded-lg" }),
			}),
			_jsx("div", {
				className: "col-span-1 md:col-span-3 lg:col-span-3",
				children: _jsx(Skeleton, { className: "h-full w-full rounded-lg" }),
			}),
			_jsx("div", {
				className: "col-span-1 md:col-span-3 lg:col-span-3",
				children: _jsx(Skeleton, { className: "h-full w-full rounded-lg" }),
			}),
			_jsx("div", {
				className: "col-span-1 md:col-span-2 lg:col-span-2",
				children: _jsx(Skeleton, { className: "h-full w-full rounded-lg" }),
			}),
		],
	});
}
