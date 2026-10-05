// File: /client/src/components/ui/Input.tsx
import { forwardRef } from "react";
import { Label } from "./Label";
import { FieldError } from "./FieldError";

interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: { message?: string };
	required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, required, className = "", ...props }, ref) => {
		return (
			<div className="flex flex-col gap-2">
				{label && <Label required={required}>{label}</Label>}
				<input
					ref={ref}
					className={`px-3 py-2 border border-neutral-300 rounded-md bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
						error ? "border-red-500" : ""
					} ${className}`}
					{...props}
				/>
				<FieldError error={error} />
			</div>
		);
	},
);

Input.displayName = "Input";
