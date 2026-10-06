## Summary

Image uploads from the admin panel failed with a Supabase Storage **415 Unsupported Media Type**.

### Root cause
The upload controller passed a `Blob` with no `type` to `storage.upload()`. For Blob bodies, storage-js takes the multipart path and ignores the `contentType` option, so the object was sent without a valid image MIME type and Supabase rejected it with 415.

### Fix
- `server/src/utils/file-signature.ts`: added `DetectedImageType` and `getMimeTypeFromImageType()` (png→image/png, jpg→image/jpeg, gif→image/gif, webp→image/webp). `detectImageType` behavior is unchanged.
- `server/src/controllers/upload.controller.ts`: upload the raw `Uint8Array` with `contentType` derived from the magic-byte type and `upsert: false`. Storage errors are logged in sanitized form (name, message, status, bucket, path; no keys or file contents) and mapped 415→`UnsupportedMediaTypeError`, 413→`PayloadTooLargeError`, everything else→500 `AppError`. Filename, path, and `{ url }` response shape are unchanged.
- `server/src/utils/file-signature.test.ts` (new): 10 tests for the MIME map and magic-byte detection (PNG, JPEG, GIF, WebP, unknown text, empty buffer).

No client, auth, or dependency changes.

## Testing
Static checks (in `server/`):
- `bun run typecheck`: no errors
- `bun test`: 25 pass, 0 fail (includes the 10 new tests)
- `biome check` on the changed files: clean

End-to-end against a local server with an authenticated admin session:
- Upload 1×1 PNG / JPEG / WebP: 200, returned public URLs end in `.png` / `.jpg` / `.webp`
- GET each public URL: 200 with `content-type` `image/png` / `image/jpeg` / `image/webp` and correct byte sizes
- Text file renamed to `fake.png`: 415 `UNSUPPORTED_MEDIA_TYPE` with the normal JSON error envelope
- Upload without a cookie: 401 `UNAUTHORIZED`
- No `Supabase storage upload failed` entries in the server log; test objects were removed from the bucket afterwards
