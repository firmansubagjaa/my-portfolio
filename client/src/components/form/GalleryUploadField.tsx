// File: /client/src/components/form/GalleryUploadField.tsx
import { useRef, useState } from "react";
import { useUploadImage } from "@/hooks/queries/use-upload";
import { Spinner } from "../ui/Spinner";
import { Label } from "../ui/Label";
import { FieldError } from "../ui/FieldError";

interface GalleryUploadFieldProps {
	label?: string;
	value: string[];
	onChange: (urls: string[]) => void;
	error?: { message?: string };
	required?: boolean;
	maxImages?: number;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MAX_IMAGES = 12;

export function GalleryUploadField({
	label,
	value,
	onChange,
	error,
	required,
	maxImages = DEFAULT_MAX_IMAGES,
}: GalleryUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
	const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});

	const handleFiles = (files: FileList) => {
		const remainingSlots = maxImages - value.length;
		const filesToProcess = Array.from(files).slice(0, remainingSlots);

		filesToProcess.forEach((file, index) => {
			// Validate file type
			if (!ALLOWED_TYPES.includes(file.type)) {
				setUploadErrors((prev) => ({
					...prev,
					[index]: "Format harus PNG, JPG, GIF, atau WebP",
				}));
				return;
			}

			// Validate file size
			if (file.size > MAX_FILE_SIZE) {
				setUploadErrors((prev) => ({
					...prev,
					[index]: "Ukuran maksimal 10MB",
				}));
				return;
			}

			uploadImage(file, {
				onSuccess: (url) => {
					onChange([...value, url]);
					setUploadErrors((prev) => {
						const newErrors = { ...prev };
						delete newErrors[index];
						return newErrors;
					});
				},
				onError: (err) => {
					setUploadErrors((prev) => ({
						...prev,
						[index]: err.message,
					}));
				},
			});
		});
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.dataTransfer.files) {
			handleFiles(e.dataTransfer.files);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			handleFiles(e.currentTarget.files);
		}
	};

	const removeImage = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const remainingSlots = maxImages - value.length;

	return (
		<div className="flex flex-col gap-4">
			{label && <Label required={required}>{label}</Label>}

			{value.length > 0 && (
				<div>
					<p className="text-xs text-neutral-400 mb-2">
						{value.length} / {maxImages} gambar
					</p>
					<div className="grid grid-cols-4 gap-3">
						{value.map((url, index) => (
							<div key={index} className="relative group">
								<img
									src={url}
									alt={`Gallery ${index}`}
									className="w-full h-24 object-cover rounded-md"
								/>
								<button
									type="button"
									onClick={() => removeImage(index)}
									className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md"
								>
									<span className="text-white text-lg font-semibold">×</span>
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{remainingSlots > 0 && (
				<div
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					onClick={() => inputRef.current?.click()}
					className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
						isUploading
							? "border-neutral-500 bg-neutral-800"
							: "border-neutral-500 hover:border-neutral-400 hover:bg-neutral-900"
					} ${error ? "border-red-500" : ""}`}
				>
					{isUploading ? (
						<div className="flex flex-col items-center gap-2">
							<Spinner />
							<p className="text-sm text-neutral-300">Mengupload...</p>
						</div>
					) : (
						<div>
							<p className="text-sm text-neutral-300 mb-1">
								Tambah gambar (Tersisa: {remainingSlots})
							</p>
							<p className="text-xs text-neutral-500">
								Drag & drop atau klik untuk memilih
							</p>
						</div>
					)}
					<input
						ref={inputRef}
						type="file"
						accept="image/*"
						multiple
						onChange={handleInputChange}
						className="hidden"
					/>
				</div>
			)}

			{Object.keys(uploadErrors).length > 0 && (
				<div className="space-y-1">
					{Object.entries(uploadErrors).map(([key, msg]) => (
						<p key={key} className="text-sm text-red-500">
							{msg}
						</p>
					))}
				</div>
			)}

			<FieldError error={error} />
		</div>
	);
}
