import { jsx as _jsx } from "react/jsx-runtime";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation } from "react-router";
import { RouteErrorFallback } from "./RouteErrorFallback";
export function AdminLayout() {
    const location = useLocation();
    return (_jsx("div", { className: "flex flex-col min-h-screen bg-[--color-bg]", children: _jsx(ErrorBoundary, { FallbackComponent: RouteErrorFallback, resetKeys: [location.pathname], children: _jsx("main", { id: "main", className: "flex-1", children: _jsx(Outlet, {}) }) }) }));
}
