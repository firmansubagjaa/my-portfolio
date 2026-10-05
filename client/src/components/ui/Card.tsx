import { cn } from "@/lib/cn";

// Padding is a prop (not a className override) because cn() does not resolve conflicting utilities
const paddingStyles = {
	none: "",
	sm: "p-4",
	md: "px-6 py-4",
	lg: "p-6 sm:p-8",
} as const;

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	padding?: keyof typeof paddingStyles;
}

export function Card({ className, children, padding = "md", ...props }: CardProps) {
	return (
		<div
			className={cn(
				"bg-surface border border-border rounded-lg",
				paddingStyles[padding],
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
