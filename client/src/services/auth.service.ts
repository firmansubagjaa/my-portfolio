import type { LoginInput, ProjectDTO } from "@shared/dto";
import { apiGet, apiPost } from "./api-client";

const API_BASE = "/api/v1";

export function loginUser(username: string, password: string) {
	return apiPost<{ user: ProjectDTO; token: string }>(`${API_BASE}/auth/login`, {
		username,
		password,
	} as LoginInput);
}

export function logoutUser() {
	return apiPost<void>(`${API_BASE}/auth/logout`, {});
}

export function getCurrentUser() {
	return apiGet<ProjectDTO>(`${API_BASE}/auth/me`);
}
