# Implementation Plan: Admin CMS for Portfolio Project Management (Issue #5)

**Status:** Ready for Implementation  
**Design Fixes Applied:** HIGH-1 (Slug Availability Check UX), HIGH-2 (Route Registration Middleware)  
**Estimated Scope:** 40-50 implementation steps across server and client  
**Environment Note:** Server .env must have `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET="portfolio-assets"` (already created by user)

---

## Backend Implementation (Server)

### Utilities

- [ ] 1. Create `server/src/utils/file-signature.ts` with `detectImageType()` function.
      Detects PNG, JPG, GIF, WebP from magic bytes (not MIME type).
      Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\utils\file-signature.ts`
      Verify: TypeScript compiles with no errors (`cd server && bun run typecheck`)

- [ ] 2. Create `server/src/utils/supabase.ts` with `createSupabaseClient()` factory.
      Initializes @supabase/supabase-js with env vars and returns authenticated client for storage ops.
      Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\utils\supabase.ts`
      Verify: TypeScript compiles with no errors (`cd server && bun run typecheck`)

### Models

- [ ] 3. Extend `server/src/models/project.model.ts` with `findProjectById(id)` function.
      Queries by UUID, returns full ProjectRow or undefined, no status filtering, propagates Drizzle errors.
      Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\models\project.model.ts`
      Verify: TypeScript compiles with no errors.

- [ ] 4. Add `listAdminProjects(filters, pagination)` to models.
      Allows filtering by single/multiple status, category, and search (title/summary/tech_stack).
      Returns paginated {items: ProjectListItemDTO[], total: number}.
      Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\models\project.model.ts`
      Verify: TypeScript compiles with no errors.

- [ ] 5. Add `createProject(input)` to models.
      Inserts project with provided fields, returns ProjectDTO, propagates unique constraint violation to caller.
      Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\models\project.model.ts`
      Verify: TypeScript compiles with no errors.

- [ ] 6. Add `updateProject(id, input)` to models.
      Merges fields, returns ProjectDTO or undefined if not found, propagates constraint violations.
      Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\models\project.model.ts`
      Verify: TypeScript compiles with no errors.

- [ ] 7. Add `deleteProject(id)` to models.
      Hard deletes project, returns void, propagates Drizzle errors, returns undefined if not found.
      Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\models\project.model.ts`
      Verify: TypeScript compiles with no errors.

### DTO & Schema

- [ ] 8. Update `server/src/shared/dto.ts` with admin schemas and types.
      Add `adminProjectListQuerySchema` (extends base with admin-specific defaults), `AdminProjectListQuery` type.
      Add `UploadResponse` interface, upload constants (`UPLOAD_MAX_FILE_SIZE`, `UPLOAD_ALLOWED_TYPES`).
      Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\shared\dto.ts`
      Verify: TypeScript compiles with no errors.

### Controllers

- [ ] 9. Create `server/src/controllers/admin.controller.ts` with Hono router.
      Implement:
      - GET / (projects list) - calls `listAdminProjects`, returns paginated response
      - GET /:id (project detail) - calls `findProjectById`, throws 404 if missing, returns ProjectDTO
      - POST / (create) - calls `createProject`, handles 409 slug conflict, returns 201 with ProjectDTO
      - PUT /:id (update) - calls `updateProject`, handles 404 and 409, returns 200 with ProjectDTO
      - DELETE /:id (delete) - calls `deleteProject`, throws 404 if missing, returns 200 with null data
      - GET /check-slug (slug availability) - checks uniqueness, returns {available: true/false}
      
      All endpoints validate input with Zod schemas, map errors to HTTP status codes, use ApiResponse.success().
      
      Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\controllers\admin.controller.ts`
      Verify: TypeScript compiles with no errors.

- [ ] 10. Create `server/src/controllers/upload.controller.ts` with Hono router.
       Implement:
       - POST / (upload) - accepts multipart form data with 'file' field, validates file type via magic bytes (not MIME), max 10MB, uploads to Supabase Storage, returns {url: string}
       
       Error handling:
       - 400 if no file or file missing
       - 413 if >10MB
       - 415 if invalid image type (detected via magic bytes)
       - 500 if Supabase upload fails
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\controllers\upload.controller.ts`
       Verify: TypeScript compiles with no errors.

