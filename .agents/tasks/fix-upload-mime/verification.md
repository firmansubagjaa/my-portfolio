# Verification: fix-upload-mime (iteration 1)

Worktree: `.worktrees/fix-upload-mime`, branch `fix/upload-mime-type`. Run on Windows/PowerShell, 2026-10-06.

## Changes
- `server/src/utils/file-signature.ts`: added `DetectedImageType` and `getMimeTypeFromImageType()` (a Record lookup: png→image/png, jpg→image/jpeg, gif→image/gif, webp→image/webp). `detectImageType` now returns `DetectedImageType | "unknown"`; its behavior is unchanged.
- `server/src/utils/file-signature.test.ts` (new): 10 tests covering the MIME map (explicit jpg→image/jpeg) and magic-byte detection for PNG, JPEG, GIF, WebP, plus unknown text and an empty buffer.
- `server/src/controllers/upload.controller.ts`: the upload body is now the raw `Uint8Array` with `contentType` taken from the magic-byte type and `upsert: false`. Storage-js ignores `contentType` for Blob bodies (multipart path), which was the root cause of the 415. On a storage error it logs a sanitized object via `console.error` (name, message, status, statusCode, bucket, path; no keys, headers, or file contents), then maps 415→`UnsupportedMediaTypeError`, 413→`PayloadTooLargeError`, and anything else to the existing 500 `AppError`. Imports were sorted by biome. The filename, path, and `{ url }` response (UploadResultDTO) are unchanged. No client, auth.controller, or dependency changes.

## Static checks (in `server/`)
| Command | Result |
|---|---|
| `bun run typecheck` (`tsc --noEmit`) | exit 0, no errors |
| `bun test` | 25 pass, 0 fail, 4 files (includes the 10 new file-signature tests) |
| `bunx biome check src/controllers/upload.controller.ts src/utils/file-signature.ts src/utils/file-signature.test.ts` | Clean after `biome check --write` (import ordering + LF line endings) |

Note: biome also flags untouched files such as `pagination.test.ts` in this checkout. The checkout has `core.autocrlf=true`, so files arrive with CRLF and biome expects LF. That's pre-existing and environmental. Git normalizes on commit, so the committed diff carries no line-ending churn.

## End-to-end (worktree server, `$env:PORT="3003"; bun src/index.ts`)
I logged in once with `POST /api/v1/auth/login` (admin) → 200 and reused the cookie for every request.

| Request | Result |
|---|---|
| Upload 1×1 PNG (70 B) | 200, `data.url` = `.../object/public/portfolio-assets/portfolio-uploads/<ts>/<uuid>.png` |
| Upload 1×1 JPEG (134 B) | 200, URL ends in `.jpg` |
| Upload 1×1 WebP (34 B) | 200, URL ends in `.webp` |
| GET PNG URL | 200, `content-type: image/png`, 70 B |
| GET JPEG URL | 200, `content-type: image/jpeg`, 134 B |
| GET WebP URL | 200, `content-type: image/webp`, 34 B |
| Upload text renamed `fake.png` (authenticated) | 415 `UNSUPPORTED_MEDIA_TYPE`, "Format file harus PNG, JPG, GIF, atau WebP", JSON envelope intact |
| Upload PNG without cookie | 401 `UNAUTHORIZED`, "Silakan login terlebih dahulu" |

The server log showed only the startup line, with no `Supabase storage upload failed` entries. The bucket `portfolio-assets` is public, since `getPublicUrl` links resolved without auth. No Supabase settings were changed.

## Cleanup
- A throwaway service-role script (`server/tmp-cleanup.ts`, deleted after use, never committed) called `storage.remove()` on the 3 uploaded paths and got `removed: 3`. Re-fetching with a cache-buster query returned 400 (object not found). A plain GET right after deletion still returned 200 from the CDN cache, which will expire.
- Stopped the server; port 3003 is no longer listening. Deleted the temp test files, cookie, and log in `%TEMP%\upl-e2e`. `bun install` was not run, so bun.lock is untouched.
