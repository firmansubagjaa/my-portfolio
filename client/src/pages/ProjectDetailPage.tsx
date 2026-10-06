import { Link, useParams } from "react-router";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Markdown } from "@/components/markdown/Markdown";
import { ProjectMeta } from "@/components/projects/ProjectMeta";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProject } from "@/hooks/queries/use-projects";

export default function ProjectDetailPage() {
	const { slug } = useParams<{ slug: string }>();
	const { data: project, isLoading, error } = useProject(slug || "", !!slug);

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-16">
				<Skeleton className="h-12 mb-4" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-16">
				<div className="bg-red-900/20 border border-red-700 text-red-200 p-4 rounded">
					Gagal memuat proyek. Silakan coba lagi.
				</div>
			</div>
		);
	}

	if (!project) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-16">
				<p className="text-muted">Proyek tidak ditemukan.</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-16">
			<Link to="/projects" className="text-accent hover:text-accent/80 mb-8 inline-block">
				← Kembali ke Proyek
			</Link>

			<div className="mb-4">
				<CategoryBadge category={project.category} />
			</div>

			<h1 className="text-4xl font-bold text-fg mb-4">{project.title}</h1>
			<p className="text-muted text-lg mb-6">{project.summary}</p>

			{project.content && (
				<div className="mb-8 text-fg">
					<Markdown content={project.content} />
				</div>
			)}

			<ProjectMeta project={project} />
		</div>
	);
}
