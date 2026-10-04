import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";
export function Button({
	variant = "primary",
	size = "md",
	isLoading = false,
	className,
	children,
	disabled,
	...props
}) {
	const baseStyles = "inline-flex items-center justify-center font-medium transition-colors";
	const variantStyles = {
		primary:
			"bg-[--color-accent] text-[--color-bg] hover:bg-[--color-accent]/90 disabled:opacity-50",
		secondary:
			"bg-[--color-surface] border border-[--color-border] text-[--color-fg] hover:bg-[--color-surface]/80 disabled:opacity-50",
		ghost: "text-[--color-fg] hover:bg-[--color-surface]/50 disabled:opacity-50",
	};
	const sizeStyles = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-base",
		lg: "px-6 py-3 text-lg",
	};
	return _jsx("button", {
		className: cn(baseStyles, variantStyles[variant], sizeStyles[size], className),
		disabled: isLoading || disabled,
		...props,
		children: isLoading ? _jsx(Spinner, {}) : children,
	});
}
