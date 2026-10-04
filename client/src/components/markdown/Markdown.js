import { jsx as _jsx } from "react/jsx-runtime";
// File: /client/src/components/markdown/Markdown.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
/**
 * Markdown renderer with syntax highlighting support
 * Uses react-markdown with GitHub-flavored markdown
 */
export function Markdown({ content }) {
	return _jsx("div", {
		className: "prose prose-invert max-w-none",
		children: _jsx(ReactMarkdown, {
			remarkPlugins: [remarkGfm],
			components: {
				code: ({ node, inline, className, children, ...props }) => {
					const match = /language-(\w+)/.exec(className || "");
					const lang = match?.[1] || "text";
					if (!inline && match) {
						return _jsx(CodeBlock, { code: String(children).replace(/\n$/, ""), language: lang });
					}
					return _jsx("code", { className: className, ...props, children: children });
				},
			},
			children: content,
		}),
	});
}
