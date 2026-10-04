import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/Button";
export function RouteErrorFallback({ resetErrorBoundary }) {
	return _jsx("div", {
		className: "min-h-[70vh] flex items-center justify-center px-4",
		children: _jsxs("div", {
			className: "text-center max-w-md",
			children: [
				_jsx("h1", {
					className: "text-3xl font-bold text-[--color-fg] mb-4",
					children: "Terjadi kesalahan",
				}),
				_jsx("p", {
					className: "text-[--color-muted] mb-8",
					children: "Terjadi kesalahan saat memuat halaman. Silakan coba lagi.",
				}),
				_jsx(Button, { onClick: resetErrorBoundary, variant: "primary", children: "Coba Lagi" }),
			],
		}),
	});
}
