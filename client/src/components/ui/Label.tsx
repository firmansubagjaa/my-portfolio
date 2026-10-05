// File: /client/src/components/ui/Label.tsx
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	required?: boolean;
	children: React.ReactNode;
}

export function Label({ required, children, className = "", ...props }: LabelProps) {
	return (
		<label className={`text-sm font-medium text-neutral-700 ${className}`} {...props}>
			{children}
			{required && <span className="ml-1 text-red-500">*</span>}
		</label>
	);
}
