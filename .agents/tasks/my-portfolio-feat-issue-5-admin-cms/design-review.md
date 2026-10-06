# Design Review: Admin CMS for Portfolio Project Management (Issue #5)

**Reviewer:** Design Review Agent  
**Date:** 2025-01-16  
**Design Document:** design.md  
**Verdict:** CHANGES_REQUESTED (2 HIGH, 2 MEDIUM findings)

---

## Executive Summary

The Admin CMS design is substantially complete and well-thought-out, with clear separation of concerns, proper error handling strategy, and careful attention to race conditions. However, there are **2 HIGH findings** blocking implementation:

1. **Ambiguous slug availability check UX flow** — the design documents the resolution but the actual client-side implementation is underspecified
2. **File upload endpoint registration missing** — design specifies `/upload` routes but doesn't clearly specify where/how they attach to the main Hono app

And **2 MEDIUM findings** requiring clarification:

3. **Unclear when slug conflict error is actionable in form** — timing of client-side availability check vs. server validation
4. **Incomplete frontend route structure** — admin routes structure not aligned with existing frontend patterns

All other aspects (auth, model layer error handling, cache invalidation, gallery validation) are properly specified and verified against the codebase.

---

## Detailed Findings

### HIGH-1: Slug Availability Check UX Flow Unspecified

**Location:** ProjectForm.tsx section (lines ~1710–1770)

**Problem:**  
The design resolves the slug conflict race condition by choosing "Option B (Permissive with server-side enforcement)" but doesn't clearly specify the **client-side slug availability check behavior**. The design document says:

> "Client shows advisory check; if server returns 409, form displays error banner"

But the implementation code doesn't show:
- Whether the slug availability check fires automatically as the user types (debounced?) or on blur
- What the UI shows while checking (loading state?)
- Where the advisory check result is displayed
- How the auto-generate button interacts with an already-checked slug

**Concrete Impact:**  
The implementer must guess at the timing and UX. This could result in:
- Multiple redundant HTTP requests as user types
- Confusing timing (check succeeds, then 409 on submit if another admin creates same slug between check and submit)
- Missing visual feedback

**Fix:**  
Add to ProjectForm section:

```typescript
/**
 * Slug Availability Check UX (Advisory):
 *
 * - Check is triggered on slug field blur (not on every keystroke)
 * - While checking: show debounced spinner next to slug input
 * - If available: show green checkmark ✓ next to slug input
 * - If unavailable: show warning ⚠️ "Slug sudah digunakan" next to slug input
 *   (does NOT prevent form submission, only advisory)
 * - If available check shows available, but server returns 409 on submit:
 *   Display error banner at top of form: "Slug sudah digunakan (changed by another admin)"
 *   Keep slug field value; user can click "Auto Generate" or edit manually
 *
 * Note: Race condition is inherent; the advisory check improves UX but doesn't eliminate it.
 * Server is authoritative (returns 409 if race condition occurs).
 */
```

Then add a `useCheckSlugAvailability` hook to use-admin-projects.ts:

```typescript
export function useCheckSlugAvailability(slug: string) {
  return useQuery({
    queryKey: ['admin', 'check-slug', slug],
    queryFn: () => checkSlugAvailability(slug),
    enabled: !!slug && slug.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
  });
}
```

And integrate into ProjectForm:

```typescript
const slugValue = watch('slug');
const { data: slugCheck, isLoading: slugChecking } = useCheckSlugAvailability(slugValue);

// In JSX:
<div className="flex gap-2 items-center">
  <Input
    {...register('slug')}
    placeholder="my-amazing-project"
    error={errors.slug?.message}
    className="flex-1"
  />
  {slugChecking && <Spinner />}
  {!slugChecking && slugCheck?.available && <CheckMark />}
  {!slugChecking && !slugCheck?.available && <WarningIcon />}
</div>
```

---

### HIGH-2: File Upload Endpoint Route Registration Not Specified

