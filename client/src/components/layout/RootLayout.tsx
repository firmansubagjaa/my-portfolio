import { ErrorBoundary } from "react-error-boundary";
import { ScrollRestoration, useLocation } from "react-router";
import { AnimatedOutlet } from "@/components/motion/AnimatedOutlet";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RouteErrorFallback } from "./RouteErrorFallback";
import { SkipLink } from "./SkipLink";

// MotionProvider is mounted once at the app root (main.tsx), not here.
export function RootLayout() {
	const location = useLocation();

	return (
		<div className="flex min-h-screen flex-col bg-bg text-fg">
			<SkipLink />
			<Header />
			<ErrorBoundary FallbackComponent={RouteErrorFallback} resetKeys={[location.pathname]}>
				<main
					id="main"
					tabIndex={-1}
					className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 md:px-6"
				>
					<AnimatedOutlet />
				</main>
			</ErrorBoundary>
			<Footer />
			<ScrollRestoration />
		</div>
	);
}
