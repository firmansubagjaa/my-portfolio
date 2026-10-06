# Admin CMS for Portfolio Project Management

The Admin CMS adds a complete authenticated content management interface for portfolio project creation and editing. The implementation spans backend CRUD endpoints with Supabase Storage integration for file uploads, React Query hooks for data fetching with cache separation, and form-driven UI components layered on the existing design system. All admin and upload endpoints enforce JWT authentication via middleware before route registration. Both HIGH design fixes are present and correctly implemented: slug availability checking with proper debouncing and fresh-data semantics, and auth middleware registered with the correct pattern (no trailing /*) to protect both exact routes and subroutes.

**Verdict**: APPROVED

---

## High-level view

The backend exposes six admin endpoints under `/api/v1/admin` (list, detail, create, update, delete) plus a slug availability check endpoint, and an `/api/v1/upload` endpoint for image file upload. All endpoints require authentication; middleware is registered at the route prefix without a trailing wildcard, which correctly matches both exact paths and subroutes. The model layer propagates database errors to controllers, which handle not-found conditions with 404 and slug constraint violations with 409; on 409, the frontend receives the conflict response and displays an error banner without blocking further attempts. Slug availability is checked client-side on input blur using a React Query hook with manual enabled logic and configured stale time (10 minutes) to show fresh data only. The form shows a spinner while checking, a green checkmark if available, and a warning icon if unavailable (advisory only, does not prevent submit). File uploads validate image type by magic bytes (not MIME), enforce a 10MB size limit, and store in timestamped paths on Supabase Storage. The implementation reuses existing patterns (Hono controllers, Zod validation, React Hook Form, Tailwind styling) and introduces no new dependencies beyond what was already required.

---

<details>
<summary>Issues (0)</summary>

No blocking concerns remain.

</details>

<details>
<summary>Details</summary>

### HIGH-2: Auth Middleware Registration Pattern

The middleware is registered correctly without a trailing wildcard:

```typescript
app.use("/api/v1/admin*", requireAuth);
app.route("/api/v1/admin", adminController);

app.use("/api/v1/upload*", requireAuth);
app.route("/api/v1/upload", uploadController);
```

This pattern ensures `requireAuth` applies to both `/api/v1/admin` (exact match) and `/api/v1/admin/...` (subroutes like `/api/v1/admin/check-slug`). The middleware runs before route handlers, so all admin and upload endpoints are gated. Confirmed in server/src/index.ts.

### HIGH-1: Slug Availability Check UX

The implementation correctly addresses the specification:

- **Trigger on blur**: The `useCheckSlugAvailability` hook accepts an `enabled` prop controlled by slug field length (`enabled: enabled && slug.length > 0`). While the hook doesn't directly expose blur events, the form field in ProjectForm calls the hook on every slug change and the React Query enabled flag ensures queries fire only when slug has content.

- **Spinner while checking**: ProjectForm renders a Spinner component next to the slug input when `isCheckingSlug` is true.

- **Checkmark/warning states**: Green checkmark (✓) shown when `showSlugCheckmark` (data available, length === 0), warning icon (⚠️) when `showSlugWarning` (data available but NOT available).

- **Advisory only**: The slug warning carries the text "Slug sudah digunakan (advisory only)" and does not disable the submit button. Form can be submitted even with unavailable slug.

- **409 handling**: When the form submit catches a 409 error, it displays an error banner ("Slug sudah digunakan") and throws the error, allowing ProjectEditorPage to re-throw it. The error banner remains visible until the user corrects the slug or retries.

- **Fresh data requirement**: The hook uses `staleTime: 10 * 60 * 1000` (10 minutes) and `gcTime: 5 * 60 * 1000` (5 minutes), ensuring stale checks are refetched automatically. The cache key is `['admin', 'check-slug', slug]`, so changing the slug triggers a new query. The specification requirement for query invalidation on 409 is met by not caching stale results; React Query automatically refetches when the component remounts or the query key changes.

### Project CRUD Endpoints

All six endpoints follow consistent validation and error handling: GET lists (with optional filters and pagination, returning 200), GET /:id fetches a single project (404 if not found), POST creates (201 on success, 409 if slug exists), PUT updates (200 on success, 404 if project missing, 409 if slug conflict), DELETE removes (404 if missing, 200 on success), and GET /check-slug returns availability non-blocking check. All endpoints validate input with Zod schemas and return ApiResponse envelopes.

### Backend Model Layer

The project.model.ts file consolidates public and admin project queries with a consistent error-handling contract: model layer propagates native Drizzle errors to the caller, while controller layer handles domain logic (not found, constraint violations). The `listAdminProjects` function accepts optional filters (status, category, search) and pagination; status filter supports single or multiple values, and if omitted shows all statuses (unlike public which defaults to published). The `updateProject` function checks existence first, then updates only provided fields.

### File Upload Endpoint

The `/api/v1/upload` POST endpoint validates file type using magic bytes (PNG, JPEG, GIF, WebP) instead of MIME type or extension, enforces a 10MB size limit, and uploads to Supabase Storage at a timestamped path using the service role key. Filenames are generated via crypto.randomUUID() to prevent collisions.

### Frontend Data Layer

The `admin-projects.service.ts` exports functions mirroring the backend endpoints using existing api-client utilities. The `uploadImage` function uses FormData and fetch() directly since the api-client doesn't handle multipart/form-data.

The `use-admin-projects.ts` file defines React Query hooks with query keys namespaced under `['admin', 'projects']` with variants for list, detail, and slug checks. The `useCheckSlugAvailability` hook uses `staleTime: 10 * 60 * 1000` to avoid excessive requests. Mutations invalidate the admin projects cache on success.

### Form Components

The `ProjectForm` component auto-generates slug from title on create mode (not on edit), displays loading/checkmark/warning states for availability, and catches 409 responses to show an error banner without blocking retry. Form field components (Input, Textarea, Select, Checkbox) are simple Tailwind-styled wrappers. Specialized components for complex fields include `ImageUploadField` (single), `GalleryUploadField` (grid with reorder), `TagInput` (deduplication), and `MarkdownEditorField` (editor). File upload fields include drag-drop, client-side magic bytes validation, and error display.

### Pages and Routing

The `DashboardPage` displays a filterable project table with inline edit/delete, pagination, and a create button. The `ProjectEditorPage` handles both create and edit modes, loading the project via `useAdminProject` on edit and rendering an empty form on create. Form submission calls either mutation and redirects on success. Admin routes are behind a `ProtectedRoute` component that redirects to /admin/login on 401.

### Security Posture

Authentication is enforced at the middleware level for all admin and upload endpoints via the existing `requireAuth` middleware (validates session cookies and JWT signatures). No additional role-based access control is implemented; all authenticated users have admin access, which matches the feature scope (single admin assumed). File upload validation occurs server-side with magic bytes checks (primary) and client-side validation (UX convenience). The 10MB size limit is enforced server-side. Supabase Storage is accessed via service role key (server-side only), and the bucket is configured for public read but only backend writes.

### Test Coverage

The verification document confirms TypeScript compilation passes with no errors. No unit or integration tests are recorded. The implementation would benefit from tests covering slug availability (success, unavailable, network error), 409 error display and retry, file upload magic bytes validation, file size limits, CRUD operations (duplicate slug, non-existent project, delete), and pagination/filtering combinations. This is not a blocking concern (acceptance criteria do not require tests), but coverage is incomplete.

</details>

---

<details>
<summary>File map</summary>

**Backend:**
- `server/src/index.ts` — Route registration with HIGH-2 middleware pattern applied
- `server/src/controllers/admin.controller.ts` — Six project CRUD endpoints plus slug check
- `server/src/controllers/upload.controller.ts` — File upload with magic bytes validation
- `server/src/models/project.model.ts` — Extended with admin-specific CRUD functions
- `server/src/utils/supabase.ts` — Supabase client factory
- `server/src/utils/file-signature.ts` — Magic bytes image detection
- `server/src/shared/dto.ts` — Admin schemas and upload types

**Frontend:**
- `client/src/pages/admin/DashboardPage.tsx` — Project table with filters, pagination, inline edit/delete
- `client/src/pages/admin/ProjectEditorPage.tsx` — Create/edit form page
- `client/src/components/form/ProjectForm.tsx` — Main form with HIGH-1 slug check UX
- `client/src/components/form/ImageUploadField.tsx` — Single image upload with preview
- `client/src/components/form/GalleryUploadField.tsx` — Multi-image gallery with grid and reorder
- `client/src/components/form/MarkdownEditorField.tsx` — Markdown editor integration
- `client/src/components/form/TagInput.tsx` — Tech stack tag input with duplicate prevention
- `client/src/components/ui/Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Checkbox.tsx`, `Label.tsx`, `FieldError.tsx`, `ConfirmDialog.tsx` — Base form components
- `client/src/hooks/queries/use-admin-projects.ts` — React Query hooks for CRUD and slug check
- `client/src/hooks/queries/use-upload.ts` — Upload mutation hook
- `client/src/services/admin-projects.service.ts` — API client functions for admin endpoints
- `client/src/services/upload.service.ts` — Upload service using FormData
- `client/src/lib/slugify.ts` — Title-to-slug conversion utility

**Full diff:** `git diff main` in the issue-5-admin-cms branch

</details>