### Route Registration (HIGH-2 Fix)

- [ ] 11. Update `server/src/index.ts` to register admin and upload routes with correct middleware pattern.
       Pattern (HIGH-2 specification):
       ```
       app.use("/api/v1/admin*", requireAuth);
       app.route("/api/v1/admin", adminController);
       
       app.use("/api/v1/upload*", requireAuth);
       app.route("/api/v1/upload", uploadController);
       ```
       Note: NO trailing /* on middleware path (matches both /api/v1/admin and /api/v1/admin/*).
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\src\index.ts`
       Verify: TypeScript compiles with no errors.

### Dependencies

- [ ] 12. Verify @supabase/supabase-js is in `server/package.json` dependencies (already present as 2.117.2).
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server\package.json`
       Verify: `grep -i "@supabase/supabase-js" package.json` returns version line.

- [ ] 13. Backend verification: Build and typecheck server.
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\server`
       Verify: `cd server && bun run typecheck` passes with no errors; `cd server && bun run build` (if build script exists) passes.

---

## Frontend Implementation (Client)

### Services & API Layer

- [ ] 14. Create `client/src/services/admin-projects.service.ts` with CRUD functions.
       Export:
       - `getAdminProjects(page, limit, filters)` - GET /api/v1/admin/projects?...
       - `getAdminProject(id)` - GET /api/v1/admin/projects/:id
       - `createProject(data)` - POST /api/v1/admin/projects
       - `updateProject(id, data)` - PUT /api/v1/admin/projects/:id
       - `deleteProject(id)` - DELETE /api/v1/admin/projects/:id
       - `checkSlugAvailability(slug)` - GET /api/v1/admin/check-slug?slug=...
       
       All use existing api-client functions (apiGet, apiPost, apiPut, apiDelete, apiFetchEnvelope).
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\services\admin-projects.service.ts`
       Verify: TypeScript compiles with no errors.

- [ ] 15. Create `client/src/services/upload.service.ts` with `uploadImage(file)` function.
       Uses `fetch()` directly with FormData (not apiFetch, which doesn't handle multipart).
       Returns public Supabase URL string, throws ApiClientError on failure.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\services\upload.service.ts`
       Verify: TypeScript compiles with no errors.

### React Query Hooks

- [ ] 16. Create `client/src/hooks/queries/use-admin-projects.ts` with query/mutation hooks.
       Export:
       - `useAdminProjects(page, limit, filters)` - useQuery for project list
       - `useAdminProject(id)` - useQuery for single project detail
       - `useCreateProject()` - useMutation, invalidates admin projects cache on success
       - `useUpdateProject()` - useMutation, invalidates admin/public caches (if status="published")
       - `useDeleteProject()` - useMutation, invalidates admin projects cache
       - `useCheckSlugAvailability(slug)` - useQuery with enabled/staleTime logic (HIGH-1 fix)
       
       Cache keys: ['admin', 'projects', ...] for admin list/detail, ['admin', 'check-slug', slug] for availability.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\hooks\queries\use-admin-projects.ts`
       Verify: TypeScript compiles with no errors.

- [ ] 17. Create `client/src/hooks/queries/use-upload.ts` with `useUploadImage()` hook.
       useMutation wrapping uploadImage service, handles onError logging.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\hooks\queries\use-upload.ts`
       Verify: TypeScript compiles with no errors.

### Utilities

- [ ] 18. Create `client/src/lib/slugify.ts` with `slugify(title)` function.
       Converts title to URL-friendly slug (lowercase, replace spaces/special chars with hyphens, trim, remove consecutive hyphens).
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\lib\slugify.ts`
       Verify: TypeScript compiles with no errors.

### UI Form Components

- [ ] 19. Create `client/src/components/ui/Input.tsx` with Text Input component.
       Accepts label, error, placeholder, and standard input props. Styled with Tailwind.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\ui\Input.tsx`
       Verify: TypeScript compiles with no errors.

- [ ] 20. Create `client/src/components/ui/Label.tsx` with Label component.
       Accepts required prop, displays red asterisk if required.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\ui\Label.tsx`
       Verify: TypeScript compiles with no errors.

- [ ] 21. Create `client/src/components/ui/Textarea.tsx` with Textarea component.
       Accepts label, error, placeholder, rows, and standard textarea props.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\ui\Textarea.tsx`
       Verify: TypeScript compiles with no errors.

- [ ] 22. Create `client/src/components/ui/Select.tsx` with Select dropdown component.
       Accepts label, error, options array ({value, label}), and standard select props.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\ui\Select.tsx`
       Verify: TypeScript compiles with no errors.

- [ ] 23. Create `client/src/components/ui/Checkbox.tsx` with Checkbox component.
       Accepts label and standard checkbox props.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\ui\Checkbox.tsx`
       Verify: TypeScript compiles with no errors.

- [ ] 24. Create `client/src/components/ui/FieldError.tsx` with Field Error component.
       Accepts FieldError from React Hook Form, displays in red if present.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\ui\FieldError.tsx`
       Verify: TypeScript compiles with no errors.

- [ ] 25. Create `client/src/components/ui/ConfirmDialog.tsx` with Confirmation Modal.
       Accepts title, description, confirmLabel, cancelLabel, isDangerous, onConfirm, onCancel, isLoading.
       Displays centered modal with Cancel/Confirm buttons, dark theme.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\ui\ConfirmDialog.tsx`
       Verify: TypeScript compiles with no errors.

### Specialized Form Components

- [ ] 26. Create `client/src/components/form/MarkdownEditorField.tsx` with @uiw/react-md-editor.
       Wraps MDEditor with dark theme (data-color-mode="dark"), live preview, form integration.
       Accepts label, value, onChange, error, required.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\form\MarkdownEditorField.tsx`
       Verify: TypeScript compiles with no errors.

- [ ] 27. Create `client/src/components/form/ImageUploadField.tsx` with single image upload.
       Features:
       - Drag-drop and click-to-upload file input
       - Client-side validation (magic bytes check, max 10MB)
       - Shows Spinner while uploading (via useUploadImage hook)
       - Displays preview image with Remove button
       - Shows errors inline
       
       Accepts label, value (url string), onChange, error, required.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\form\ImageUploadField.tsx`
       Verify: TypeScript compiles with no errors.

- [ ] 28. Create `client/src/components/form/GalleryUploadField.tsx` with multiple image upload.
       Features:
       - Max 12 images advisory (server enforces)
       - Drag-drop and multi-file selection
       - Grid preview with delete buttons
       - Reorder support via drag-drop
       - Tracks upload errors per file
       - Shows remaining slots counter
       
       Accepts label, value (url array), onChange, error, required.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\form\GalleryUploadField.tsx`
       Verify: TypeScript compiles with no errors.

- [ ] 29. Create `client/src/components/form/TagInput.tsx` with Tech Stack input.
       Features:
       - Enter or comma to add tags
       - Max 20 tags advisory (server enforces)
       - Delete individual tags via Badge click
       - Prevents duplicates
       
       Accepts label, value (string array), onChange, error, required, maxTags, placeholder.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\form\TagInput.tsx`
       Verify: TypeScript compiles with no errors.

### Main Project Form

- [ ] 30. Create `client/src/components/form/ProjectForm.tsx` with complete project form.
       Features:
       - Auto-slug generation from title on create (calls slugify, only if new project)
       - Slug availability check on blur (HIGH-1 implementation):
         * Check triggers on slug input blur (debounced via useCheckSlugAvailability)
         * Shows spinner while checking
         * Shows ✓ if available, ⚠️ if unavailable (advisory only)
       - Form submission handling:
         * Validates with Zod before submit
         * On 409 ConflictError: display error banner "Slug sudah digunakan"
         * Invalidate ['admin', 'check-slug', slug] query to refresh UI state
         * Keep slug field open for user to retry
       - Loading state during submission
       - Inline field errors
       - All fields: Title, Slug, Summary, Category, Status, Thumbnail, Gallery, Content (Markdown), Tech Stack, URLs (Repo/Demo/Notebook), Featured checkbox
       
       Accepts project (optional for edit mode), onSubmit, isLoading, error, onCancel.
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\components\form\ProjectForm.tsx`
       Verify: TypeScript compiles with no errors.

### Admin Pages

- [ ] 31. Verify `client/src/pages/admin/LoginPage.tsx` is functional.
       Confirm it:
       - Displays login form with username/password
       - Calls useLogin mutation
       - Redirects to /admin on success
       - Shows inline validation errors
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\pages/admin/LoginPage.tsx`
       Verify: File exists and has expected structure; TypeScript compiles.

- [ ] 32. Update `client/src/pages/admin/DashboardPage.tsx` (if new) or create it.
       Features:
       - Projects table with columns: Title, Slug, Category, Status, Updated, Actions
       - Inline Edit button (links to /admin/projects/:id/edit)
       - Inline Delete button (shows ConfirmDialog, calls deleteProject mutation)
       - Create Project button (links to /admin/projects/new)
       - Filters: Status dropdown (all statuses), Category dropdown, Search input
       - Pagination controls (page/limit)
       - Loading states and error handling
       - Uses useAdminProjects hook
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\pages/admin/DashboardPage.tsx`
       Verify: TypeScript compiles with no errors; page renders in browser.

- [ ] 33. Update `client/src/pages/admin/ProjectEditorPage.tsx` (if new) or create it.
       Features:
       - Detects create vs. edit mode based on URL params (no :id = create, :id = edit)
       - On edit: loads project via useAdminProject hook, passes to ProjectForm
       - On create: shows empty ProjectForm
       - Integrates ProjectForm component with handlers:
         * onSubmit: calls useCreateProject or useUpdateProject mutation
         * On success: redirects to /admin
         * On error: displays error inline (handled by ProjectForm)
       - Cancel button: navigates back to /admin
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\pages/admin/ProjectEditorPage.tsx`
       Verify: TypeScript compiles with no errors; page renders in browser.

- [ ] 34. Verify `client/src/router/ProtectedRoute.tsx` is functional.
       Confirm it:
       - Calls useMe() to check authentication
       - Shows Spinner while loading
       - Redirects to /admin/login if unauthenticated or error
       - Renders Outlet (child routes) if authenticated
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src/router/ProtectedRoute.tsx`
       Verify: File exists and has expected structure; TypeScript compiles.

- [ ] 35. Verify `client/src/router/index.tsx` has admin routes properly defined.
       Confirm:
       - /admin/login route is NOT behind ProtectedRoute
       - /admin/* routes ARE behind ProtectedRoute
       - All admin routes lazy-load their page components
       - AdminLayout wraps dashboard and editor pages (if layout exists)
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\src\router\index.tsx`
       Verify: File exists, routes structure verified; TypeScript compiles.

### Dependencies

- [ ] 36. Verify @uiw/react-md-editor is in `client/package.json` dependencies (check if already present).
       If not present, it should be added (already present as ^4.1.2).
       
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client\package.json`
       Verify: `grep -i "@uiw/react-md-editor" package.json` returns version line.

- [ ] 37. Frontend verification: Build and typecheck client.
       Files: `d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms\client`
       Verify: `cd client && bun run typecheck` passes with no errors; `cd client && bun run build` produces dist bundle.

---

## Integration & End-to-End Verification

- [ ] 38. Full backend build verification.
       Runs TypeScript check, starts server in dev mode briefly to confirm no runtime errors on startup.
       
       Verify: `cd server && bun run typecheck` and `cd server && bun run dev` (Ctrl+C after 3 seconds) shows no errors.

- [ ] 39. Full frontend build verification.
       Runs TypeScript check, builds Vite bundle for production.
       
       Verify: `cd client && bun run typecheck` and `cd client && bun run build` completes successfully, creates dist/ folder.

- [ ] 40. Manual smoke test: E2E admin flow.
       **Steps:**
       1. Start server: `cd server && bun run dev` (in one terminal)
       2. Start client: `cd client && bun run dev` (in another terminal)
       3. Open browser to http://localhost:5173/admin/login
       4. Log in with admin credentials (from DB seed)
       5. Verify redirects to http://localhost:5173/admin (dashboard)
       6. Click "Create Project" button → navigates to /admin/projects/new
       7. Fill form:
          - Title: "Test Project"
          - (Slug auto-generates to "test-project")
          - Slug field: blur to trigger availability check → shows ✓ (available)
          - Summary: "This is a test project"
          - Content: Type some markdown (e.g., "# Hello")
          - Category: Select "fullstack"
          - Status: Keep "draft"
          - Click "Create Project"
       8. Form submits → API returns 201 → redirects to /admin
       9. Table shows new project "Test Project"
       10. Click Edit on the project → /admin/projects/:id/edit loads form with data
       11. Change title to "Updated Project" → slug changes (can manually edit)
       12. Click "Update Project" → API returns 200 → redirects to /admin
       13. Table shows updated title
       14. Click Delete on the project → ConfirmDialog appears
       15. Confirm delete → API returns 200 → project removed from table
       16. Dashboard now empty or shows other projects
       
       Verify: All steps complete without errors; network requests shown in browser DevTools.

- [ ] 41. Git commit: All implementation complete.
       Commit locally on branch `feat/issue-5-admin-cms` with message summarizing all components added.
       
       Verify: `git -C d:\File Defir\Projects\My Portfolio\.worktrees\issue-5-admin-cms log --oneline` shows new commit.

---

## HIGH Design Fixes Applied

### HIGH-1: Slug Availability Check UX (Implemented in Step 16 & 30)
- **Trigger:** Slug field blur (not on type) via `useCheckSlugAvailability` hook with enabled/staleTime logic
- **Loading:** Spinner shown next to slug input while checking
- **Available:** Green checkmark (✓) displayed
- **Unavailable:** Warning icon (⚠️) with text "Slug sudah digunakan" (advisory only, does NOT prevent submit)
- **Race condition handling:** On 409 error from server, error banner displays at top of form, slug check query is invalidated (`queryClient.invalidateQueries({queryKey: ['admin','check-slug', slug]})`) to clear stale UI state, form remains open for user to retry

### HIGH-2: Route Registration with Correct Middleware Pattern (Implemented in Step 11)
```typescript
app.use("/api/v1/admin*", requireAuth);     // Note: NO trailing /*
app.route("/api/v1/admin", adminController);

app.use("/api/v1/upload*", requireAuth);    // Note: NO trailing /*
app.route("/api/v1/upload", uploadController);
```
This ensures auth middleware is applied to both exact routes and subroutes (e.g., /api/v1/admin/projects/:id).

---

## Summary

This plan sequentially implements the Admin CMS feature across:
- **Backend (13 steps):** Utilities, models, schemas, controllers, routing
- **Frontend (27 steps):** Services, hooks, utilities, UI components, form, pages
- **Verification (2 steps):** Build checks and manual E2E smoke test
- **Finalization (1 step):** Git commit

All steps are ordered by dependency (utilities before models, models before controllers, services before hooks, hooks before pages). Each step verifies independently via TypeScript compilation and runtime testing. The implementation embeds both HIGH design review fixes verbatim and follows existing codebase patterns (API client, React Query, Tailwind styling, Hono routing, Zod validation).

**Total estimated effort:** 6-8 hours for an experienced full-stack developer.
