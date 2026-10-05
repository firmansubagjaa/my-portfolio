// File: /server/src/controllers/upload.controller.ts
import { Hono } from "hono";
import { createSupabaseClient } from "../utils/supabase";
import { detectImageType } from "../utils/file-signature";
import {
	BadRequestError,
	PayloadTooLargeError,
	UnsupportedMediaTypeError,
	AppError,
} from "../utils/errors";
import { ApiResponse } from "../utils/api-response";
import { env } from "../config/env";
import type { AppEnv } from "../types/app-env";

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

	const { data, error } = await supabase.storage
		.from(env.SUPABASE_STORAGE_BUCKET)
		.upload(uploadPath, new Blob([uint8Array]), {
			contentType: `image/${imageType}`,
		});

	if (error) {
		throw new AppError(
			500,
			"INTERNAL_ERROR",
			"Upload ke Supabase gagal",
		);
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
