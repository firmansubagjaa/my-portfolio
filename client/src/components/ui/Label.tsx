// File: /client/src/components/ui/Label.tsx
import { cn } from "@/lib/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	required?: boolean;
	children: React.ReactNode;
}

export function Label({ required, children, className, htmlFor, ...props }: LabelProps) {
	return (
		<label htmlFor={htmlFor} className={cn("text-sm font-medium text-fg", className)} {...props}>
			{children}
			{required && (
				<span aria-hidden="true" className="ml-1 text-red-400">
					*
				</span>
			)}
		</label>
	);
}
