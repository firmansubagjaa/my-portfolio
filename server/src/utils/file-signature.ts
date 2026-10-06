// File: /server/src/utils/file-signature.ts
export type DetectedImageType = "png" | "jpg" | "gif" | "webp";

const IMAGE_MIME_TYPES: Record<DetectedImageType, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	gif: "image/gif",
	webp: "image/webp",
};

/**
 * Map a magic-byte detected image type to its proper MIME type.
 * Note: "jpg" maps to "image/jpeg" ("image/jpg" is not a valid MIME type).
 */
export function getMimeTypeFromImageType(type: DetectedImageType): string {
	return IMAGE_MIME_TYPES[type];
}

/**
 * Detect image type from magic bytes (file signature)
 * Returns: 'png' | 'jpg' | 'gif' | 'webp' | 'unknown'
 *
 * Does NOT rely on MIME type or file extension; reads actual file bytes.
 */
export function detectImageType(
	buffer: Uint8Array,
): DetectedImageType | "unknown" {
	// PNG: 89 50 4E 47
	if (
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47
	) {
		return "png";
	}

	// JPEG: FF D8 FF
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
		return "jpg";
	}

	// GIF: 47 49 46 38
	if (
		buffer[0] === 0x47 &&
		buffer[1] === 0x49 &&
		buffer[2] === 0x46 &&
		buffer[3] === 0x38
	) {
		return "gif";
	}

	// WebP: 52 49 46 46 ... 57 45 42 50 (RIFF ... WEBP)
	if (
		buffer[0] === 0x52 &&
		buffer[1] === 0x49 &&
		buffer[2] === 0x46 &&
		buffer[3] === 0x46 &&
		buffer[8] === 0x57 &&
		buffer[9] === 0x45 &&
		buffer[10] === 0x42 &&
		buffer[11] === 0x50
	) {
		return "webp";
	}

	return "unknown";
}
