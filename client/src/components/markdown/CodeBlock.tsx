// File: /client/src/components/markdown/CodeBlock.tsx
"use client";

import { useEffect, useState } from "react";
import { getHighlighter } from "./highlighter";

interface CodeBlockProps {
	code: string;
	language: string;
}

/**
 * Code block with lazy-loaded Shiki syntax highlighting
 * Renders plain code first, then updates with highlighted version
 */
export function CodeBlock({ code, language }: CodeBlockProps) {
	const [highlighted, setHighlighted] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function highlightCode() {
			try {
				const highlighter = await getHighlighter();
				const html = highlighter.codeToHtml(code, {
					lang: language,
					theme: "vitesse-dark",
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

	return highlighted ? (
		<div
			dangerouslySetInnerHTML={{ __html: highlighted }}
			className="shiki-wrapper my-4"
		/>
	) : (
		<pre className="overflow-x-auto rounded bg-bg p-4 my-4">
			<code className={`language-${language}`}>{code}</code>
		</pre>
	);
}
