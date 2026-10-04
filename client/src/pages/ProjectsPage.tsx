import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiGet } from "@/services/api-client";
import type { ProjectDTO } from "@/types/api";

export default function ProjectsPage() {
	const {
		data: projects,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["projects"],
		queryFn: () => apiGet<ProjectDTO[]>("/api/v1/projects"),
		staleTime: 5 * 60 * 1000,
	});

	return (
		<div className="max-w-6xl mx-auto px-4 py-16">
			<h1 className="text-4xl font-bold text-[--color-fg] mb-2">Proyek</h1>
			<p className="text-[--color-muted] mb-12">Koleksi proyek-proyek terbaru saya</p>

			{isLoading && (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-64" />
					))}
				</div>
			)}

			{error && (
				<div className="bg-red-900/20 border border-red-700 text-red-200 p-4 rounded">
					Gagal memuat proyek. Silakan coba lagi.
				</div>
			)}

			{projects && projects.length > 0 && (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((project) => (
						<Link key={project.id} to={`/projects/${project.slug}`}>
							<Card className="hover:border-[--color-accent] transition-colors h-full">
								<h2 className="text-lg font-semibold text-[--color-fg] mb-2">{project.title}</h2>
								<p className="text-[--color-muted] text-sm mb-4">{project.summary}</p>
								{project.category && <Badge>{project.category}</Badge>}
							</Card>
						</Link>
					))}
				</div>
			)}

			{projects && projects.length === 0 && (
				<div className="text-center py-12">
					<p className="text-[--color-muted]">Tidak ada proyek tersedia saat ini.</p>
				</div>
			)}
		</div>
	);
}
