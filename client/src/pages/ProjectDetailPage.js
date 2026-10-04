import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import { Link, useParams } from "react-router";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiGet } from "@/services/api-client";
export default function ProjectDetailPage() {
    const { slug } = useParams();
    const { data: project, isLoading, error, } = useQuery({
        queryKey: ["project", slug],
        queryFn: () => apiGet(`/api/v1/projects/${slug}`),
        enabled: !!slug,
        staleTime: 10 * 60 * 1000,
    });
    if (isLoading) {
        return (_jsxs("div", { className: "max-w-4xl mx-auto px-4 py-16", children: [_jsx(Skeleton, { className: "h-12 mb-4" }), _jsx(Skeleton, { className: "h-96" })] }));
    }
    if (error) {
        return (_jsx("div", { className: "max-w-4xl mx-auto px-4 py-16", children: _jsx("div", { className: "bg-red-900/20 border border-red-700 text-red-200 p-4 rounded", children: "Gagal memuat proyek. Silakan coba lagi." }) }));
    }
    if (!project) {
        return (_jsx("div", { className: "max-w-4xl mx-auto px-4 py-16", children: _jsx("p", { className: "text-[--color-muted]", children: "Proyek tidak ditemukan." }) }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto px-4 py-16", children: [_jsx(Link, { to: "/projects", className: "text-[--color-accent] hover:text-[--color-accent]/80 mb-8 inline-block", children: "\u2190 Kembali ke Proyek" }), _jsx("h1", { className: "text-4xl font-bold text-[--color-fg] mb-4", children: project.title }), _jsx("p", { className: "text-[--color-muted] text-lg mb-6", children: project.summary }), _jsxs("div", { className: "flex gap-3 mb-8", children: [project.category && _jsx(Badge, { children: project.category }), project.status && _jsx(Badge, { variant: "default", children: project.status })] }), project.content && (_jsx("div", { className: "mb-8 text-[--color-fg]", "data-color-mode": "dark", children: _jsx(MDEditor.Markdown, { source: project.content }) })), _jsxs("div", { className: "flex gap-4", children: [project.demo_url && (_jsx("a", { href: project.demo_url, target: "_blank", rel: "noopener noreferrer", className: "inline-block bg-[--color-accent] text-[--color-bg] px-6 py-3 rounded hover:bg-[--color-accent]/90 transition-colors", children: "Lihat Demo" })), project.repo_url && (_jsx("a", { href: project.repo_url, target: "_blank", rel: "noopener noreferrer", className: "inline-block bg-[--color-surface] border border-[--color-border] text-[--color-fg] px-6 py-3 rounded hover:bg-[--color-surface]/80 transition-colors", children: "Lihat Repository" }))] })] }));
}
