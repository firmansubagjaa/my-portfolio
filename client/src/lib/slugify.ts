// File: /client/src/lib/slugify.ts
/**
 * Convert title to URL-friendly slug
 * Lowercase, replace spaces/special chars with hyphens, trim, remove consecutive hyphens
 */
export function slugify(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace consecutive hyphens with single hyphen
		.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
