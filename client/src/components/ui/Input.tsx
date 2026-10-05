// File: /client/src/components/ui/Input.tsx
import { forwardRef, useId } from "react";
import { FieldError } from "./FieldError";
import { describedBy, fieldControlClasses } from "./field-styles";
import { Label } from "./Label";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	labelClassName?: string;
	hint?: React.ReactNode;
	error?: { message?: string };
	required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, labelClassName, hint, error, required, className, id: idProp, ...props }, ref) => {
		const generatedId = useId();
		const id = idProp ?? generatedId;
		const hintId = `${id}-hint`;
		const errorId = `${id}-error`;
		const hasError = !!error?.message;

		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<Label htmlFor={id} required={required} className={labelClassName}>
						{label}
					</Label>
				)}
				<input
					ref={ref}
					id={id}
					aria-invalid={hasError || undefined}
					aria-required={required || undefined}
					aria-describedby={describedBy(hint !== undefined && hintId, hasError && errorId)}
					className={fieldControlClasses(hasError, className)}
					{...props}
				/>
				{hint !== undefined && (
					<p id={hintId} className="text-xs text-muted">
						{hint}
					</p>
				)}
				<FieldError id={errorId} error={error} />
			</div>
		);
	},
);

Input.displayName = "Input";
