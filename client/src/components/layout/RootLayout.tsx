import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation } from "react-router";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RouteErrorFallback } from "./RouteErrorFallback";
import { SkipLink } from "./SkipLink";

export function RootLayout() {
	const location = useLocation();

	return (
		<div className="flex flex-col min-h-screen bg-[--color-bg]">
			<SkipLink />
			<Header />
			<ErrorBoundary FallbackComponent={RouteErrorFallback} resetKeys={[location.pathname]}>
				<main id="main" className="flex-1">
					<Outlet />
				</main>
			</ErrorBoundary>
			<Footer />
		</div>
	);
}
