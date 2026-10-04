import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiGet } from "@/services/api-client";
export default function ProjectsPage() {
    const { data: projects, isLoading, error, } = useQuery({
        queryKey: ["projects"],
        queryFn: () => apiGet("/api/v1/projects"),
        staleTime: 5 * 60 * 1000,
    });
    return (_jsxs("div", { className: "max-w-6xl mx-auto px-4 py-16", children: [_jsx("h1", { className: "text-4xl font-bold text-[--color-fg] mb-2", children: "Proyek" }), _jsx("p", { className: "text-[--color-muted] mb-12", children: "Koleksi proyek-proyek terbaru saya" }), isLoading && (_jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: 6 }).map((_, i) => (_jsx(Skeleton, { className: "h-64" }, i))) })), error && (_jsx("div", { className: "bg-red-900/20 border border-red-700 text-red-200 p-4 rounded", children: "Gagal memuat proyek. Silakan coba lagi." })), projects && projects.length > 0 && (_jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: projects.map((project) => (_jsx(Link, { to: `/projects/${project.slug}`, children: _jsxs(Card, { className: "hover:border-[--color-accent] transition-colors h-full", children: [_jsx("h2", { className: "text-lg font-semibold text-[--color-fg] mb-2", children: project.title }), _jsx("p", { className: "text-[--color-muted] text-sm mb-4", children: project.summary }), project.category && _jsx(Badge, { children: project.category })] }) }, project.id))) })), projects && projects.length === 0 && (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-[--color-muted]", children: "Tidak ada proyek tersedia saat ini." }) }))] }));
}
