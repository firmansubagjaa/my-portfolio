# Implementation Plan: fix image upload MIME (415 from Supabase)

Worktree: `d:\File Defir\Projects\My Portfolio\.worktrees\fix-upload-mime` (branch `fix/upload-mime-type`, clean, at `a77fda9`). Use absolute paths; relative paths land in the parent workspace.

## Findings (from reading the code)

- `server/src/controllers/upload.controller.ts` calls `.upload(path, new Blob([uint8Array]), { contentType: \`image/${imageType}\` })`.
- In `@supabase/storage-js` (bundled with supabase-js 2.117.2), `uploadOrUpdate()` in `server/node_modules/@supabase/storage-js/dist/index.mjs` (~line 615) has three branches:
  - `fileBody instanceof Blob`: wraps it in multipart `FormData` and **ignores `options.contentType`**. The part's type comes from the Blob, which is empty here, so the server sees `application/octet-stream` and returns 415. That's the confirmed root cause.
  - Any other body (Uint8Array/ArrayBuffer): sends raw bytes with `content-type: options.contentType`. This is the branch we want.
- There's a second bug: `jpg` produces `image/jpg`, which isn't a valid MIME type. It has to map to `image/jpeg`, or JPEG uploads would still be rejected by a MIME allow-list once the Blob issue is fixed.
- `getExtensionFromMimeType()` doesn't exist in `file-signature.ts` yet. Only `detectImageType()` exists, returning `"png" | "jpg" | "gif" | "webp" | "unknown"`. Those values are also the file extensions in use, so the extension is already correct. Only the MIME mapping is missing.
- The storage error (`StorageApiError`) has `message`, `status` (HTTP number) and `statusCode` (string). The controller currently swallows it with no log.
- The response `{ url: publicUrl }` already matches `UploadResultDTO` (`server/src/shared/dto.ts`). The client (`client/src/services/upload.service.ts`) sends multipart `file` and reads `data.url`, so **no client change**.
- Tests use `bun:test` and sit next to the module (`server/src/utils/pagination.test.ts`, `sql.test.ts`, `config/timeouts.test.ts`). Commands come from `server/package.json`: `bun test`, `bun run typecheck`, `bun run lint` (biome). Style: tabs, double quotes, `// File:` header comment.

## Decisions

- **Pass the raw `Uint8Array` as the body with a correct `contentType`**, not `new Blob([bytes], { type })`. The non-Blob branch is the only one that honors `contentType` and sends a plain binary body. One source of truth, no multipart. (A typed Blob would also work, but it depends on multipart part typing.)
- **Add a pure helper `getMimeTypeFromImageType()` in `file-signature.ts`** as a `Record` lookup. It's the unit-testable piece and fixes `jpg → image/jpeg`. The extension stays `imageType` (`png|jpg|gif|webp`), so we don't need a separate extension helper.
- **Error handling:** `console.error` a sanitized object (`message`, `status`, `statusCode`, `name`, bucket, path; never keys or headers). Then map storage status 415 → `UnsupportedMediaTypeError`, 413 → `PayloadTooLargeError`, everything else → the existing `AppError(500, "INTERNAL_ERROR", "Upload ke Supabase gagal")`. All of these go through the existing `errorHandler` JSON envelope.
- Out of scope: auth.controller.ts / login rate limiter, timeouts, dedup of the `ALLOWED_TYPES`/`UPLOAD_MAX_FILE_SIZE` constants against dto.ts, Supabase bucket settings, and dependencies.

## Steps

- [ ] 1. Add `getMimeTypeFromImageType()` to `server/src/utils/file-signature.ts` and give it unit tests.
      Export a type `DetectedImageType = "png" | "jpg" | "gif" | "webp"` and a function `getMimeTypeFromImageType(type: DetectedImageType): string` backed by
      `const IMAGE_MIME_TYPES: Record<DetectedImageType, string> = { png: "image/png", jpg: "image/jpeg", gif: "image/gif", webp: "image/webp" }`.
      `detectImageType()` keeps its current behavior; at most, retype its return as `DetectedImageType | "unknown"`.
      Create `server/src/utils/file-signature.test.ts` (bun:test, same header/style as `pagination.test.ts`) covering:
      - `getMimeTypeFromImageType` for all 4 types, explicitly asserting `jpg → "image/jpeg"`.
      - `detectImageType` on minimal magic-byte arrays for PNG (`89 50 4E 47`), JPEG (`FF D8 FF`), GIF (`47 49 46 38`), WebP (`RIFF....WEBP`, 12 bytes) and an unknown/empty buffer → `"unknown"`.
      Files: `server/src/utils/file-signature.ts`, `server/src/utils/file-signature.test.ts` (new)
      Verify: in `server/`, run `bun test src/utils/file-signature.test.ts`; all new tests pass.

