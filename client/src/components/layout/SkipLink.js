import { jsx as _jsx } from "react/jsx-runtime";
export function SkipLink() {
	return _jsx("a", {
		href: "#main",
		className: "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50",
		children: "Lewati ke konten utama",
	});
}
