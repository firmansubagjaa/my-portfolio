// File: /client/src/components/markdown/highlighter.ts
import type { HighlighterCore } from "shiki/core";

// Cache the Promise so concurrent CodeBlocks share one highlighter instance
let highlighterPromise: Promise<HighlighterCore> | null = null;

/**
 * Lazy singleton Shiki highlighter. Everything (core, engine, themes, langs)
 * is dynamically imported so Shiki stays out of the entry bundle.
 * Static string specifiers let Vite analyze and code-split each import.
 */
export function getHighlighter(): Promise<HighlighterCore> {
	if (!highlighterPromise) {
		highlighterPromise = (async () => {
			const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
				import("shiki/core"),
				import("shiki/engine/javascript"),
			]);

			return createHighlighterCore({
				engine: createJavaScriptRegexEngine(),
				themes: [import("shiki/themes/vitesse-dark.mjs")],
				langs: [
					import("shiki/langs/typescript.mjs"),
					import("shiki/langs/tsx.mjs"),
					import("shiki/langs/javascript.mjs"),
					import("shiki/langs/json.mjs"),
					import("shiki/langs/bash.mjs"),
					import("shiki/langs/sql.mjs"),
					import("shiki/langs/python.mjs"),
					import("shiki/langs/css.mjs"),
					import("shiki/langs/html.mjs"),
				],
			});
		})();
	}
	return highlighterPromise;
}
