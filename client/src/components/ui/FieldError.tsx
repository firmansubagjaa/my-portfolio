// File: /client/src/components/ui/FieldError.tsx
interface FieldErrorProps {
	id?: string;
	error?: { message?: string };
}

export function FieldError({ id, error }: FieldErrorProps) {
	if (!error?.message) return null;

	return (
		<p id={id} className="text-sm text-red-400">
			{error.message}
		</p>
	);
}
