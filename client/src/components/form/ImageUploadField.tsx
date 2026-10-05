// File: /client/src/components/form/ImageUploadField.tsx
import { useRef } from "react";
import { useUploadImage } from "@/hooks/queries/use-upload";
import { Spinner } from "../ui/Spinner";
import { Label } from "../ui/Label";
import { FieldError } from "../ui/FieldError";

interface ImageUploadFieldProps {
	label?: string;
	value?: string;
	onChange: (url: string) => void;
	error?: { message?: string };
	required?: boolean;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageUploadField({
	label,
	value,
	onChange,
	error,
	required,
}: ImageUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { mutate: uploadImage, isPending } = useUploadImage();

	const handleFile = (file: File) => {
		// Validate file type
		if (!ALLOWED_TYPES.includes(file.type)) {
			alert("Format file harus PNG, JPG, GIF, atau WebP");
			return;
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			alert("Ukuran file maksimal 10MB");
			return;
		}

		uploadImage(file, {
			onSuccess: (url) => {
				onChange(url);
			},
			onError: (err) => {
				alert(`Upload gagal: ${err.message}`);
			},
		});
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFile(files[0]!);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files;
		if (files && files.length > 0) {
			handleFile(files[0]!);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{label && <Label required={required}>{label}</Label>}

			{value ? (
				<div className="flex flex-col gap-2">
					<img
						src={value}
						alt="Preview"
						className="max-w-xs h-48 object-cover rounded-md"
					/>
					<button
						type="button"
						onClick={() => {
							onChange("");
							if (inputRef.current) inputRef.current.value = "";
						}}
						className="text-sm text-red-500 hover:text-red-600"
					>
						Hapus gambar
					</button>
				</div>
			) : (
				<div
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					onClick={() => inputRef.current?.click()}
					className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
						isPending
							? "border-neutral-500 bg-neutral-800"
							: "border-neutral-500 hover:border-neutral-400 hover:bg-neutral-900"
					} ${error ? "border-red-500" : ""}`}
				>
					{isPending ? (
						<div className="flex flex-col items-center gap-2">
							<Spinner />
							<p className="text-sm text-neutral-300">Mengupload...</p>
						</div>
					) : (
						<div>
							<p className="text-sm text-neutral-300 mb-2">
								Drag & drop gambar di sini atau klik untuk memilih
							</p>
							<p className="text-xs text-neutral-500">
								PNG, JPG, GIF, WebP • Max 10MB
							</p>
						</div>
					)}
					<input
						ref={inputRef}
						type="file"
						accept="image/*"
						onChange={handleInputChange}
						className="hidden"
					/>
				</div>
			)}

			<FieldError error={error} />
		</div>
	);
}
