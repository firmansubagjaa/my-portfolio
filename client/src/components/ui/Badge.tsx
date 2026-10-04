import { cn } from "@/lib/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: "default" | "success" | "error" | "warning";
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
	const variantStyles = {
		default: "bg-[--color-surface] text-[--color-fg]",
		success: "bg-green-900/30 text-green-200",
		error: "bg-red-900/30 text-red-200",
		warning: "bg-yellow-900/30 text-yellow-200",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
				variantStyles[variant],
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
