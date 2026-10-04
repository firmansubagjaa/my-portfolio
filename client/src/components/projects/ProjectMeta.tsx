// File: /client/src/components/projects/ProjectMeta.tsx
import { Badge } from "@/components/ui/Badge";
import type { ProjectDTO } from "@/types/api";

interface ProjectMetaProps {
	project: ProjectDTO;
}

/**
 * Display project metadata and links
 */
export function ProjectMeta({ project }: ProjectMetaProps) {
	return (
		<div className="space-y-6 border-t border-[--color-border] pt-6">
			{/* Tech Stack */}
			{project.tech_stack && project.tech_stack.length > 0 && (
				<div>
					<h3 className="text-sm font-semibold text-[--color-fg] mb-3">Teknologi yang Digunakan</h3>
					<div className="flex flex-wrap gap-2">
						{project.tech_stack.map((tech) => (
							<Badge key={tech}>{tech}</Badge>
						))}
					</div>
				</div>
			)}

			{/* Links */}
			<div className="flex gap-4 flex-wrap">
				{project.demo_url && (
					<a
						href={project.demo_url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block bg-[--color-accent] text-[--color-bg] px-6 py-3 rounded hover:bg-[--color-accent]/90 transition-colors font-medium"
					>
						Lihat Demo
					</a>
				)}
				{project.repo_url && (
					<a
						href={project.repo_url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block bg-[--color-surface] border border-[--color-border] text-[--color-fg] px-6 py-3 rounded hover:bg-[--color-surface]/80 transition-colors font-medium"
					>
						Lihat Repository
					</a>
				)}
				{project.notebook_url && (
					<a
						href={project.notebook_url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block bg-[--color-surface] border border-[--color-border] text-[--color-fg] px-6 py-3 rounded hover:bg-[--color-surface]/80 transition-colors font-medium"
					>
						Lihat Notebook
					</a>
				)}
			</div>
		</div>
	);
}
