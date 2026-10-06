# Send magic-byte MIME type to Supabase storage on image upload

Image uploads were failing with 415 because the controller wrapped the bytes in a `Blob`. storage-js ignores `contentType` for Blob bodies, so Supabase received `application/octet-stream` and the bucket's MIME allow-list rejected it. The fix uploads the raw `Uint8Array` and passes a `contentType` taken from a new `getMimeTypeFromImageType()` lookup, keyed on the type that `detectImageType()` reads from magic bytes. Storage errors now produce a sanitized log line, and Supabase 415/413 responses map to the matching domain errors instead of a generic 500. Live checks show PNG, JPEG and WebP upload and are served with the right `content-type`. A renamed text file gets a 415, and an unauthenticated request gets a 401.

Watch for: a Supabase-side 415 is shown to the user as "format must be PNG/JPG/GIF/WebP", which could hide a bucket allow-list misconfiguration (likely, non-blocking, but the log line still records it). GIF was only unit-tested, not uploaded end to end (confirmed, non-blocking).

**Verdict**: APPROVED

## High-level view

The trust model is correct. The client-supplied `file.type` is never read. Both the extension and the MIME type come from the same magic-byte result, so `.jpg` always pairs with `image/jpeg`, and the explicit map avoids the old `image/jpg` value, which is not a real MIME type. The `as DetectedImageType` cast is safe because the `ALLOWED_TYPES` guard has already rejected `"unknown"`.

Error handling keeps the existing JSON envelope because it throws the existing `AppError` subclasses. The new log records name, message, status, statusCode, bucket and path. It has no keys, headers or file bytes. The 415/413 mapping is small and checks both `status` and `statusCode`, since storage-js error shapes differ between versions.

Auth is unchanged: `requireAuth` is still mounted on `/api/v1/upload*` in `index.ts`, and the live 401 check confirms it. `rate-limit.ts` and `auth.controller.ts` are not in the diff. The change touches three server files, adds no dependencies, and commits nothing from `.agents/`, `.testmuai/`, `.env` or `bun.lock`. Style is tabs, double quotes and biome-sorted imports.

<details>
<summary>Issues (2)</summary>

1. **Supabase 415 message masks bucket config** (likely, non-blocking): if the bucket's allowed MIME list ever stops including a type the server accepts (for example GIF), users see "format must be PNG, JPG, GIF, or WebP" for a GIF. The sanitized log is the only signal. Optionally use a distinct message or keep 500 for storage-side 415s; acceptable as is.
2. **GIF not covered end to end** (confirmed, non-blocking): verification uploaded PNG, JPEG and WebP only. GIF is covered by unit tests for detection and the map. Do a quick manual GIF upload if the bucket allow-list is uncertain.

</details>

<details>
<summary>Details</summary>

### Supabase 415 remapping and bucket allow-list drift

Before this change, every storage error became a 500. Now a storage-side 415 surfaces as `UnsupportedMediaTypeError` with the same message used for a magic-byte rejection. By the time Supabase sees the request, the server has already confirmed the bytes are one of the four allowed types and sent the matching MIME. So a Supabase 415 at this point most likely means the bucket configuration disagrees with the server's allow-list, not that the user sent a bad file. Showing the user "wrong format" for a valid GIF would be misleading. The `console.error` line with `statusCode: "415"` is the only clue to the real cause. This is likely rather than confirmed, because the bucket's actual `allowed_mime_types` were not inspected. It doesn't block: the main bug is fixed and the log gives operators what they need.

### Test coverage

The new `file-signature.test.ts` covers the MIME map for all four types, including jpg→`image/jpeg`. It also covers detection for each signature, plus text and empty buffers. The live checks cover the actual regression: content type preserved through storage and public URL. Not tested: a GIF end-to-end upload, the 413/415 storage-error mapping branches (they would need a stubbed Supabase client), and a WebP-like RIFF file that isn't WebP. The last one belongs to the detector, which this change did not alter.

</details>

<details>
<summary>File map</summary>

- `server/src/controllers/upload.controller.ts`: raw-bytes upload with detected `contentType` and `upsert: false`, sanitized storage error log, 415/413 mapping, biome import order.
- `server/src/utils/file-signature.ts`: `DetectedImageType` type and `getMimeTypeFromImageType()` map; detector return type narrowed with the alias.
- `server/src/utils/file-signature.test.ts`: new unit tests for the map and the detector.

Full diff: `git -C .worktrees/fix-upload-mime diff main...fix/upload-mime-type`

</details>
