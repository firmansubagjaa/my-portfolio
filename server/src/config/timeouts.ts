// File: /server/src/config/timeouts.ts
// Single source of truth for request timeouts and Bun's idleTimeout.
// Invariant: BUN_IDLE_TIMEOUT_S (seconds) must be greater than every request
// timeout. Bun's idleTimeout fires on socket inactivity, and the client socket
// is idle while the server waits on the DB or Supabase; if it fired first the
// client would get a dropped socket instead of the JSON 504 from errorHandler.
// Kept import-free so it can be unit tested without env vars.

export const API_REQUEST_TIMEOUT_MS = 20_000;

// 10 MB at ~1 Mbps upstream is ~80 s, plus ~40 s for the re-upload to
// Supabase Storage. Still bounded so a stuck Storage call can't hang forever.
export const UPLOAD_REQUEST_TIMEOUT_MS = 120_000;

export const BUN_MAX_IDLE_TIMEOUT_S = 255;
export const IDLE_TIMEOUT_MARGIN_S = 10;

export const BUN_IDLE_TIMEOUT_S = Math.min(
	BUN_MAX_IDLE_TIMEOUT_S,
	Math.ceil(
		Math.max(API_REQUEST_TIMEOUT_MS, UPLOAD_REQUEST_TIMEOUT_MS) / 1000,
	) + IDLE_TIMEOUT_MARGIN_S,
);
