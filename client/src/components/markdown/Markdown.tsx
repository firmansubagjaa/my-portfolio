// File: /client/src/components/markdown/Markdown.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

interface MarkdownProps {
	content: string;
}

/**
 * Markdown renderer with syntax highlighting support
 * Uses react-markdown with GitHub-flavored markdown
 */
export function Markdown({ content }: MarkdownProps) {
	return (
		<div className="prose prose-invert max-w-none">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					code: ({ node, inline, className, children, ...props }) => {
						const match = /language-(\w+)/.exec(className || "");
						const lang: string = match?.[1] || "text";

						if (!inline && match) {
							return <CodeBlock code={String(children).replace(/\n$/, "")} language={lang} />;
						}

						return (
							<code className={className} {...props}>
								{children}
							</code>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
