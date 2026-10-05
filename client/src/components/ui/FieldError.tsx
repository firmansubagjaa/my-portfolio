// File: /client/src/components/ui/FieldError.tsx
interface FieldErrorProps {
	error?: { message?: string };
}

export function FieldError({ error }: FieldErrorProps) {
	if (!error?.message) return null;

	return <p className="text-sm text-red-500">{error.message}</p>;
}
