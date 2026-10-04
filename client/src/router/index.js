import { lazy } from "react";
import { jsx as _jsx } from "react/jsx-runtime";
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
		element: _jsx(RootLayout, {}),
		children: [
			{
				index: true,
				element: _jsx(HomePage, {}),
			},
			{
				path: "projects",
				element: _jsx(ProjectsPage, {}),
			},
			{
				path: "projects/:slug",
				element: _jsx(ProjectDetailPage, {}),
			},
			{
				path: "*",
				element: _jsx(NotFoundPage, {}),
			},
		],
	},
	{
		path: "/admin/login",
		element: _jsx(LoginPage, {}),
	},
	{
		path: "/admin",
		element: _jsx(AdminLayout, {}),
		children: [
			{
				index: true,
				element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }),
			},
			{
				path: "projects/:id/edit",
				element: _jsx(ProtectedRoute, { children: _jsx(ProjectEditorPage, {}) }),
			},
		],
	},
]);
