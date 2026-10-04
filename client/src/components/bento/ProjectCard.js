// File: /client/src/components/bento/ProjectCard.tsx
"use client";
import { motion } from "motion/react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router";
import { Badge } from "@/components/ui/Badge";
/**
 * Card component for displaying a project in the bento grid
 * Renders as an article with layout animation support
 */
export function ProjectCard({ project }) {
	return _jsx(motion.article, {
		layout: true,
		className:
			"relative h-full overflow-hidden rounded-lg border border-[--color-border] bg-[--color-surface] transition-colors hover:border-[--color-accent] has-[a:focus-visible]:ring-2",
		children: _jsxs(Link, {
			to: `/projects/${project.slug}`,
			className: "after:absolute after:inset-0 after:z-0",
			children: [
				project.thumbnail_url &&
					_jsx("img", {
						src: project.thumbnail_url,
						alt: project.title,
						className: "aspect-[16/10] h-40 w-full object-cover",
					}),
				_jsxs("div", {
					className: "relative z-10 flex h-full flex-col justify-between p-4",
					children: [
						_jsxs("div", {
							children: [
								_jsx("h3", {
									className: "text-lg font-semibold text-[--color-fg] line-clamp-2",
									children: project.title,
								}),
								_jsx("p", {
									className: "mt-2 text-sm text-[--color-muted] line-clamp-2",
									children: project.summary,
								}),
							],
						}),
						_jsxs("div", {
							className: "flex flex-wrap gap-2",
							children: [
								project.category && _jsx(Badge, { children: project.category }),
								project.tech_stack &&
									project.tech_stack
										.slice(0, 2)
										.map((tech) => _jsx(Badge, { className: "text-xs", children: tech }, tech)),
							],
						}),
					],
				}),
			],
		}),
	});
}
