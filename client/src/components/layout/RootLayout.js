import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation } from "react-router";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RouteErrorFallback } from "./RouteErrorFallback";
import { SkipLink } from "./SkipLink";
export function RootLayout() {
    const location = useLocation();
    return (_jsxs("div", { className: "flex flex-col min-h-screen bg-[--color-bg]", children: [_jsx(SkipLink, {}), _jsx(Header, {}), _jsx(ErrorBoundary, { FallbackComponent: RouteErrorFallback, resetKeys: [location.pathname], children: _jsx("main", { id: "main", className: "flex-1", children: _jsx(Outlet, {}) }) }), _jsx(Footer, {})] }));
}
