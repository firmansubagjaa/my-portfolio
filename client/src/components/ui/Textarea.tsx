// File: /client/src/components/ui/Textarea.tsx
import { forwardRef } from "react";
import { Label } from "./Label";
import { FieldError } from "./FieldError";

interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: { message?: string };
	required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ label, error, required, className = "", ...props }, ref) => {
		return (
			<div className="flex flex-col gap-2">
				{label && <Label required={required}>{label}</Label>}
				<textarea
					ref={ref}
					className={`px-3 py-2 border border-neutral-300 rounded-md bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
						error ? "border-red-500" : ""
					} ${className}`}
					{...props}
				/>
				<FieldError error={error} />
			</div>
		);
	},
);

Textarea.displayName = "Textarea";
