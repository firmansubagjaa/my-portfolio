// File: /server/src/config/timeouts.test.ts
import { describe, expect, it } from "bun:test";
import {
	API_REQUEST_TIMEOUT_MS,
	BUN_IDLE_TIMEOUT_S,
	BUN_MAX_IDLE_TIMEOUT_S,
	UPLOAD_REQUEST_TIMEOUT_MS,
} from "./timeouts";

describe("timeouts", () => {
	it("keeps idleTimeout above every request timeout", () => {
		expect(BUN_IDLE_TIMEOUT_S * 1000).toBeGreaterThan(API_REQUEST_TIMEOUT_MS);
		expect(BUN_IDLE_TIMEOUT_S * 1000).toBeGreaterThan(
			UPLOAD_REQUEST_TIMEOUT_MS,
		);
	});

	it("stays within Bun's idleTimeout maximum", () => {
		expect(BUN_IDLE_TIMEOUT_S).toBeLessThanOrEqual(BUN_MAX_IDLE_TIMEOUT_S);
	});

	it("gives uploads a longer limit than other API routes", () => {
		expect(UPLOAD_REQUEST_TIMEOUT_MS).toBeGreaterThan(API_REQUEST_TIMEOUT_MS);
	});

	it("derives idleTimeout as 130 s", () => {
		expect(BUN_IDLE_TIMEOUT_S).toBe(130);
	});
});
