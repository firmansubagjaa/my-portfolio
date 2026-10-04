// File: /server/src/utils/sql.ts
/**
 * Escape special characters in LIKE patterns
 * Escapes %, _, and \ to prevent unintended matches
 *
 * Example: '50%_off\\' -> '50\\%\\_off\\\\'
 */
export function escapeLike(pattern: string): string {
	return pattern.replace(/[%_\\]/g, (char) => `\\${char}`);
}
