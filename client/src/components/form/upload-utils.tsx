// File: /client/src/components/form/upload-utils.tsx
// Shared validation + visuals for ImageUploadField and GalleryUploadField

export const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const FORMAT_HINT = "PNG, JPG, GIF, WebP • Maks. 10MB";

/** Returns an Indonesian error message, or null when the file is acceptable */
export function validateImage(file: File): string | null {
	if (!ALLOWED_TYPES.includes(file.type)) {
		return "Format file harus PNG, JPG, GIF, atau WebP";
	}
	if (file.size > MAX_FILE_SIZE) {
		return "Ukuran file maksimal 10MB";
	}
	return null;
}

export function dropZoneClasses(hasError: boolean, isDragging: boolean): string {
	const state = hasError
		? "border-red-500 bg-bg/40"
		: isDragging
			? "border-accent bg-accent/10"
			: "border-border bg-bg/40 hover:border-accent/60 hover:bg-bg";
	return `w-full cursor-pointer rounded-lg border-2 border-dashed text-center text-muted transition-colors disabled:cursor-wait ${state}`;
}

export function UploadIcon() {
	return (
		<svg
			aria-hidden="true"
			className="h-6 w-6 text-muted"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<path d="m17 8-5-5-5 5" />
			<path d="M12 3v12" />
		</svg>
	);
}
