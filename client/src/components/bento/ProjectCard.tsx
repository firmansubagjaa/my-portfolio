// File: /client/src/components/bento/ProjectCard.tsx
import { Link } from "react-router";
import { Image } from "lucide-react";
import { FeaturedBadge } from "@/components/ui/FeaturedBadge";
import { TechTag } from "@/components/ui/TechTag";
import { CATEGORY_LABELS } from "@/config/constants";
import type { ProjectListItemDTO } from "@/types/api";

const MAX_BADGES = 5;

interface ProjectCardProps {
	project: ProjectListItemDTO;
	/** Eager-load the thumbnail (use for the first card to speed up LCP) */
	priority?: boolean;
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
	const extraTech = project.tech_stack.length - MAX_BADGES;

	return (
		<article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface card-hover has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent">
		{project.thumbnail_url ? (
			<img
				src={project.thumbnail_url}
				alt={project.title}
				width={1200}
				height={750}
				loading={priority ? "eager" : "lazy"}
				fetchPriority={priority ? "high" : "auto"}
				decoding="async"
				className="aspect-[16/10] w-full object-cover"
			/>
		) : (
			<div 
				aria-label={`Tidak ada gambar untuk ${project.title}`}
				className="aspect-[16/10] w-full bg-border/40 flex items-center justify-center"
			>
				<div className="flex flex-col items-center gap-2">
					<Image size={28} className="text-muted/50" />
					<span className="text-xs text-muted/60 font-mono">No image</span>
				</div>
			</div>
		)}

			<div className="flex flex-1 flex-col gap-3 p-5">
				<div className="flex items-center justify-between gap-2">
					<p className="font-mono text-xs text-muted">{CATEGORY_LABELS[project.category]}</p>
					{project.is_featured && <FeaturedBadge />}
				</div>
				<h3 className="text-lg font-semibold text-fg">
					{/* after:inset-0 makes the whole card clickable with a single tab stop */}
					<Link
						to={`/projects/${project.slug}`}
						className="after:absolute after:inset-0 focus-visible:outline-none"
					>
						{project.title}
					</Link>
				</h3>
				<p className="line-clamp-3 text-sm text-muted">{project.summary}</p>

				{project.tech_stack.length > 0 && (
					<ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Teknologi">
						{project.tech_stack.slice(0, MAX_BADGES).map((tech) => (
							<li key={tech}>
								<TechTag tech={tech} />
							</li>
						))}
						{extraTech > 0 && (
							<li className="text-xs font-medium text-muted">+{extraTech} lebih</li>
						)}
					</ul>
				)}
			</div>
		</article>
	);
}
