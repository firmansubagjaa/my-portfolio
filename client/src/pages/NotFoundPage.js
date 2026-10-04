import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router";
export default function NotFoundPage() {
    return (_jsxs("div", { className: "max-w-6xl mx-auto px-4 py-16 text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-[--color-fg] mb-4", children: "Halaman Tidak Ditemukan" }), _jsx("p", { className: "text-[--color-muted] text-lg mb-8", children: "Maaf, halaman yang Anda cari tidak ada." }), _jsx(Link, { to: "/", className: "inline-block bg-[--color-accent] text-[--color-bg] px-6 py-3 rounded hover:bg-[--color-accent]/90 transition-colors", children: "Kembali ke Beranda" })] }));
}
