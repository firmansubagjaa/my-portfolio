import { cn } from "@/lib/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: "default" | "success" | "error" | "warning" | "neutral" | "accent";
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
	const variantStyles = {
		default: "font-mono text-code border border-border rounded px-2 py-0.5",
		success: "bg-green-900/30 text-green-200",
		error: "bg-red-900/30 text-red-200",
		warning: "bg-yellow-900/30 text-yellow-200",
		neutral: "bg-border text-muted",
		accent: "bg-accent/10 text-accent",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center text-xs",
				variant !== "default" && "rounded-full px-2 py-1 font-medium",
				variantStyles[variant],
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
