// File: /server/src/utils/file-signature.test.ts
import { describe, expect, it } from "bun:test";
import { detectImageType, getMimeTypeFromImageType } from "./file-signature";

describe("file-signature", () => {
	describe("getMimeTypeFromImageType", () => {
		it("should map png to image/png", () => {
			expect(getMimeTypeFromImageType("png")).toBe("image/png");
		});

		it("should map jpg to image/jpeg (not image/jpg)", () => {
			expect(getMimeTypeFromImageType("jpg")).toBe("image/jpeg");
		});

		it("should map gif to image/gif", () => {
			expect(getMimeTypeFromImageType("gif")).toBe("image/gif");
		});

		it("should map webp to image/webp", () => {
			expect(getMimeTypeFromImageType("webp")).toBe("image/webp");
		});
	});

	describe("detectImageType", () => {
		it("should detect PNG", () => {
			const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
			expect(detectImageType(bytes)).toBe("png");
		});

		it("should detect JPEG", () => {
			const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
			expect(detectImageType(bytes)).toBe("jpg");
		});

		it("should detect GIF", () => {
			const bytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
			expect(detectImageType(bytes)).toBe("gif");
		});

		it("should detect WebP", () => {
			const bytes = new Uint8Array([
				0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
			]);
			expect(detectImageType(bytes)).toBe("webp");
		});

		it("should return unknown for non-image bytes", () => {
			const bytes = new TextEncoder().encode("hello world");
			expect(detectImageType(bytes)).toBe("unknown");
		});

		it("should return unknown for an empty buffer", () => {
			expect(detectImageType(new Uint8Array())).toBe("unknown");
		});
	});
});