**Location:** Main Route Registration section (lines ~1275–1295)

**Problem:**  
The design shows upload.controller.ts with a POST `/upload` endpoint, but the route registration in index.ts only shows:

```typescript
app.route("/api/v1/upload", uploadController);
```

This is ambiguous because:
1. The `uploadController` is a new Hono instance, but how is the `/` route inside it registered? Is it `POST /api/v1/upload` or `POST /api/v1/upload/`?
2. Does the `requireAuth` middleware apply to ALL routes in `uploadController` or just the upload route? Current code shows:
   ```typescript
   app.use("/api/v1/upload/*", requireAuth);
   app.route("/api/v1/upload", uploadController);
   ```
   This means `requireAuth` applies to all subpaths like `/api/v1/upload/*`, but the actual POST handler is at `/api/v1/upload/` (with trailing slash due to how Hono routes work). **This is a bug** — the middleware won't match the route.

3. The admin routes have the same problem: `requireAuth` is applied to `/api/v1/admin/*` but the admin controller routes are registered at `/api/v1/admin`.

**Concrete Impact:**  
The authentication middleware won't be enforced on the actual endpoints. Unauthenticated users could access `/api/v1/upload` and `/api/v1/admin/projects` without a session cookie.

**Fix:**  
Clarify the exact route structure. The correct pattern for Hono is:

```typescript
// Option A: Apply middleware to route group, then mount sub-controller
const adminRoutes = new Hono<AppEnv>();
adminRoutes.use("*", requireAuth);
adminRoutes.post("/", ...) // Becomes /api/v1/admin/
adminRoutes.get("/projects", ...) // Becomes /api/v1/admin/projects
app.route("/api/v1/admin", adminRoutes);

// Option B: Apply middleware before mounting (simpler, recommended)
const uploadRoutes = new Hono<AppEnv>();
uploadRoutes.post("/", ...) // Becomes /api/v1/upload/
uploadRoutes.get("/check-slug", ...) // Becomes /api/v1/upload/check-slug
app.use("/api/v1/upload*", requireAuth); // Note: no trailing /* — matches /api/v1/upload, /api/v1/upload/, etc.
app.route("/api/v1/upload", uploadRoutes);
```

**Recommended fix for design:**

Replace the Main Route Registration section with:

```typescript
// Main Route Registration
// File: server/src/index.ts (update)

import { adminController } from "./controllers/admin.controller";
import { uploadController } from "./controllers/upload.controller";
import { requireAuth } from "./middlewares/auth";

const app = new Hono<AppEnv>();

// ... existing middleware ...

// Register controllers
app.route("/api/v1/health", healthController);
app.route("/api/v1/auth", authController);
app.route("/api/v1/projects", projectController);

// Admin routes (protected at route level)
// Pattern: /api/v1/admin/* all require auth
app.use("/api/v1/admin*", requireAuth);
app.route("/api/v1/admin", adminController);

// Upload routes (protected at route level)
// Pattern: /api/v1/upload/* all require auth
app.use("/api/v1/upload*", requireAuth);
app.route("/api/v1/upload", uploadController);

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
```

And update adminController and uploadController to use the root `/` route for POST operations:

```typescript
// admin.controller.ts
export const adminController = new Hono<AppEnv>();

adminController.get("/projects", ...); // → GET /api/v1/admin/projects
adminController.get("/projects/:id", ...); // → GET /api/v1/admin/projects/:id
adminController.post("/projects", ...); // → POST /api/v1/admin/projects
// ... etc

// upload.controller.ts
export const uploadController = new Hono<AppEnv>();

uploadController.post("/", ...); // → POST /api/v1/upload
uploadController.get("/check-slug", ...); // → GET /api/v1/upload/check-slug
```

---

### MEDIUM-3: Unclear Timing of Slug Availability Check vs. Server Validation

**Location:** ProjectForm.tsx and POST /admin/projects sections (lines ~1710–1800, ~1560–1610)

