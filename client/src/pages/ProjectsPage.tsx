import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoSkeleton } from "@/components/bento/BentoSkeleton";
import { EmptyState } from "@/components/bento/EmptyState";
import { ProjectCard } from "@/components/bento/ProjectCard";
import { Pagination } from "@/components/projects/Pagination";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { useProjects } from "@/hooks/queries/use-projects";
import { useProjectFilters } from "@/hooks/use-project-filters";

export default function ProjectsPage() {
	const { filters, setFilters } = useProjectFilters();
	const { data, isLoading } = useProjects(filters);
	const projects = data?.items || [];
	const totalPages = data?.pagination.total_pages || 1;

	return (
		<div className="max-w-7xl mx-auto px-4 py-16">
			<h1 className="text-4xl font-bold text-[--color-fg] mb-2">Proyek</h1>
			<p className="text-[--color-muted] mb-12">Koleksi proyek-proyek terbaru saya</p>

			{/* Filters */}
			<ProjectFilters filters={filters} projects={projects} onFiltersChange={setFilters} />

			{/* Grid */}
			{isLoading ? (
				<BentoSkeleton />
			) : projects.length > 0 ? (
				<BentoGrid projects={projects}>
					{projects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</BentoGrid>
			) : (
				<EmptyState />
			)}

			{/* Pagination */}
			{projects.length > 0 && (
				<Pagination
					current={filters.page}
					total={totalPages}
					onChange={(page) => setFilters({ page })}
				/>
			)}
		</div>
	);
}
