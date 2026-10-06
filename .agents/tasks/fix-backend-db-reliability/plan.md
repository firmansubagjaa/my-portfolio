# Implementation Plan: PR #12 follow-ups (fix 1 + fix 3)

Worktree (ALL work happens here; relative paths land in the parent workspace):
`d:\File Defir\Projects\My Portfolio\.worktrees\backend-db-reliability`
Branch: `fix/backend-db-reliability` (HEAD 41ec0dd, tracks origin). Commit locally only if the workflow asks; never merge, never open a new PR.

## Confirmed current state (read from source)

- `server/src/index.ts`: CORS on `/api/*`, then `app.use("/api/*", timeout(20_000, () => new HTTPException(504, { message: "Server terlalu lama merespons" })))`, then routes; upload is wired as `app.use("/api/v1/upload*", requireAuth); app.route("/api/v1/upload", uploadController);`. `app.onError(errorHandler)` turns the HTTPException into JSON. Default export: `export default Object.assign(app, { idleTimeout: 30 });` — keep this shape (Hono instance stays the default export for Vercel).
- `server/src/controllers/upload.controller.ts`: `c.req.formData()` is read inside the handler, so the timeout timer covers body upload + magic-byte check + Supabase re-upload. Size cap `UPLOAD_MAX_FILE_SIZE` (10 MB) is a local const in this controller (not in `shared/dto.ts`); no change needed there.
- `server/src/config/` contains only `env.ts`, which calls `parseEnv()` at import time and `process.exit(1)` on invalid env. The new constants module must therefore NOT import `env.ts`, so it is unit-testable without env vars.
- hono 4.13.13 ships `hono/combine` with `except(condition, ...middleware)`; string conditions are matched with a TrieRouter against `c.req.path`, same pattern syntax as `app.use`.
- Baseline: `bun test` → 11 pass / 0 fail (2 files). `bun run typecheck` → passes. `biome check` already reports pre-existing errors in `src/index.ts` (organizeImports + format) and elsewhere — do NOT reformat the whole file; just keep new code in project style (tabs, double quotes) and make the new files biome-clean.

## Decisions

