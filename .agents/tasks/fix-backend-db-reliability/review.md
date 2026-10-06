# Upload timeout exemption and single-sourced timeout constants

This follow-up to PR #12 stops the 20 s `/api/*` request timeout from cutting off legitimate multi-MB uploads. Uploads under `/api/v1/upload*` are excluded from the general timeout with `hono/combine`'s `except()` and get their own 120 s limit. All timeout values now live in a new import-free `server/src/config/timeouts.ts`, and Bun's `idleTimeout` is derived from them (130 s) instead of being a separate literal. The default export shape, the login rate limiter, and the lockfile are untouched.

Watch for: the 130 s `idleTimeout` is server-wide, so idle keep-alive sockets on every route now linger 130 s instead of 30 s (confirmed, non-blocking). The `upload*` glob also matches sibling paths like `/api/v1/uploads` (confirmed, harmless today since no such route exists).

**Verdict**: APPROVED

## High-level view

The exemption is two middleware registrations sharing one 504 factory: the general timeout is wrapped in `except("/api/v1/upload*", ...)`, and a separate `timeout(UPLOAD_REQUEST_TIMEOUT_MS)` is mounted on `/api/v1/upload*` ahead of `requireAuth`. Every other `/api/*` route keeps the same 20 s limit and the same JSON 504 message as before. The coder showed both directions at runtime: with the general limit forced to 1 ms, health/projects returned 504 while upload ran to completion, and with the upload limit forced to 1 ms only upload returned 504.

The 120 s upload value follows from the controller's 10 MB cap: about 80 s for the body at ~1 Mbps upstream, plus about 40 s for the server-side re-upload to Supabase Storage. It stays bounded, so a stuck Storage call still ends in a JSON 504.

`BUN_IDLE_TIMEOUT_S = min(255, ceil(max(api, upload)/1000) + 10)` gives 130 s. That is above both request timeouts and below Bun's 255 s cap, and the invariant comment explains why it has to be. Four unit tests lock in the ordering, the cap, upload > api, and the concrete 130 value. Because the module has no imports, these tests run without env vars.

Reviewer finding #2 (timed-out queries keep holding pool slots) is not addressed here. That is out of scope for this follow-up and is already documented as a known limit in verification.md.

<details>
<summary>Issues (2)</summary>

1. **Server-wide idle socket lifetime** — raising `idleTimeout` to 130 s keeps idle keep-alive connections open longer on every route, not only uploads (confirmed). This is acceptable for this app's scale. If connection-exhaustion pressure ever shows up, consider overriding per request with `server.timeout(req, ...)` for upload only. Non-blocking.
2. **Glob breadth of `/api/v1/upload*`** — the pattern also exempts any future `/api/v1/uploads...` or `/api/v1/upload-foo` route from the 20 s limit (confirmed). It matches the existing `requireAuth` mount, so it is consistent. Use `/api/v1/upload` + `/api/v1/upload/*` if a sibling route is ever added. Non-blocking.

</details>

<details>
<summary>Details</summary>

### Exemption wiring in `index.ts`

```
/api/*            -> except("/api/v1/upload*", timeout(20 s))   // all non-upload routes
/api/v1/upload*   -> timeout(120 s) -> requireAuth -> uploadController
```

`except()` matches its string condition against `c.req.path` with Hono's router, using the same pattern syntax as `app.use`. So `/api/v1/upload` and `/api/v1/upload/<anything>` are both exempted and both picked up by the upload-specific timeout. The upload timeout is mounted before `requireAuth`, so auth time counts against the 120 s budget. That is negligible next to body transfer. The upload timer covers `c.req.formData()`, the magic-byte check, and the Supabase re-upload, which is exactly the span the 120 s value was sized for.

The glob's breadth is the one sharp edge (confirmed). `upload*` is a prefix match, not a segment match, so a future `/api/v1/uploads` route would silently inherit the 120 s limit instead of 20 s. The existing `requireAuth` mount uses the same glob, so the two stay aligned. No such route exists today.

### idleTimeout derivation and its blast radius

`idleTimeout` measures socket inactivity, and after the body is read the client socket is idle while the server waits on Supabase. That is why it must exceed the upload limit, not only the API limit. Because of the `min(255, ...)` clamp, a request timeout above 245 s would break the invariant. The `idleTimeout > every request timeout` test would catch it.

The trade-off (confirmed): `idleTimeout` is a Bun server option, not a per-route one. Idle keep-alive connections and slow-header clients on every route can now hold a socket for 130 s instead of 30 s. For a single-admin portfolio API this is non-blocking. Bun's per-request `server.timeout(req, seconds)` would scope the long idle window to uploads if that ever matters. On Vercel the property is ignored, as before.

### Scope and hygiene

Commit `7777f0d` touches only `config/timeouts.ts`, `config/timeouts.test.ts`, and `index.ts`. `git diff main` shows no change to `server/bun.lock` (it is modified in the worktree but unstaged) or to `auth.controller.ts`. No `.env`, `.agents/`, or `.testmuai/` files are committed. The default export is still `Object.assign(app, { idleTimeout: BUN_IDLE_TIMEOUT_S })`, which keeps the Hono instance as the default export.

Not tested: a real > 20 s multi-MB upload over a throttled link, and the 130 s idle close end to end. The 1 ms override runs and the invariant tests cover the wiring and ordering. A real 2xx upload also wasn't demonstrated, because of a pre-existing Supabase 415 MIME rejection (`new Blob([uint8Array])` without a `type` in `upload.controller.ts`). That bug is unrelated to this change and is worth a separate fix.

</details>

<details>
<summary>File map</summary>

- `server/src/config/timeouts.ts`: new. API/upload request timeouts, Bun cap, margin, derived `BUN_IDLE_TIMEOUT_S`, invariant comment.
- `server/src/config/timeouts.test.ts`: new. Four invariant tests.
- `server/src/index.ts`: general timeout wrapped in `except()`, upload-specific timeout mount, shared `timeoutException`, `idleTimeout` from constants.

Full diff: `git show 7777f0d` in `.worktrees/backend-db-reliability`.

</details>
