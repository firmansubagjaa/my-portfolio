import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
export function Card({ className, children, ...props }) {
	return _jsx("div", {
		className: cn(
			"bg-[--color-surface] border border-[--color-border] rounded px-6 py-4",
			className,
		),
		...props,
		children: children,
	});
}
