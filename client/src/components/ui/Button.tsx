import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const baseStyles =
	"inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

// Colors live only in variants: cn() is a plain join, so color overrides via className are not reliable
const variantStyles: Record<ButtonVariant, string> = {
	primary: "bg-accent text-bg hover:bg-accent/90",
	secondary: "bg-surface border border-border text-fg hover:border-accent/60 hover:bg-bg",
	ghost: "text-muted hover:text-fg hover:bg-surface",
	danger: "bg-red-600 text-white hover:bg-red-500",
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-sm",
	lg: "px-6 py-3 text-base",
};

interface ButtonClassOptions {
	variant?: ButtonVariant;
	size?: ButtonSize;
	className?: string;
}

/** Button styles for non-button elements (e.g. a router <Link> that should look like a button) */
export function buttonClasses({
	variant = "primary",
	size = "md",
	className,
}: ButtonClassOptions = {}): string {
	return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	ref?: React.Ref<HTMLButtonElement>;
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
}

export function Button({
	variant = "primary",
	size = "md",
	isLoading = false,
	className,
	children,
	disabled,
	type = "button",
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={buttonClasses({ variant, size, className })}
			disabled={isLoading || disabled}
			aria-busy={isLoading || undefined}
			{...props}
		>
			{isLoading && <Spinner />}
			{children}
		</button>
	);
}
