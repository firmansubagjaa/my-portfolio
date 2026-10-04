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

	return (
		<MotionProvider>
			<div className="flex flex-col min-h-screen bg-[--color-bg]">
				<SkipLink />
				<Header />
				<ErrorBoundary FallbackComponent={RouteErrorFallback} resetKeys={[location.pathname]}>
					<main id="main" className="flex-1">
						<AnimatedOutlet />
					</main>
				</ErrorBoundary>
				<Footer />
			</div>
		</MotionProvider>
	);
}
