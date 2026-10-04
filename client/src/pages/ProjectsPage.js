import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
	return _jsxs("div", {
		className: "max-w-7xl mx-auto px-4 py-16",
		children: [
			_jsx("h1", { className: "text-4xl font-bold text-[--color-fg] mb-2", children: "Proyek" }),
			_jsx("p", {
				className: "text-[--color-muted] mb-12",
				children: "Koleksi proyek-proyek terbaru saya",
			}),
			_jsx(ProjectFilters, { filters: filters, projects: projects, onFiltersChange: setFilters }),
			isLoading
				? _jsx(BentoSkeleton, {})
				: projects.length > 0
					? _jsx(BentoGrid, {
							projects: projects,
							children: projects.map((project) =>
								_jsx(ProjectCard, { project: project }, project.id),
							),
						})
					: _jsx(EmptyState, {}),
			projects.length > 0 &&
				_jsx(Pagination, {
					current: filters.page,
					total: totalPages,
					onChange: (page) => setFilters({ page }),
				}),
		],
	});
}
