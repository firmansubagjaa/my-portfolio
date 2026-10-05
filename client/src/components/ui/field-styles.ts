// File: /client/src/components/ui/field-styles.ts
import { cn } from "@/lib/cn";

/** Shared look for text-like form controls (input, textarea, select) on the dark theme */
export function fieldControlClasses(hasError: boolean, className?: string): string {
	return cn(
		"w-full rounded-md border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
		hasError
			? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
			: "border-border hover:border-muted/50 focus:border-accent focus:ring-accent/30",
		className,
	);
}

/** Joins the ids of helper/error text for aria-describedby (undefined when empty) */
export function describedBy(...ids: (string | false | undefined)[]): string | undefined {
	const joined = ids.filter(Boolean).join(" ");
	return joined.length > 0 ? joined : undefined;
}
