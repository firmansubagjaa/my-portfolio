// File: /client/src/App.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { LazyToaster } from "@/components/ui/LazyToaster";
import { queryClient } from "@/config/query-client";
import { router } from "@/router";

export default function App() {
	return (
		<HelmetProvider>
			<QueryClientProvider client={queryClient}>
				<MotionProvider>
					<RouterProvider router={router} />
					<LazyToaster />
				</MotionProvider>
			</QueryClientProvider>
		</HelmetProvider>
	);
}
