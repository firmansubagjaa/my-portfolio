import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation } from "react-router";
import { RouteErrorFallback } from "./RouteErrorFallback";

export function AdminLayout() {
	const location = useLocation();

	return (
		<div className="flex flex-col min-h-screen bg-[--color-bg]">
			<ErrorBoundary FallbackComponent={RouteErrorFallback} resetKeys={[location.pathname]}>
				<main id="main" className="flex-1">
					<Outlet />
				</main>
			</ErrorBoundary>
		</div>
	);
}
