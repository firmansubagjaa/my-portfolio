import type { LoginInput } from "@shared/dto";
import { apiGet, apiPost } from "./api-client";

const API_BASE = "/api/v1";

/** Shape returned by POST /auth/login and GET /auth/me */
export interface AuthUser {
	id: string;
	username: string;
}

export function loginUser(username: string, password: string) {
	return apiPost<AuthUser>(`${API_BASE}/auth/login`, {
		username,
		password,
	} as LoginInput);
}

export function logoutUser() {
	return apiPost<void>(`${API_BASE}/auth/logout`, {});
}

export function getCurrentUser() {
	return apiGet<AuthUser>(`${API_BASE}/auth/me`);
}
