# Verification: fix/backend-db-reliability

Worktree: `d:\File Defir\Projects\My Portfolio\.worktrees\backend-db-reliability`. Commit: `41ec0dd` on `fix/backend-db-reliability` (base `935c759`, origin/main). Not pushed, not merged.

Files changed: `server/src/db/index.ts`, `server/src/index.ts`, `server/src/controllers/admin.controller.ts`. Not committed: `server/.env`, `.agents/`, `.testmuai/`, and `server/bun.lock` (it was already modified in the worktree before I started, -3 lines, most likely from `bun install`. It is unrelated, so I left it unstaged).

No processes were listening on 3000 or 5173 during this work (checked with `Get-NetTCPConnection -State Listen -LocalPort 3000,3001,3002,5173`, which returned nothing). I touched only processes I started myself: 3002, 3003, 3004, 3005 and 3006.

## Final values

| Setting | Value | Why |
|---|---|---|
| postgres.js `max` | 5 in dev, 3 in prod | With 1, a single stuck query blocked every request. 3 is still small for serverless and the transaction pooler. |
| `max_lifetime` | 300 s | Recycles long-lived connections. |
| `prepare: false`, `connect_timeout: 10`, `idle_timeout: 20` | kept | `prepare: false` is required by the transaction pooler. |
| Client reuse | `globalThis.__pgClient` in non-production | Previously the client was stored but never read back. |
| `hono/timeout` on `/api/*` | 20 s, then `HTTPException(504, "Server terlalu lama merespons")` | A hung request now gets a JSON 504 from the existing error handler instead of a dropped socket. This replaces statement_timeout, which the pooler ignores (see below). |
| Bun `idleTimeout` | 30 s, set via `export default Object.assign(app, { idleTimeout: 30 })` | Must be above the 20 s request timeout so the 504 is sent before Bun closes the socket. The default export is still the Hono instance itself, so `fetch`, routes and the instance type are unchanged and Vercel's Hono detection keeps working. On Vercel the extra property is ignored. |

### Why statement_timeout was dropped

I tested it against the real pooler with a temporary script. Supavisor (transaction mode) ignores startup parameters:

```
connection_statement_timeout -> 2min     # postgres(url, { connection: { statement_timeout: 8000 } })
connection_options_flag -> 2min          # postgres(url, { connection: { options: "-c statement_timeout=8000" } })
```

`show statement_timeout` returns the role default (`2min`) either way. That is why the request-level timeout is used instead.

Two alternatives were not done. `SET LOCAL statement_timeout` would mean wrapping every query in a transaction. `ALTER ROLE ... SET statement_timeout` changes the shared database config, which is out of scope and needs the owner's approval.