- [ ] 2. Fix the upload body and the error handling in `server/src/controllers/upload.controller.ts` (depends on 1).
      - Import `getMimeTypeFromImageType` (and `DetectedImageType` if needed for narrowing) from `../utils/file-signature`.
      - After the existing `ALLOWED_TYPES` check, compute `const contentType = getMimeTypeFromImageType(imageType as DetectedImageType);`. The type comes only from magic bytes; never read `file.type`.
      - Replace `.upload(uploadPath, new Blob([uint8Array]), { contentType: \`image/${imageType}\` })` with `.upload(uploadPath, uint8Array, { contentType, upsert: false })`. Keep the filename `${crypto.randomUUID()}.${imageType}` and the path unchanged.
      - In `if (error)`:
        - Log with `console.error("Supabase storage upload failed:", { name: error.name, message: error.message, status, statusCode, bucket: env.SUPABASE_STORAGE_BUCKET, path: uploadPath })`, where `status`/`statusCode` are read defensively, e.g. `const status = "status" in error ? Number(error.status) : undefined` (same for `statusCode`) so it typechecks against `StorageError`. Never log keys, headers or the file.
        - If `status === 415 || statusCode === "415"`, throw `new UnsupportedMediaTypeError("Format file harus PNG, JPG, GIF, atau WebP")`.
        - If `status === 413 || statusCode === "413"`, throw `new PayloadTooLargeError("Ukuran file maksimal 10MB")`.
        - Otherwise keep the existing `throw new AppError(500, "INTERNAL_ERROR", "Upload ke Supabase gagal")`.
      - Leave the public URL generation and the `ApiResponse.success(c, { data: { url: publicUrl }, ... })` response as they are (already matches `UploadResultDTO`).
      Files: `server/src/controllers/upload.controller.ts`
      Verify: in `server/`, run `bun run typecheck` (no errors), `bun run lint` (clean for changed files; run `bun run format` if biome only reports formatting) and `bun test` (all suites pass, including `timeouts.test.ts`).

- [ ] 3. Manual end-to-end check against the real bucket (needs `server/.env` with Supabase vars; no Supabase settings changes).
      - Start the server: in `server/`, run `bun run dev` in the background, on the port from env.
      - Log in via `POST /api/v1/auth/login` to get the auth cookie. Use few attempts so the login rate limiter doesn't trip.
      - `curl -b <cookie> -F "file=@<some>.png" http://localhost:<port>/api/v1/upload` should return 200 with `data.url`. Repeat with a `.jpg` file, which exercises the `image/jpeg` mapping.
      - `curl -I <data.url>` should return 200 with `content-type: image/png` (or `image/jpeg`).
      - Negative check: upload a renamed `.txt` as `.png` and confirm it returns 415 `UNSUPPORTED_MEDIA_TYPE` from the magic-byte check, with the JSON envelope intact.
      - If the public URL returns 400/404 because the bucket isn't public, don't change Supabase. Record it in the final report or PR description ("bucket `portfolio-assets` must be public for `getPublicUrl` links to resolve").
      - Stop the dev server afterward. If credentials or the network aren't available, say so explicitly instead of claiming this step passed.
      Files: none
      Verify: the curl results above; the server log shows no `Supabase storage upload failed` entries for the valid uploads.

- [ ] 4. Commit locally on `fix/upload-mime-type` (don't push): `fix(server): send detected image MIME type to Supabase storage upload`.
      Stage only `server/src/utils/file-signature.ts`, `server/src/utils/file-signature.test.ts` and `server/src/controllers/upload.controller.ts`.
      Verify: `git status` is clean apart from intentionally untracked files; `git show --stat HEAD` lists exactly these 3 files.

## Files changed (summary)

| File | Change |
|---|---|
| `server/src/utils/file-signature.ts` | Add `DetectedImageType` and `getMimeTypeFromImageType()` (jpg → image/jpeg) |
| `server/src/utils/file-signature.test.ts` (new) | Unit tests for the MIME mapping and `detectImageType` |
| `server/src/controllers/upload.controller.ts` | Raw `Uint8Array` body + correct `contentType`; sanitized error log; 415/413 mapping |

There are no client changes, no dependency changes, and nothing changes in `auth.controller.ts`, `timeouts.ts`, `supabase.ts` or `dto.ts`.
