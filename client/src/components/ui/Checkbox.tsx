// File: /client/src/components/ui/Checkbox.tsx
import { forwardRef } from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, className = "", ...props }, ref) => {
		return (
			<div className="flex items-center gap-2">
				<input
					ref={ref}
					type="checkbox"
					className={`w-4 h-4 border border-neutral-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${className}`}
					{...props}
				/>
				{label && (
					<label className="text-sm font-medium text-neutral-700 cursor-pointer">
						{label}
					</label>
				)}
			</div>
		);
	},
);

Checkbox.displayName = "Checkbox";
