import { useQuery } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import { Link, useParams } from "react-router";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiGet } from "@/services/api-client";
import type { ProjectDTO } from "@/types/api";

export default function ProjectDetailPage() {
	const { slug } = useParams<{ slug: string }>();
	const {
		data: project,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["project", slug],
		queryFn: () => apiGet<ProjectDTO>(`/api/v1/projects/${slug}`),
		enabled: !!slug,
		staleTime: 10 * 60 * 1000,
	});

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
				<p className="text-[--color-muted]">Proyek tidak ditemukan.</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-16">
			<Link
				to="/projects"
				className="text-[--color-accent] hover:text-[--color-accent]/80 mb-8 inline-block"
			>
				← Kembali ke Proyek
			</Link>

			<h1 className="text-4xl font-bold text-[--color-fg] mb-4">{project.title}</h1>
			<p className="text-[--color-muted] text-lg mb-6">{project.summary}</p>

			<div className="flex gap-3 mb-8">
				{project.category && <Badge>{project.category}</Badge>}
				{project.status && <Badge variant="default">{project.status}</Badge>}
			</div>

			{project.content && (
				<div className="mb-8 text-[--color-fg]" data-color-mode="dark">
					<MDEditor.Markdown source={project.content} />
				</div>
			)}

			<div className="flex gap-4">
				{project.demo_url && (
					<a
						href={project.demo_url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block bg-[--color-accent] text-[--color-bg] px-6 py-3 rounded hover:bg-[--color-accent]/90 transition-colors"
					>
						Lihat Demo
					</a>
				)}
				{project.repo_url && (
					<a
						href={project.repo_url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block bg-[--color-surface] border border-[--color-border] text-[--color-fg] px-6 py-3 rounded hover:bg-[--color-surface]/80 transition-colors"
					>
						Lihat Repository
					</a>
				)}
			</div>
		</div>
	);
}
