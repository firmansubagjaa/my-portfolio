import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ErrorBoundary } from "react-error-boundary";
import { useLocation } from "react-router";
import { AnimatedOutlet } from "@/components/motion/AnimatedOutlet";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RouteErrorFallback } from "./RouteErrorFallback";
import { SkipLink } from "./SkipLink";
export function RootLayout() {
	const location = useLocation();
	return _jsx(MotionProvider, {
		children: _jsxs("div", {
			className: "flex flex-col min-h-screen bg-[--color-bg]",
			children: [
				_jsx(SkipLink, {}),
				_jsx(Header, {}),
				_jsx(ErrorBoundary, {
					FallbackComponent: RouteErrorFallback,
					resetKeys: [location.pathname],
					children: _jsx("main", {
						id: "main",
						className: "flex-1",
						children: _jsx(AnimatedOutlet, {}),
					}),
				}),
				_jsx(Footer, {}),
			],
		}),
	});
}
