import type { ProjectCategory } from "@shared/dto";

export const API_BASE = "/api/v1";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
	fullstack: "Full-Stack",
	ai_ml: "AI / ML",
	frontend: "Frontend",
	backend: "Backend",
	experiment: "Experiment",
};

export const PROJECTS_PER_PAGE = 6;

export const ROUTES = {
	PUBLIC: "/",
	PROJECTS: "/projects",
	PROJECT_DETAIL: "/projects/:slug",
	NOT_FOUND: "*",
	ADMIN_LOGIN: "/admin/login",
	ADMIN: "/admin",
	ADMIN_DASHBOARD: "/admin",
	ADMIN_PROJECT_EDIT: "/admin/projects/:id/edit",
};

export const QUERY_RETRY_COUNT = 1;

// Shared motion transition (expo-out, 200ms)
export const TRANSITION = { duration: 0.2, ease: [0.16, 1, 0.3, 1] } as const;
