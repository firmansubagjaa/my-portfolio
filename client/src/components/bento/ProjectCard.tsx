// File: /client/src/components/bento/ProjectCard.tsx
"use client";

import { motion } from "motion/react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/Badge";
import type { ProjectListItemDTO } from "@/types/api";

interface ProjectCardProps {
	project: ProjectListItemDTO;
}

/**
 * Card component for displaying a project in the bento grid
 * Renders as an article with layout animation support
 */
export function ProjectCard({ project }: ProjectCardProps) {
	return (
		<motion.article
			layout
			className="relative h-full overflow-hidden rounded-lg border border-[--color-border] bg-[--color-surface] transition-colors hover:border-[--color-accent] has-[a:focus-visible]:ring-2"
		>
			<Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:z-0">
				{project.thumbnail_url && (
					<img
						src={project.thumbnail_url}
						alt={project.title}
						className="aspect-[16/10] h-40 w-full object-cover"
					/>
				)}

				<div className="relative z-10 flex h-full flex-col justify-between p-4">
					<div>
						<h3 className="text-lg font-semibold text-[--color-fg] line-clamp-2">
							{project.title}
						</h3>
						<p className="mt-2 text-sm text-[--color-muted] line-clamp-2">{project.summary}</p>
					</div>

					<div className="flex flex-wrap gap-2">
						{project.category && <Badge>{project.category}</Badge>}

						{project.tech_stack &&
							project.tech_stack.slice(0, 2).map((tech) => (
								<Badge key={tech} className="text-xs">
									{tech}
								</Badge>
							))}
					</div>
				</div>
			</Link>
		</motion.article>
	);
}
