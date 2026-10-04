import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RootLayout } from "@/components/layout/RootLayout";
// Public pages (eager load)
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import ProjectsPage from "@/pages/ProjectsPage";
import { ProtectedRoute } from "./ProtectedRoute";

// Admin pages (lazy load)
const LoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const ProjectEditorPage = lazy(() => import("@/pages/admin/ProjectEditorPage"));

export const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: "projects",
				element: <ProjectsPage />,
			},
			{
				path: "projects/:slug",
				element: <ProjectDetailPage />,
			},
			{
				path: "*",
				element: <NotFoundPage />,
			},
		],
	},
	{
		path: "/admin/login",
		element: <LoginPage />,
	},
	{
		path: "/admin",
		element: <AdminLayout />,
		children: [
			{
				index: true,
				element: (
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				),
			},
			{
				path: "projects/:id/edit",
				element: (
					<ProtectedRoute>
						<ProjectEditorPage />
					</ProtectedRoute>
				),
			},
		],
	},
]);
