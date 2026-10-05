// File: /client/src/services/upload.service.ts
import { API_BASE } from "@/config/env";
import type { ApiError } from "@/types/api";
import { ApiClientError, parseJsonResponse } from "./api-client";

/**
 * Upload a single image file.
 * Returns public Supabase Storage URL on success.
 * Throws ApiClientError on failure.
 */
export async function uploadImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const response = await fetch(`${API_BASE}/upload`, {
		method: "POST",
		body: formData,
		credentials: "include",
	});

	const data = await parseJsonResponse<
		{ success: true; data: { url: string } } | ({ success: false } & ApiError)
	>(response);

	if (!response.ok) {
		const error = data as unknown as ApiError;
		throw new ApiClientError(response.status, error.category, error.message, error.errors);
	}

	if (data.success && data.data) {
		return (data.data as { url: string }).url;
	}

	throw new Error("Upload gagal");
}
