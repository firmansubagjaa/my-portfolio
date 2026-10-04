// File: /client/src/components/bento/EmptyState.tsx
interface EmptyStateProps {
	message?: string;
}

/**
 * Empty state component shown when no projects are found
 */
export function EmptyState({ message = "Tidak ada proyek tersedia saat ini." }: EmptyStateProps) {
	return (
		<div className="flex min-h-96 items-center justify-center rounded-lg border border-[--color-border] bg-[--color-surface]">
			<p className="text-center text-[--color-muted]">{message}</p>
		</div>
	);
}