Known limit: when the 504 fires, the underlying query keeps running on the DB side (up to the role's 2 min statement_timeout) and holds one pool connection until then. Other requests keep working because the pool is now larger than 1 (shown below).

## Static checks (`server/`)

```
> cmd /c "bun run typecheck 2>&1"
$ tsc --noEmit
typecheck exit: 0

> cmd /c "bun test 2>&1"
 11 pass
 0 fail
 11 expect() calls
Ran 11 tests across 2 files. [20.00ms]
test exit: 0

> bunx biome lint --colors=off src/db/index.ts src/index.ts src/controllers/admin.controller.ts
Checked 3 files in 6ms. No fixes applied.        # no lint errors on changed files

> bun run lint   (repo-wide biome check)
Checked 38 files ... Found 53 errors. Found 13 warnings.   # these errors already existed before this change
```

The repo-wide errors already existed. They are CRLF line endings (`core.autocrlf=true` on this checkout) and `organizeImports` ordering in many files.

On the 3 changed files, `biome check` reports 6 errors. Running `biome check` on the HEAD versions of the same 3 files also reports 6 errors, of the same kinds (organizeImports and CRLF format).

I also ran `biome format` on LF-normalized copies. `src/index.ts` and `src/db/index.ts` now pass. The only remaining format diff is in the untouched `adminController.post` block of admin.controller.ts, which already existed.

During development there was one real lint error (`noAssignInExpressions` on `??=`) and one formatter reflow in my new code. Both were fixed before the commit.

## Runtime: worktree server, `bun --hot src/index.ts`, PORT=3002

```
health #1 -> 200 in 1.94s; #2 0.29s; #3 0.35s; #4 0.38s; #5 0.29s
  {"success":true,...,"data":{"status":"ok","database":"up"}}
projects?limit=1 -> 200 in 2.57s
login (admin) -> 200 in 0.69s  {"message":"Berhasil masuk","data":{"username":"admin",...}}   # one login, cookie reused
admin list ?page=1&limit=10 -> 200 in 0.59s  (2 items)
check-slug?slug=ai-chat-platform   -> 200 {"data":{"available":false}}
check-slug?slug=brand-new-slug-xyz -> 200 {"data":{"available":true}}
check-slug without cookie          -> 401 {"category":"UNAUTHORIZED","message":"Silakan login terlebih dahulu"}
admin/<uuid> detail                -> 200   (/:id still works)
admin/not-a-uuid                   -> 400 VALIDATION_ERROR "Invalid UUID"   (/:id validation unchanged)
```

I re-ran the same set against the final code after the hot reload, and every result matched (health 200, projects 200, admin 200, slug false/true, 401 without cookie).

The client calls `GET /api/v1/admin/check-slug?slug=<encoded>` (`client/src/services/admin-projects.service.ts`), which matches the server route and query param. The route is still behind `app.use("/api/v1/admin*", requireAuth)`.

## Hot-reload connection check

I triggered reloads by bumping the mtime of `src/controllers/health.controller.ts`; the file contents were not changed. The server log showed one `Started development server` line per reload (19 in total by the end).

I counted connections in two ways:

- **Bun process sockets:** TCP sockets from the bun PID to remote port 6543, via `Get-NetTCPConnection -OwningProcess <pid> -State Established | ? RemotePort -eq 6543`.
- **pg_stat_activity:** queried from a separate script.

```
before reloads (after 6 parallel requests): bun->6543 sockets = 5
pg_stat_activity (usename=current_user): Supavisor idle 5, Supavisor active 1, pg_net 1
reload 1..5: health 200 (0.30-0.45s), sockets=5 each time
after 5 reloads + 6 more parallel requests: sockets = 5
pg_stat_activity: Supavisor idle 5, Supavisor active 1, pg_net 1   # unchanged
second round with final code: reload 1..3 -> health 200, sockets=2 each time
```

Before the second round, idle_timeout had already closed the earlier sockets (count was 0). The socket count is capped at the pool max and does not grow per reload, so the client is reused.

What I could not observe: pg_stat_activity only shows Supavisor's own backends, not individual client connections, so the bun socket count is the precise measure.

Dev caveat: because the client is cached on `globalThis`, edits to the pool options in `db/index.ts` only take effect after a full restart, not a hot reload.

## Bun idleTimeout check (temporary entry file, same default-export shape)

```
control: plain `export default app` (Bun default idleTimeout), handler sleeps 15s -> 000 (connection dropped) after 12.0s
`export default Object.assign(app, { idleTimeout: 30 })`, handler sleeps 15s   -> 200 {"ok":true} in 15.0s
```

The control run reproduces the original "socket hang up" behavior, and the fix confirms Bun reads `idleTimeout` from the Hono default export.

## Failure path (temporary script serving the real app plus a throwaway `/api/__sleep/:s` route)

Port 3003 used the real DB. Port 3006 used `DATABASE_URL` with its host replaced by the unreachable `10.255.255.1`; that was a process env override only, and `.env` was not edited.

```
[3003] pg_sleep(2)  -> 200 {"slept":2} in 2.55s                      # normal queries unaffected
[3003] pg_sleep(25) -> 504 {"success":false,"status":504,"category":"INTERNAL_ERROR","message":"Server terlalu lama merespons"} in 20.0s
[3003] health while pg_sleep(25) holds a connection -> 200 in 2.12s   # pool > 1, no head-of-line blocking
[3006 unreachable DB] projects?limit=1 -> 500 {"success":false,"category":"INTERNAL_ERROR","message":"Failed query: ..."} in 10.0s (connect_timeout)
```

All failure cases returned JSON from `errorHandler`; none dropped the socket.

The 504 is categorized as `INTERNAL_ERROR` because of the existing HTTPException mapping in error-handler.ts, which I did not change.

The 500 message includes the SQL in non-production; that is existing `isProduction` behavior.

## Cleanup

- Stopped every process I started: PIDs 24544 (3002), 23324, 33424 (3003), 33668 (3006), and the 3004/3005 idle-test processes. Afterwards, `Get-Process bun` returned nothing.
- Deleted `server/__tmp_verify/` (conns.ts, st.ts, failpath.ts, idle.ts, LF copies), the cookie jar, and the temp logs in `%TEMP%`.
- The login password was sent from a temp file, which was deleted immediately. The token is redacted in the output above.

## Not verified

- I did not deploy to Vercel. The claim that Vercel's Hono detection still works rests on the default export still being the same Hono instance.
- I could not reproduce the original wedge itself (a stuck client in a long-running process). The fixes are covered by the checks above: no reload leak, pool larger than 1, request timeout returns JSON, idleTimeout above the worst case.

## Follow-up: upload timeout + shared constants

Changes: new `server/src/config/timeouts.ts` (API_REQUEST_TIMEOUT_MS = 20_000, UPLOAD_REQUEST_TIMEOUT_MS = 120_000, BUN_IDLE_TIMEOUT_S = min(255, ceil(max(...)/1000) + 10) = 130) and `timeouts.test.ts`. `server/src/index.ts`: general `/api/*` timeout wrapped in `except("/api/v1/upload*", ...)` from `hono/combine` (built into hono 4.13.13, no new dependency); `/api/v1/upload*` gets `timeout(UPLOAD_REQUEST_TIMEOUT_MS, ...)` before `requireAuth`; both share one `timeoutException` factory; default export is `Object.assign(app, { idleTimeout: BUN_IDLE_TIMEOUT_S })`.

Why 120 s: a 10 MB body (the controller cap) at ~1 Mbps upstream is ~80 s, leaving ~40 s for the server-side re-upload to Supabase Storage. idleTimeout 130 s > 120 s, so the JSON 504 is written before Bun closes the idle socket.

Static checks (from `server/`):
- `bun run typecheck` -> exit 0.
- `bun test` -> 15 pass, 0 fail (11 existing + 4 new invariant tests).
- `bunx biome check src/config/timeouts.ts src/config/timeouts.test.ts` -> clean.
- `bunx biome check src/index.ts` -> only the pre-existing organizeImports + format (CRLF) diagnostics; file was not reformatted.

Throwaway mini-app (`server/tmp-timeout-check.ts`, deleted) with the same wiring, general=50 ms, upload=300 ms, handlers sleeping:
- GET /api/v1/projects (150 ms) -> 504 JSON at ~71 ms
- POST /api/v1/upload (150 ms) -> 200 at ~151 ms (not cut at the general limit)
- POST /api/v1/upload/slow (400 ms) -> 504 JSON at ~301 ms

Real server, `$env:PORT="3002"; bun src/index.ts` (3000/5173 untouched):
- Run 1, committed values: GET /api/v1/health -> 200 (2.0 s cold). Login once as admin -> 200, cookie reused for all later calls. POST /api/v1/upload (1x1 PNG) -> 500 "Upload ke Supabase gagal" in 0.6 s.
- Run 2, temp edit API_REQUEST_TIMEOUT_MS = 1: health -> 504 JSON (0.02 s), /api/v1/projects -> 504 (0.02 s), upload -> handler ran to completion (500 from Supabase in 0.3 s, not 504) -> upload is exempt from the general limit.
- Run 3, temp edit UPLOAD_REQUEST_TIMEOUT_MS = 1: health -> 200 (2.2 s), upload -> 504 JSON (0.004 s) -> upload route has its own limit and it still produces the JSON 504.
- Temp edits reverted (file re-checked: 20_000 / 120_000); all servers stopped, nothing listening on 3002; temp cookie/PNG/login files deleted. `server/bun.lock` untouched.

Upload 500 root cause (pre-existing, NOT caused or fixed here): a throwaway Supabase check showed the bucket exists, and a direct upload with the same code shape returns StorageApiError 415 "mime type application/octet-stream is not supported". `upload.controller.ts` passes `new Blob([uint8Array])` without a `type`, so the bucket's MIME allow-list rejects it despite the `contentType` option. Likely fix (separate change): `new Blob([uint8Array], { type: ... })`. Out of scope for this step, so a real 2xx upload was not demonstrated.

Not verified: a real slow (> 20 s) multi-MB upload over a throttled link; Bun idleTimeout behaviour at 130 s end to end (covered by the invariant test and the earlier idle tests above).
