import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"bg-[--color-surface] border border-[--color-border] rounded px-6 py-4",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
