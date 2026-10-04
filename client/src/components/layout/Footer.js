import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Footer() {
	const currentYear = new Date().getFullYear();
	return _jsx("footer", {
		className: "bg-[--color-surface] border-t border-[--color-border] mt-16 py-8",
		children: _jsx("div", {
			className: "max-w-6xl mx-auto px-4",
			children: _jsxs("address", {
				className: "text-center text-[--color-muted] not-italic",
				children: [
					_jsxs("p", { children: ["\u00A9 ", currentYear, " Portfolio. All rights reserved."] }),
					_jsxs("div", {
						className: "mt-4 space-x-4",
						children: [
							_jsx("a", {
								href: "https://github.com",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "hover:text-[--color-accent]",
								children: "GitHub",
							}),
							_jsx("a", {
								href: "mailto:contact@example.com",
								className: "hover:text-[--color-accent]",
								children: "Email",
							}),
						],
					}),
				],
			}),
		}),
	});
}
