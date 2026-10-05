// File: /client/src/components/ui/ConfirmDialog.tsx
import { Button } from "./Button";
import { Spinner } from "./Spinner";

interface ConfirmDialogProps {
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	isDangerous?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export function ConfirmDialog({
	title,
	description,
	confirmLabel = "Konfirmasi",
	cancelLabel = "Batal",
	isDangerous = false,
	onConfirm,
	onCancel,
	isLoading = false,
}: ConfirmDialogProps) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-neutral-900 text-white rounded-lg p-6 max-w-sm w-full mx-4">
				<h2 className="text-lg font-semibold mb-2">{title}</h2>
				<p className="text-sm text-neutral-300 mb-6">{description}</p>

				<div className="flex gap-3 justify-end">
					<Button
						variant="secondary"
						onClick={onCancel}
						disabled={isLoading}
					>
						{cancelLabel}
					</Button>
					<Button
						variant={isDangerous ? "secondary" : "primary"}
						onClick={onConfirm}
						disabled={isLoading}
						className={isDangerous ? "bg-red-600 hover:bg-red-700" : ""}
					>
						{isLoading ? <Spinner /> : confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
