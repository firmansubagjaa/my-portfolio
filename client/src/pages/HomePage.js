import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router";
export default function HomePage() {
    return (_jsxs("div", { className: "max-w-6xl mx-auto px-4 py-16", children: [_jsx("h1", { className: "text-4xl font-bold text-[--color-fg] mb-6", children: "Selamat Datang" }), _jsx("p", { className: "text-[--color-muted] text-lg max-w-2xl mb-8", children: "Ini adalah portfolio profesional yang menampilkan proyek-proyek terbaik saya. Jelajahi berbagai karya dan temukan bagaimana saya dapat membantu Anda mewujudkan ide menjadi kenyataan." }), _jsx(Link, { to: "/projects", className: "inline-block bg-[--color-accent] text-[--color-bg] px-6 py-3 rounded hover:bg-[--color-accent]/90 transition-colors", children: "Lihat Proyek" })] }));
}
