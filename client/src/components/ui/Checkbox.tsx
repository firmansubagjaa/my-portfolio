// File: /client/src/components/ui/Checkbox.tsx
import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
	label?: string;
	description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, description, className, id: idProp, ...props }, ref) => {
		const generatedId = useId();
		const id = idProp ?? generatedId;
		const descriptionId = `${id}-description`;

		return (
			<div className="flex items-start gap-3">
				<input
					ref={ref}
					id={id}
					type="checkbox"
					aria-describedby={description ? descriptionId : undefined}
					className={cn(
						"mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border bg-bg accent-accent",
						className,
					)}
					{...props}
				/>
				{(label || description) && (
					<div className="flex flex-col gap-0.5">
						{label && (
							<label htmlFor={id} className="cursor-pointer text-sm font-medium text-fg">
								{label}
							</label>
						)}
						{description && (
							<p id={descriptionId} className="text-xs text-muted">
								{description}
							</p>
						)}
					</div>
				)}
			</div>
		);
	},
);

Checkbox.displayName = "Checkbox";
