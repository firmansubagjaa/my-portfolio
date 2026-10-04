// File: /client/src/router/index.tsx
import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/components/layout/RootLayout";
import { Spinner } from "@/components/ui/Spinner";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";

// Shown while a lazy route module loads on first navigation
function RouteFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-bg">
			<Spinner label="Memuat halaman" />
		</div>
	);
}

/**
 * Route-level code splitting via the `lazy` route property (no Suspense needed).
 * - ProjectsPage is lazy: it parses URL filters with the shared zod schema.
 * - ProjectDetailPage is lazy: it pulls react-markdown/remark-gfm/micromark (+ Shiki on demand),
 *   which would otherwise bloat the public entry bundle.
 * - All admin code (layout + pages + md editor) lives in separate chunks.
 */
export const router = createBrowserRouter([
	{
		path: "/",
		Component: RootLayout,
		HydrateFallback: RouteFallback,
		children: [
			{ index: true, Component: HomePage },
			{
				// Lazy: URL filter parsing pulls in zod (~24 KB gzip), not needed for the landing page
				path: "projects",
				lazy: async () => ({ Component: (await import("@/pages/ProjectsPage")).default }),
			},
			{
				path: "projects/:slug",
				lazy: async () => ({
					Component: (await import("@/pages/ProjectDetailPage")).default,
				}),
			},
			{ path: "*", Component: NotFoundPage },
		],
	},
	{
		path: "/admin/login",
		HydrateFallback: RouteFallback,
		lazy: async () => ({ Component: (await import("@/pages/admin/LoginPage")).default }),
	},
	{
		path: "/admin",
		Component: ProtectedRoute,
		HydrateFallback: RouteFallback,
		children: [
			{
				lazy: async () => ({
					Component: (await import("@/components/layout/AdminLayout")).AdminLayout,
				}),
				children: [
					{
						index: true,
						lazy: async () => ({
							Component: (await import("@/pages/admin/DashboardPage")).default,
						}),
					},
					{
						path: "projects/new",
						lazy: async () => ({
							Component: (await import("@/pages/admin/ProjectEditorPage")).default,
						}),
					},
					{
						path: "projects/:id/edit",
						lazy: async () => ({
							Component: (await import("@/pages/admin/ProjectEditorPage")).default,
						}),
					},
				],
			},
		],
	},
]);
