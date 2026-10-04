import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useParams } from "react-router";
import { Markdown } from "@/components/markdown/Markdown";
import { ProjectMeta } from "@/components/projects/ProjectMeta";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProject } from "@/hooks/queries/use-projects";
export default function ProjectDetailPage() {
	const { slug } = useParams();
	const { data: project, isLoading, error } = useProject(slug || "", !!slug);
	if (isLoading) {
		return _jsxs("div", {
			className: "max-w-4xl mx-auto px-4 py-16",
			children: [_jsx(Skeleton, { className: "h-12 mb-4" }), _jsx(Skeleton, { className: "h-96" })],
		});
	}
	if (error) {
		return _jsx("div", {
			className: "max-w-4xl mx-auto px-4 py-16",
			children: _jsx("div", {
				className: "bg-red-900/20 border border-red-700 text-red-200 p-4 rounded",
				children: "Gagal memuat proyek. Silakan coba lagi.",
			}),
		});
	}
	if (!project) {
		return _jsx("div", {
			className: "max-w-4xl mx-auto px-4 py-16",
			children: _jsx("p", {
				className: "text-[--color-muted]",
				children: "Proyek tidak ditemukan.",
			}),
		});
	}
	return _jsxs("div", {
		className: "max-w-4xl mx-auto px-4 py-16",
		children: [
			_jsx(Link, {
				to: "/projects",
				className: "text-[--color-accent] hover:text-[--color-accent]/80 mb-8 inline-block",
				children: "\u2190 Kembali ke Proyek",
			}),
			_jsx("h1", {
				className: "text-4xl font-bold text-[--color-fg] mb-4",
				children: project.title,
			}),
			_jsx("p", { className: "text-[--color-muted] text-lg mb-6", children: project.summary }),
			project.content &&
				_jsx("div", {
					className: "mb-8 text-[--color-fg]",
					children: _jsx(Markdown, { content: project.content }),
				}),
			_jsx(ProjectMeta, { project: project }),
		],
	});
}
