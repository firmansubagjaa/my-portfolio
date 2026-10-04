// File: /client/src/components/markdown/CodeBlock.tsx
"use client";
import { useEffect, useState } from "react";
import { jsx as _jsx } from "react/jsx-runtime";
import { getHighlighter } from "./highlighter";
/**
 * Code block with lazy-loaded Shiki syntax highlighting
 * Renders plain code first, then updates with highlighted version
 */
export function CodeBlock({ code, language }) {
	const [highlighted, setHighlighted] = useState(null);
	useEffect(() => {
		let isMounted = true;
		async function highlightCode() {
			try {
				const highlighter = await getHighlighter();
				const html = highlighter.codeToHtml(code, {
					lang: language,
					theme: "dark-plus",
				});
				if (isMounted) {
					setHighlighted(html);
				}
			} catch (err) {
				if (isMounted) {
					// Silently fail - show plain code
					console.warn("Failed to highlight code:", err);
				}
			}
		}
		highlightCode();
		return () => {
			isMounted = false;
		};
	}, [code, language]);
	return _jsx("pre", {
		className: "overflow-x-auto rounded bg-[--color-bg] p-4 my-4",
		children: highlighted
			? _jsx("code", {
					dangerouslySetInnerHTML: { __html: highlighted },
					className: `language-${language}`,
				})
			: _jsx("code", { className: `language-${language}`, children: code }),
	});
}