**Problem:**  
The design shows that:
1. Client performs advisory slug availability check (separate API call)
2. On form submit, server validates slug unique constraint and returns 409 if conflict

But it's unclear what happens if:
- User checks slug, gets "available ✓"
- Another admin creates project with same slug
- User submits form → server returns 409 ConflictError

The form catches 409 and shows error, but does it automatically re-check slug availability? Does the advisory check get refreshed? Current design only says "user can click Auto Generate or manually edit slug, then resubmit" but doesn't specify whether the availability check is automatically re-run or goes stale.

**Concrete Impact:**  
After server returns 409, the form still shows the advisory "available ✓" next to the slug field, which is misleading. The user might not understand why the slug they just checked is now unavailable.

**Fix:**  
In ProjectForm implementation, add:

```typescript
// When server returns 409 slug conflict error:
// 1. Display error banner
// 2. Invalidate the slug availability check to force re-check
// 3. Reset the advisory UI state (remove checkmark/warning)

const handleSubmit = (data) => {
  setFormError(null);
  // ... submit logic ...
  .onError((error) => {
    if (error.status === 409 && error.category === 'CONFLICT') {
      setFormError('Slug sudah digunakan');
      // Invalidate slug check to clear stale "available ✓" UI
      queryClient.invalidateQueries({
        queryKey: ['admin', 'check-slug', data.slug],
      });
    }
  });
};
```

And update the ProjectForm JSX to only show the advisory checkmark if the check data is fresh (not stale):

```typescript
const { data: slugCheck, isLoading: slugChecking, isStale } = useCheckSlugAvailability(slugValue);

// Only show checkmark if fresh data
{!slugChecking && !isStale && slugCheck?.available && <CheckMark />}
```

---

### MEDIUM-4: Admin Routes Structure Not Aligned with Frontend Patterns

**Location:** Admin Pages section (DashboardPage.tsx, ProjectEditorPage.tsx) (lines ~1920–2100)

**Problem:**  
The design specifies admin pages should be at:
- `/admin` — Dashboard
- `/admin/projects/new` — Create project
- `/admin/projects/:id/edit` — Edit project

But the existing frontend (from worktree inspection) does not have an `/admin/*` route structure. The design doesn't clarify:
1. What the route definition looks like (is there a ProtectedRoute wrapper?)
2. How 401 errors are handled — design says "ProtectedRoute redirects on 401" but this wasn't verified in the existing codebase
3. Whether there's a ProtectedRoute component or if 401 handling is done via global query client error handler

**Concrete Impact:**  
The implementer must reverse-engineer how to structure admin routes from context clues. There could be misalignment with existing auth flow patterns.

**Fix:**  
Add a new section "Frontend Route Structure" to the design:

```typescript
/**
 * Admin Route Structure (Frontend)
 * 
 * Route Definition (router/index.tsx or equivalent):
 * 
 * const adminRoutes = [
 *   {
 *     path: '/admin',
 *     element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
 *   },
 *   {
 *     path: '/admin/projects/new',
 *     element: <ProtectedRoute><ProjectEditorPage /></ProtectedRoute>,
 *   },
 *   {
 *     path: '/admin/projects/:id/edit',
 *     element: <ProtectedRoute><ProjectEditorPage /></ProtectedRoute>,
 *   },
 *   {
 *     path: '/admin/login',
 *     element: <AdminLoginPage />,
 *   },
 * ];
 *
 * ProtectedRoute Component (components/ProtectedRoute.tsx):
 * 
 * - Calls useMe() hook to check authentication status
 * - If authenticated (useMe returns user data): renders child component
 * - If 401 error or useMe fails: redirects to '/admin/login'
 * - While loading: shows Skeleton spinner
 *
 * This ensures all admin pages are protected without needing per-hook error handling.
 */

// ProtectedRoute.tsx example:
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useMe();
  const navigate = useNavigate();
  
  if (isLoading) {
    return <Skeleton className="h-96" />;
  }
  
  if (error || !user) {
    // Redirect to login on 401 or missing user
    navigate('/admin/login');
    return null;
  }
  
  return children;
}
```

