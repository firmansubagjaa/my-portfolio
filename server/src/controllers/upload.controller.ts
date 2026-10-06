// File: /server/src/controllers/upload.controller.ts
import { Hono } from "hono";
import { env } from "../config/env";
import type { AppEnv } from "../types/app-env";
import { ApiResponse } from "../utils/api-response";
import {
	AppError,
	BadRequestError,
	PayloadTooLargeError,
	UnsupportedMediaTypeError,
} from "../utils/errors";
import {
	type DetectedImageType,
	detectImageType,
	getMimeTypeFromImageType,
} from "../utils/file-signature";
import { createSupabaseClient } from "../utils/supabase";

export const uploadController = new Hono<AppEnv>();

const UPLOAD_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["png", "jpg", "gif", "webp"] as const;

// POST /api/v1/upload - Upload image
uploadController.post("/", async (c) => {
	const form = await c.req.formData();
	const file = form.get("file") as File | null;

	if (!file) {
		throw new BadRequestError("File wajib diupload");
	}

	// Validate file size (10MB max)
	if (file.size > UPLOAD_MAX_FILE_SIZE) {
		throw new PayloadTooLargeError("Ukuran file maksimal 10MB");
	}

	// Validate file type by magic bytes
	const buffer = await file.arrayBuffer();
	const uint8Array = new Uint8Array(buffer);
	const imageType = detectImageType(uint8Array);

	if (!ALLOWED_TYPES.includes(imageType as (typeof ALLOWED_TYPES)[number])) {
		throw new UnsupportedMediaTypeError(
			"Format file harus PNG, JPG, GIF, atau WebP",
		);
	}

	// Upload to Supabase Storage
	const supabase = createSupabaseClient();
	// Generate UUID using Bun's crypto.randomUUID()
	const filename = `${crypto.randomUUID()}.${imageType}`;
	const uploadPath = `portfolio-uploads/${Date.now()}/${filename}`;

	// MIME type comes only from magic bytes; never trust client-provided file.type.
	// Pass raw bytes (not a Blob): storage-js ignores `contentType` for Blob bodies,
	// which made Supabase see application/octet-stream and reject with 415.
	const contentType = getMimeTypeFromImageType(imageType as DetectedImageType);

	const { data, error } = await supabase.storage
		.from(env.SUPABASE_STORAGE_BUCKET)
		.upload(uploadPath, uint8Array, {
			contentType,
			upsert: false,
		});

	if (error) {
		const status = "status" in error ? Number(error.status) : undefined;
		const statusCode =
			"statusCode" in error ? String(error.statusCode) : undefined;

		// Sanitized log: no keys, headers, or file contents
		console.error("Supabase storage upload failed:", {
			name: error.name,
			message: error.message,
			status,
			statusCode,
			bucket: env.SUPABASE_STORAGE_BUCKET,
			path: uploadPath,
		});

		if (status === 415 || statusCode === "415") {
			throw new UnsupportedMediaTypeError(
				"Format file harus PNG, JPG, GIF, atau WebP",
			);
		}

		if (status === 413 || statusCode === "413") {
			throw new PayloadTooLargeError("Ukuran file maksimal 10MB");
		}

		throw new AppError(500, "INTERNAL_ERROR", "Upload ke Supabase gagal");
	}

	// Generate public URL
	const {
		data: { publicUrl },
	} = supabase.storage
		.from(env.SUPABASE_STORAGE_BUCKET)
		.getPublicUrl(data.path);

	return ApiResponse.success(c, {
		data: { url: publicUrl },
		message: "File berhasil diupload",
	});
});
