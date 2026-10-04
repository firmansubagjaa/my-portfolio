import type { ApiError, ApiErrorCategory, ApiSuccess } from "@shared/dto";

export class ApiClientError extends Error {
	constructor(
		public status: number,
		public category: ApiErrorCategory,
		public errors?: Record<string, string[]>,
	) {
		super();
		this.name = "ApiClientError";
	}
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
	const envelope = await apiFetchEnvelope<T>(url, options);
	return envelope.data;
}

// Returns the full success envelope (data + pagination) for paginated endpoints
export async function apiFetchEnvelope<T>(
	url: string,
	options?: RequestInit,
): Promise<ApiSuccess<T>> {
	const response = await fetch(url, {
		...options,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	const data = (await response.json()) as ApiSuccess<T> | ApiError;

	if (!response.ok) {
		const error = data as ApiError;
		throw new ApiClientError(response.status, error.category, error.errors);
	}

	return data as ApiSuccess<T>;
}

export function apiGet<T>(url: string, options?: RequestInit): Promise<T> {
	return apiFetch<T>(url, { ...options, method: "GET" });
}

export function apiPost<T>(url: string, data: unknown, options?: RequestInit): Promise<T> {
	return apiFetch<T>(url, {
		...options,
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function apiPut<T>(url: string, data: unknown, options?: RequestInit): Promise<T> {
	return apiFetch<T>(url, {
		...options,
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export function apiDelete<T>(url: string, options?: RequestInit): Promise<T> {
	return apiFetch<T>(url, { ...options, method: "DELETE" });
}

export type { ApiError, ApiSuccess };
