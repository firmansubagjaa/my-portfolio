// File: /client/src/components/markdown/highlighter.ts
import { createHighlighterCore } from "shiki";

// Supported languages for syntax highlighting
const SUPPORTED_LANGUAGES = ["ts", "tsx", "js", "json", "bash", "sql", "python", "css", "html"];
let highlighterInstance = null;
/**
 * Get or create a Shiki highlighter instance
 * Lazy-loaded only when needed (on detail pages)
 */
export async function getHighlighter() {
	if (highlighterInstance) {
		return highlighterInstance;
	}
	highlighterInstance = await createHighlighterCore({
		themes: [import("shiki/themes/dark-plus.mjs")],
		langs: SUPPORTED_LANGUAGES.map((lang) => import(`shiki/langs/${lang}.mjs`)),
	});
	return highlighterInstance;
}