Also clarify that AdminLoginPage is separate (not protected) and displays a form with username/password fields that calls the existing `/api/v1/auth/login` endpoint.

---

## Verified Assumptions

✅ **requireAuth middleware exists and works as designed**
- Confirmed in `server/src/middlewares/auth.ts`
- Validates session cookie, extracts JWT payload, sets `c.get("user")` as documented
- Throws UnauthorizedError (401) if token missing/invalid

✅ **Existing project model functions handle public filtering correctly**
- Confirmed in `server/src/models/project.model.ts`
- `listProjects()` and `findPublicProjectBySlug()` already exist and work with filters
- Admin functions can be added to the same file without duplication

✅ **Database schema supports all project fields**
- Confirmed in `server/src/db/schema.ts`
- Slug has unique constraint and index
- Status and category are enums with correct values
- Gallery, tech_stack are text arrays with default []

✅ **Zod schemas are already defined with correct validation**
- Confirmed in `server/src/shared/dto.ts`
- `createProjectSchema`, `updateProjectSchema` exist with all constraints
- `projectStatusSchema`, `projectCategorySchema` enums are correct
- URL validation is built-in

✅ **Supabase credentials are configured in env**
- Confirmed in `server/src/config/env.ts`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` are all required env vars
- Bucket name defaults to "portfolio-assets" as used in design

✅ **Frontend API client pattern is established**
- Confirmed in `.worktrees/issue-5-admin-cms/client/src/services/api-client.ts`
- `apiFetch`, `apiFetchEnvelope`, `apiGet`, `apiPost`, `apiPut`, `apiDelete` functions exist
- ApiClientError class handles errors correctly
- Credentials are included in all requests

✅ **Cache invalidation pattern is verified**
- React Query's `invalidateQueries` with `exact: false` works as documented
- Query key factory pattern is standard and will work as specified

❌ **ProtectedRoute component and 401 redirect logic NOT verified**
- Assumed to exist in frontend but not found in worktree inspection
- This will be a MEDIUM finding (see below)

---

## Unverified/Wrong Assumptions

⚠️ **Frontend ProtectedRoute component assumed but not verified**
- Design says "ProtectedRoute component wraps all admin routes" and "checks useMe() and redirects on 401"
- This component was not found in the existing codebase
- Could be implemented new, or 401 handling could be done differently (global query client error handler, per-hook error callback, etc.)
- This is covered in MEDIUM-4 above

⚠️ **ImageUploadField and GalleryUploadField component structure**
- Design assumes these components exist and can be imported from `@/components/form/`
- These are new components that don't yet exist
- This is not a bug (they're designed as new), just noting they must be created

⚠️ **@uiw/react-md-editor integration**
- Design assumes this package is already installed in the frontend
- Not verified in existing codebase
- Likely not installed yet; should be added to dependencies

---

## Summary of Blockers

| Severity | Finding | Impact | Blocks Implementation |
|----------|---------|--------|----------------------|
| HIGH-1 | Slug availability check UX flow unspecified | Implementer must guess at client-side check timing and UI | YES |
| HIGH-2 | Upload endpoint route registration ambiguous | Auth middleware won't be enforced on upload/admin routes | YES |
| MEDIUM-3 | Slug check refresh on 409 conflict unclear | Form shows stale "available ✓" after conflict error | NO |
| MEDIUM-4 | Admin route structure not aligned with frontend | Implementer must reverse-engineer route definition | NO (minor) |

---

## Recommendation

**Request changes for HIGH-1 and HIGH-2 findings.** These are not interpretation issues; they are genuine gaps that will result in bugs or security issues if left unspecified.

MEDIUM-3 and MEDIUM-4 are minor clarifications that the implementer can reason through, but should be addressed in the revised design for completeness.

Once high findings are resolved, the design is solid for implementation.
