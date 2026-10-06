// File: /client/src/components/projects/ProjectMeta.tsx
import { Calendar, Code2, GitBranch, ExternalLink } from "lucide-react";
import { TechTag } from "@/components/ui/TechTag";
import type { ProjectDTO } from "@/types/api";

interface ProjectMetaProps {
	project: ProjectDTO;
}

/**
 * Display project metadata and links
 */
export function ProjectMeta({ project }: ProjectMetaProps) {
	const formattedDate = project.created_at
		? new Date(project.created_at).toLocaleDateString("id-ID", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: null;

	return (
		<div className="space-y-6 border-t border-border pt-6">
			{/* Metadata Section */}
			<div className="flex flex-wrap gap-6">
				{formattedDate && (
					<div className="flex items-center gap-2 text-sm">
						<Calendar
							size={16}
							className="text-accent flex-shrink-0"
							aria-hidden="true"
						/>
						<span className="text-muted">{formattedDate}</span>
					</div>
				)}

				{/* Links with icons */}
				{(project.repo_url || project.demo_url || project.notebook_url) && (
					<div className="flex flex-wrap gap-4">
						{project.repo_url && (
							<a
								href={project.repo_url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-sm text-fg hover:text-accent transition-colors icon-link-hover"
								aria-label="View source code on GitHub"
							>
								<Code2 size={16} className="flex-shrink-0" aria-hidden="true" />
								<span>View Code</span>
							</a>
						)}

						{project.repo_url && (
							<a
								href={project.repo_url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-sm text-fg hover:text-accent transition-colors icon-link-hover"
								aria-label="View repository"
							>
								<GitBranch size={16} className="flex-shrink-0" aria-hidden="true" />
								<span>Repository</span>
							</a>
						)}

						{project.demo_url && (
							<a
								href={project.demo_url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-sm text-fg hover:text-accent transition-colors icon-link-hover"
								aria-label="View live demo"
							>
								<ExternalLink size={16} className="flex-shrink-0" aria-hidden="true" />
								<span>Live Demo</span>
							</a>
						)}

						{project.notebook_url && (
							<a
								href={project.notebook_url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-sm text-fg hover:text-accent transition-colors icon-link-hover"
								aria-label="View notebook"
							>
								<ExternalLink size={16} className="flex-shrink-0" aria-hidden="true" />
								<span>Notebook</span>
							</a>
						)}
					</div>
				)}
			</div>

			{/* Tech Stack */}
			{project.tech_stack && project.tech_stack.length > 0 && (
				<div>
					<h3 className="text-sm font-semibold text-fg mb-3">Teknologi yang Digunakan</h3>
					<div className="flex flex-wrap gap-2">
						{project.tech_stack.map((tech) => (
							<TechTag key={tech} tech={tech} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
