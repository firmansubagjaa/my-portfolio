import { cn } from "@/lib/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
	return <div className={cn("animate-pulse bg-[--color-surface] rounded", className)} {...props} />;
}
