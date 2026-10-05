// File: /client/src/components/ui/Select.tsx
import { forwardRef } from "react";
import { Label } from "./Label";
import { FieldError } from "./FieldError";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: { message?: string };
	required?: boolean;
	options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, error, required, options, className = "", ...props }, ref) => {
		return (
			<div className="flex flex-col gap-2">
				{label && <Label required={required}>{label}</Label>}
				<select
					ref={ref}
					className={`px-3 py-2 border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
						error ? "border-red-500" : ""
					} ${className}`}
					{...props}
				>
					<option value="">-- Pilih --</option>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				<FieldError error={error} />
			</div>
		);
	},
);

Select.displayName = "Select";
