// File: /client/src/components/ui/Select.tsx
import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";
import { FieldError } from "./FieldError";
import { describedBy, fieldControlClasses } from "./field-styles";
import { Label } from "./Label";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	labelClassName?: string;
	error?: { message?: string };
	required?: boolean;
	options: { value: string; label: string }[];
	/** Text of the empty option; `false` renders no empty option */
	placeholder?: string | false;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			label,
			labelClassName,
			error,
			required,
			options,
			placeholder = "-- Pilih --",
			className,
			id: idProp,
			...props
		},
		ref,
	) => {
		const generatedId = useId();
		const id = idProp ?? generatedId;
		const errorId = `${id}-error`;
		const hasError = !!error?.message;

		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<Label htmlFor={id} required={required} className={labelClassName}>
						{label}
					</Label>
				)}
				<select
					ref={ref}
					id={id}
					aria-invalid={hasError || undefined}
					aria-required={required || undefined}
					aria-describedby={describedBy(hasError && errorId)}
					className={fieldControlClasses(hasError, cn("cursor-pointer", className))}
					{...props}
				>
					{placeholder !== false && (
						<option value="" className="bg-surface text-fg">
							{placeholder}
						</option>
					)}
					{options.map((opt) => (
						<option key={opt.value} value={opt.value} className="bg-surface text-fg">
							{opt.label}
						</option>
					))}
				</select>
				<FieldError id={errorId} error={error} />
			</div>
		);
	},
);

Select.displayName = "Select";
