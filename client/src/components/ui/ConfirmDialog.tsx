// File: /client/src/components/ui/ConfirmDialog.tsx
import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	isDangerous?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
	/** Error from the last confirm attempt, shown inside the dialog */
	error?: string | null;
}

const FOCUSABLE =
	'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ConfirmDialog({
	title,
	description,
	confirmLabel = "Konfirmasi",
	cancelLabel = "Batal",
	isDangerous = false,
	onConfirm,
	onCancel,
	isLoading = false,
	error,
}: ConfirmDialogProps) {
	const titleId = useId();
	const descriptionId = useId();
	const panelRef = useRef<HTMLDivElement>(null);
	const cancelRef = useRef<HTMLButtonElement>(null);

	// Keep the latest callbacks/state for the keydown listener without re-binding it
	const onCancelRef = useRef(onCancel);
	const isLoadingRef = useRef(isLoading);
	onCancelRef.current = onCancel;
	isLoadingRef.current = isLoading;

	// Focus management + scroll lock: focus "Batal" (safe default), restore focus on close
	useEffect(() => {
		const previouslyFocused = document.activeElement as HTMLElement | null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		cancelRef.current?.focus();

		return () => {
			document.body.style.overflow = previousOverflow;
			previouslyFocused?.focus?.();
		};
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				if (!isLoadingRef.current) onCancelRef.current();
				return;
			}

			if (event.key !== "Tab" || !panelRef.current) return;

			// Trap Tab / Shift+Tab inside the dialog
			const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			if (!first || !last) {
				event.preventDefault();
				return;
			}
			const active = document.activeElement;

			if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && (active === last || !panelRef.current.contains(active))) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: backdrop click is a mouse shortcut; Escape and "Batal" cover keyboard users
		// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling is on the document (Escape)
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
			onClick={(event) => {
				if (event.target === event.currentTarget && !isLoading) onCancel();
			}}
		>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-fg shadow-xl"
			>
				<div className="flex items-start gap-4">
					{isDangerous && (
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-900/30 text-red-400">
							<svg
								aria-hidden="true"
								className="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M12 9v4" />
								<path d="M12 17h.01" />
								<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
							</svg>
						</div>
					)}
					<div className="min-w-0 flex-1">
						<h2 id={titleId} className="text-lg font-semibold text-fg">
							{title}
						</h2>
						<p id={descriptionId} className="mt-2 text-sm text-muted">
							{description}
						</p>
					</div>
				</div>

				{error && (
					<div
						role="alert"
						className="mt-4 rounded-md border border-red-800 bg-red-900/20 p-3 text-sm text-red-200"
					>
						{error}
					</div>
				)}

				<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={isLoading}>
						{cancelLabel}
					</Button>
					<Button
						variant={isDangerous ? "danger" : "primary"}
						onClick={onConfirm}
						isLoading={isLoading}
					>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
