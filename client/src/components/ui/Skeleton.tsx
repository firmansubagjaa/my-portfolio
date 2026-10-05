import { cn } from "@/lib/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	/** "border" stays visible when the skeleton sits on a bg-surface card */
	tone?: "surface" | "border";
}

export function Skeleton({ className, tone = "surface", ...props }: SkeletonProps) {
	return (
		<div
			className={cn(
				"animate-pulse rounded",
				tone === "border" ? "bg-border" : "bg-surface",
				className,
			)}
			{...props}
		/>
	);
}
