// File: /client/src/components/form/GalleryUploadField.tsx
import { useId, useRef, useState } from "react";
import { useUploadImage } from "@/hooks/queries/use-upload";
import { cn } from "@/lib/cn";
import { FieldError } from "../ui/FieldError";
import { describedBy } from "../ui/field-styles";
import { Label } from "../ui/Label";
import { Spinner } from "../ui/Spinner";
import {
	ALLOWED_TYPES,
	dropZoneClasses,
	FORMAT_HINT,
	UploadIcon,
	validateImage,
} from "./upload-utils";

interface GalleryUploadFieldProps {
	label?: string;
	value: string[];
	onChange: (urls: string[]) => void;
	error?: { message?: string };
	required?: boolean;
	maxImages?: number;
}

const DEFAULT_MAX_IMAGES = 12;

export function GalleryUploadField({
	label,
	value,
	onChange,
	error,
	required,
	maxImages = DEFAULT_MAX_IMAGES,
}: GalleryUploadFieldProps) {
	const id = useId();
	const labelId = `${id}-label`;
	const instructionId = `${id}-instruction`;
	const hintId = `${id}-hint`;
	const errorId = `${id}-error`;
	const inputRef = useRef<HTMLInputElement>(null);
	const { mutateAsync: uploadImage } = useUploadImage();
	const [pending, setPending] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	// Errors keyed by file name so several failed files can be listed at once
	const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

	// Parallel uploads finish one by one; append to the latest list, not the render-time `value`
	const valueRef = useRef(value);
	valueRef.current = value;

	const remainingSlots = maxImages - value.length - pending;
	const hasError = !!error?.message;

	const handleFiles = (files: FileList) => {
		const selected = Array.from(files);
		const filesToProcess = selected.slice(0, Math.max(remainingSlots, 0));
		const nextErrors: Record<string, string> = {};

		if (selected.length > filesToProcess.length) {
			nextErrors._limit = `Maksimal ${maxImages} gambar; ${selected.length - filesToProcess.length} file dilewati`;
		}

		const valid = filesToProcess.filter((file) => {
			const validationError = validateImage(file);
			if (validationError) nextErrors[file.name] = `${file.name}: ${validationError}`;
			return !validationError;
		});

		setUploadErrors(nextErrors);
		if (valid.length === 0) return;

		setPending((n) => n + valid.length);
		for (const file of valid) {
			uploadImage(file)
				.then((url) => {
					const next = [...valueRef.current, url];
					valueRef.current = next;
					onChange(next);
				})
				.catch((err: Error) => {
					setUploadErrors((prev) => ({
						...prev,
						[file.name]: `${file.name}: Upload gagal${err.message ? ` (${err.message})` : ""}`,
					}));
				})
				.finally(() => setPending((n) => n - 1));
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isDragging) setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.files && e.currentTarget.files.length > 0) {
			handleFiles(e.currentTarget.files);
		}
		e.currentTarget.value = "";
	};

	const removeImage = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const errorMessages = Object.entries(uploadErrors);

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-baseline justify-between gap-3">
				{label && (
					<Label id={labelId} required={required}>
						{label}
					</Label>
				)}
				<p className="text-xs text-muted" aria-live="polite">
					{value.length} / {maxImages} gambar
				</p>
			</div>

			{value.length > 0 && (
				<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{value.map((url, index) => (
						<li key={url} className="group relative">
							<img
								src={url}
								alt={`Gambar galeri ${index + 1}`}
								className="aspect-video w-full rounded-md border border-border bg-bg object-cover"
							/>
							<button
								type="button"
								onClick={() => removeImage(index)}
								aria-label={`Hapus gambar ${index + 1}`}
								className="absolute top-1.5 right-1.5 cursor-pointer rounded-full bg-black/70 p-1 text-white transition-opacity hover:bg-red-600 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
							>
								<svg
									aria-hidden="true"
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M18 6 6 18" />
									<path d="m6 6 12 12" />
								</svg>
							</button>
						</li>
					))}
				</ul>
			)}

			{(remainingSlots > 0 || pending > 0) && (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					disabled={remainingSlots <= 0}
					aria-labelledby={describedBy(label && labelId, instructionId)}
					aria-describedby={describedBy(hintId, hasError && errorId)}
					className={cn(dropZoneClasses(hasError, isDragging), "p-6")}
				>
					<span className="flex flex-col items-center gap-2">
						{pending > 0 ? <Spinner label="Mengupload gambar" /> : <UploadIcon />}
						<span id={instructionId} className="text-sm text-fg">
							{pending > 0
								? `Mengupload ${pending} gambar…`
								: `Tambah gambar (tersisa ${remainingSlots})`}
						</span>
						<span id={hintId} className="text-xs">
							Drag & drop atau klik untuk memilih beberapa file • {FORMAT_HINT}
						</span>
					</span>
				</button>
			)}

			<input
				ref={inputRef}
				type="file"
				accept={ALLOWED_TYPES.join(",")}
				multiple
				onChange={handleInputChange}
				className="sr-only"
				tabIndex={-1}
				aria-hidden="true"
			/>

			{errorMessages.length > 0 && (
				<div className="flex items-start justify-between gap-3 rounded-md border border-red-800 bg-red-900/20 p-3">
					<ul className="space-y-1 text-sm text-red-200" role="alert">
						{errorMessages.map(([key, msg]) => (
							<li key={key}>{msg}</li>
						))}
					</ul>
					<button
						type="button"
						onClick={() => setUploadErrors({})}
						className="shrink-0 cursor-pointer text-xs text-red-200 underline hover:text-white"
					>
						Tutup
					</button>
				</div>
			)}

			<FieldError id={errorId} error={error} />
		</div>
	);
}
