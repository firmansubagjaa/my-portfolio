import { apiGet, apiPost } from "./api-client";

const API_BASE = "/api/v1";
export function loginUser(username, password) {
	return apiPost(`${API_BASE}/auth/login`, {
		username,
		password,
	});
}
export function logoutUser() {
	return apiPost(`${API_BASE}/auth/logout`, {});
}
export function getCurrentUser() {
	return apiGet(`${API_BASE}/auth/me`);
}