- Constants location: new `server/src/config/timeouts.ts` (pure, no imports). It sits beside `env.ts` as server config, and being import-free lets `bun test` cover it.
- Values:
  - `API_REQUEST_TIMEOUT_MS = 20_000` (unchanged from PR #12).
  - `UPLOAD_REQUEST_TIMEOUT_MS = 120_000`. A 10 MB body at ~1 Mbps upstream takes ~80 s; 120 s leaves ~40 s for the Supabase Storage re-upload of the same 10 MB from the server. Still bounded so a stuck Storage call can't hang forever.
  - `IDLE_TIMEOUT_MARGIN_S = 10`, `BUN_MAX_IDLE_TIMEOUT_S = 255`.
  - `BUN_IDLE_TIMEOUT_S = Math.min(BUN_MAX_IDLE_TIMEOUT_S, Math.ceil(Math.max(API_REQUEST_TIMEOUT_MS, UPLOAD_REQUEST_TIMEOUT_MS) / 1000) + IDLE_TIMEOUT_MARGIN_S)` → 130 s. Must exceed the upload timeout because after the body is fully read the client socket is idle while the server waits on Supabase.
- Exemption mechanism: wrap the general timeout in `except("/api/v1/upload*", ...)` from `hono/combine` (built into hono, no new dependency, and uses the same path pattern as the existing `requireAuth` mount). Then add `app.use("/api/v1/upload*", timeout(UPLOAD_REQUEST_TIMEOUT_MS, ...))` so only upload gets the long limit. Both share one exception factory so the 504 JSON message stays identical.

## Steps

- [ ] 1. Create the timeout constants module with the invariant comment.
      Content (tabs, double quotes, header comment like other files):
      ```ts
      // File: /server/src/config/timeouts.ts
      // Single source of truth for request timeouts and Bun's idleTimeout.
      // Invariant: BUN_IDLE_TIMEOUT_S (seconds) must be greater than every request
      // timeout. Bun's idleTimeout fires on socket inactivity, and the client socket
      // is idle while the server waits on the DB or Supabase; if it fired first the
      // client would get a dropped socket instead of the JSON 504 from errorHandler.
      // Kept import-free so it can be unit tested without env vars.

      export const API_REQUEST_TIMEOUT_MS = 20_000;

      // 10 MB at ~1 Mbps upstream is ~80 s, plus the re-upload to Supabase Storage.
      export const UPLOAD_REQUEST_TIMEOUT_MS = 120_000;

      export const BUN_MAX_IDLE_TIMEOUT_S = 255;
      export const IDLE_TIMEOUT_MARGIN_S = 10;

      export const BUN_IDLE_TIMEOUT_S = Math.min(
      	BUN_MAX_IDLE_TIMEOUT_S,
      	Math.ceil(
      		Math.max(API_REQUEST_TIMEOUT_MS, UPLOAD_REQUEST_TIMEOUT_MS) / 1000,
      	) + IDLE_TIMEOUT_MARGIN_S,
      );
      ```
      Files: `server/src/config/timeouts.ts` (new)
      Verify: from `server/`, `bun run typecheck` passes; `bunx biome check src/config/timeouts.ts` reports no errors (run `bunx biome format --write src/config/timeouts.ts` if only formatting differs).

- [ ] 2. Add a small unit test for the invariant, following `src/utils/pagination.test.ts` style (`import { describe, it, expect } from "bun:test";`).
      Cases: (a) `BUN_IDLE_TIMEOUT_S * 1000` is greater than both `API_REQUEST_TIMEOUT_MS` and `UPLOAD_REQUEST_TIMEOUT_MS`; (b) `BUN_IDLE_TIMEOUT_S <= BUN_MAX_IDLE_TIMEOUT_S`; (c) `UPLOAD_REQUEST_TIMEOUT_MS > API_REQUEST_TIMEOUT_MS`; (d) `BUN_IDLE_TIMEOUT_S` equals 130 (documents the chosen value).
      Files: `server/src/config/timeouts.test.ts` (new)
      Verify: from `server/`, `bun test` → 15 pass, 0 fail (11 existing + 4 new); `bunx biome check src/config/timeouts.test.ts` clean.
      Depends on: 1.

- [ ] 3. Rewire `server/src/index.ts` to use the constants and exempt uploads from the general timeout.
      - Add imports: `import { except } from "hono/combine";` and `import { API_REQUEST_TIMEOUT_MS, BUN_IDLE_TIMEOUT_S, UPLOAD_REQUEST_TIMEOUT_MS } from "./config/timeouts";` (place next to the existing `hono/*` and `./config/env` imports; do not reorder unrelated imports).
      - Above the timeout middleware, define a shared factory:
        `const timeoutException = () => new HTTPException(504, { message: "Server terlalu lama merespons" });`
      - Replace the current `/api/*` timeout block with:
        ```ts
        // Fail hung requests (e.g. a stuck DB call) with a JSON 504 from the error
        // handler instead of a dropped socket. Uploads are excluded here and get
        // their own longer limit below. See config/timeouts.ts for the invariant.
        app.use(
        	"/api/*",
        	except(
        		"/api/v1/upload*",
        		timeout(API_REQUEST_TIMEOUT_MS, timeoutException),
        	),
        );
        ```
      - In the upload section, before `requireAuth`, add:
        `app.use("/api/v1/upload*", timeout(UPLOAD_REQUEST_TIMEOUT_MS, timeoutException));`
        (timeout first so the auth check is also bounded, mirroring the general route where timeout runs before route middleware).
      - Replace the default export and its comment with:
        ```ts
        // Bun reads serve options from the default export. idleTimeout is derived in
        // config/timeouts.ts so it always exceeds every request timeout and the JSON
        // 504 reaches the client first. The Hono instance itself stays the default
        // export so Vercel's Hono detection still works.
        export default Object.assign(app, { idleTimeout: BUN_IDLE_TIMEOUT_S });
        ```
      - Do not touch `auth.controller.ts` (login rate limiter), `upload.controller.ts`, or DB pool code (review finding #2 is out of scope).
      Files: `server/src/index.ts`
      Verify: from `server/`, `bun run typecheck` passes; `bun test` still 15 pass. `bunx biome check src/index.ts` must show no NEW diagnostics beyond the pre-existing organizeImports/format ones (compare against `git stash`-free baseline by running `git diff --stat` to confirm only intended lines changed; do not reformat the file).
      Depends on: 1.

- [ ] 4. Behavioral check of the exemption pattern (throwaway, not committed).
      Write a temp script outside `src/` (e.g. `server/tmp-timeout-check.ts`) that builds a mini `new Hono()` with the same wiring: `app.use("/api/*", except("/api/v1/upload*", timeout(50, f)))`, `app.use("/api/v1/upload*", timeout(300, f))`, `app.onError` returning `c.json({ error: err.message }, err.status)`, and routes `GET /api/v1/projects` and `POST /api/v1/upload` that each `await Bun.sleep(150)` then return 200. Call via `app.request(...)`. Expected: `/api/v1/projects` → 504 JSON; `/api/v1/upload` → 200 (only the long limit applies). Add a third route sleeping 400 ms on upload → 504 JSON. Run with `bun tmp-timeout-check.ts` from `server/`, then delete the file.
      Files: temp only; delete afterward (`git status` must not show it).
      Depends on: 3.

- [ ] 5. Final verification and local commit.
      From `server/`: `bun run typecheck` (pass), `bun test` (15 pass / 0 fail). `git status` shows only `server/src/index.ts` modified plus `server/src/config/timeouts.ts` and `server/src/config/timeouts.test.ts` added. Commit on `fix/backend-db-reliability` with a message like `fix(server): give uploads a longer timeout and derive idleTimeout from shared constants`. Push only if the workflow's finalize step instructs it, to the existing PR branch (never main, never a new PR, never merge).
      Depends on: 2, 3, 4.
