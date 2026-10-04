import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: /client/src/components/projects/ProjectMeta.tsx
import { Badge } from "@/components/ui/Badge";
/**
 * Display project metadata and links
 */
export function ProjectMeta({ project }) {
	return _jsxs("div", {
		className: "space-y-6 border-t border-[--color-border] pt-6",
		children: [
			project.tech_stack &&
				project.tech_stack.length > 0 &&
				_jsxs("div", {
					children: [
						_jsx("h3", {
							className: "text-sm font-semibold text-[--color-fg] mb-3",
							children: "Teknologi yang Digunakan",
						}),
						_jsx("div", {
							className: "flex flex-wrap gap-2",
							children: project.tech_stack.map((tech) => _jsx(Badge, { children: tech }, tech)),
						}),
					],
				}),
			_jsxs("div", {
				className: "flex gap-4 flex-wrap",
				children: [
					project.demo_url &&
						_jsx("a", {
							href: project.demo_url,
							target: "_blank",
							rel: "noopener noreferrer",
							className:
								"inline-block bg-[--color-accent] text-[--color-bg] px-6 py-3 rounded hover:bg-[--color-accent]/90 transition-colors font-medium",
							children: "Lihat Demo",
						}),
					project.repo_url &&
						_jsx("a", {
							href: project.repo_url,
							target: "_blank",
							rel: "noopener noreferrer",
							className:
								"inline-block bg-[--color-surface] border border-[--color-border] text-[--color-fg] px-6 py-3 rounded hover:bg-[--color-surface]/80 transition-colors font-medium",
							children: "Lihat Repository",
						}),
					project.notebook_url &&
						_jsx("a", {
							href: project.notebook_url,
							target: "_blank",
							rel: "noopener noreferrer",
							className:
								"inline-block bg-[--color-surface] border border-[--color-border] text-[--color-fg] px-6 py-3 rounded hover:bg-[--color-surface]/80 transition-colors font-medium",
							children: "Lihat Notebook",
						}),
				],
			}),
		],
	});
}
