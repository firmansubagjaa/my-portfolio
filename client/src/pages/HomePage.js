import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoSkeleton } from "@/components/bento/BentoSkeleton";
import { ProjectCard } from "@/components/bento/ProjectCard";
import { useProjects } from "@/hooks/queries/use-projects";
export default function HomePage() {
	const { data, isLoading } = useProjects({ limit: 6, page: 1 });
	const projects = data?.items || [];
	return _jsxs("div", {
		className: "max-w-6xl mx-auto px-4 py-16",
		children: [
			_jsx("h1", {
				className: "text-4xl font-bold text-[--color-fg] mb-6",
				children: "Selamat Datang",
			}),
			_jsx("p", {
				className: "text-[--color-muted] text-lg max-w-2xl mb-8",
				children:
					"Ini adalah portfolio profesional yang menampilkan proyek-proyek terbaik saya. Jelajahi berbagai karya dan temukan bagaimana saya dapat membantu Anda mewujudkan ide menjadi kenyataan.",
			}),
			_jsx(Link, {
				to: "/projects",
				className:
					"inline-block bg-[--color-accent] text-[--color-bg] px-6 py-3 rounded hover:bg-[--color-accent]/90 transition-colors",
				children: "Lihat Semua Proyek",
			}),
			_jsxs("div", {
				className: "mt-16",
				children: [
					_jsx("h2", {
						className: "text-2xl font-bold text-[--color-fg] mb-6",
						children: "Proyek Unggulan",
					}),
					isLoading
						? _jsx(BentoSkeleton, {})
						: _jsx(BentoGrid, {
								projects: projects,
								children: projects.map((project) =>
									_jsx(ProjectCard, { project: project }, project.id),
								),
							}),
				],
			}),
		],
	});
}
