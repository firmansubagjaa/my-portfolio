// File: /client/src/components/form/ImageUploadField.tsx
import { useId, useRef, useState } from "react";
import { useUploadImage } from "@/hooks/queries/use-upload";
import { cn } from "@/lib/cn";
import { Button } from "../ui/Button";
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

interface ImageUploadFieldProps {
	label?: string;
	value?: string;
	onChange: (url: string) => void;
	error?: { message?: string };
	required?: boolean;
}

export function ImageUploadField({
	label,
	value,
	onChange,
	error,
	required,
}: ImageUploadFieldProps) {
	const id = useId();
	const labelId = `${id}-label`;
	const instructionId = `${id}-instruction`;
	const hintId = `${id}-hint`;
	const errorId = `${id}-error`;
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const { mutate: uploadImage, isPending } = useUploadImage();

	const shownError = uploadError ? { message: uploadError } : error;
	const hasError = !!shownError?.message;

	const handleFile = (file: File) => {
		const validationError = validateImage(file);
		if (validationError) {
			setUploadError(validationError);
			return;
		}

		setUploadError(null);
		uploadImage(file, {
			onSuccess: (url) => onChange(url),
			onError: (err) => setUploadError(`Upload gagal: ${err.message || "coba lagi"}`),
		});
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
		const file = e.dataTransfer.files[0];
		if (file && !isPending) handleFile(file);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.currentTarget.files?.[0];
		if (file) handleFile(file);
		// Allow picking the same file again after an error
		e.currentTarget.value = "";
	};

	const openPicker = () => inputRef.current?.click();

	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<Label id={labelId} required={required}>
					{label}
				</Label>
			)}

			{value ? (
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
					<img
						src={value}
						alt="Pratinjau thumbnail"
						className="h-48 w-full max-w-sm rounded-md border border-border bg-bg object-cover"
					/>
					<div className="flex gap-2">
						<Button variant="secondary" size="sm" onClick={openPicker} isLoading={isPending}>
							Ganti gambar
						</Button>
						<button
							type="button"
							onClick={() => {
								setUploadError(null);
								onChange("");
							}}
							disabled={isPending}
							className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Hapus gambar
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={openPicker}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					disabled={isPending}
					aria-labelledby={describedBy(label && labelId, instructionId)}
					aria-describedby={describedBy(hintId, hasError && errorId)}
					className={cn(dropZoneClasses(hasError, isDragging), "p-8")}
				>
					{isPending ? (
						<span className="flex flex-col items-center gap-2">
							<Spinner label="Mengupload gambar" />
							<span id={instructionId} className="text-sm">
								Mengupload…
							</span>
						</span>
					) : (
						<span className="flex flex-col items-center gap-2">
							<UploadIcon />
							<span id={instructionId} className="text-sm text-fg">
								Drag & drop gambar di sini atau{" "}
								<span className="text-accent">klik untuk memilih</span>
							</span>
							<span id={hintId} className="text-xs">
								{FORMAT_HINT}
							</span>
						</span>
					)}
				</button>
			)}

			<input
				ref={inputRef}
				type="file"
				accept={ALLOWED_TYPES.join(",")}
				onChange={handleInputChange}
				className="sr-only"
				tabIndex={-1}
				aria-hidden="true"
			/>

			<FieldError id={errorId} error={shownError} />
		</div>
	);
}
