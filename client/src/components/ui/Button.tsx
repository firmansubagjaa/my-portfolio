import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
}

export function Button({
	variant = "primary",
	size = "md",
	isLoading = false,
	className,
	children,
	disabled,
	...props
}: ButtonProps) {
	const baseStyles = "inline-flex items-center justify-center font-medium transition-colors";

	const variantStyles = {
		primary: "bg-accent text-bg hover:bg-accent/90 disabled:opacity-50",
		secondary: "bg-surface border border-border text-fg hover:bg-surface/80 disabled:opacity-50",
		ghost: "text-fg hover:bg-surface/50 disabled:opacity-50",
	};

	const sizeStyles = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-base",
		lg: "px-6 py-3 text-lg",
	};

	return (
		<button
			className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
			disabled={isLoading || disabled}
			{...props}
		>
			{isLoading ? <Spinner /> : children}
		</button>
	);
}
