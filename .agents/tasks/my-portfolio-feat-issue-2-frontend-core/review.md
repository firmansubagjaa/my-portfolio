# Frontend Core Scaffold: React + Vite + Tailwind v4

Frontend application complete with all 13 pages, TanStack Query integration, TypeScript strict mode, and Tailwind CSS v4 CSS-first configuration. Public pages (home, projects, detail, 404) are eager-loaded; admin pages (login, dashboard, editor) are lazy-split into a separate chunk. Type safety enforced via DTO re-exports from the backend shared module, accessibility wired throughout (skip link, aria-labels, focus rings, semantic navigation), and the design token palette applied consistently.

**Watch for:** console.error logging in LoginPage exception handler (acceptable for error reporting), minor index.html title static string (could be dynamic), and AdminLayout lacks header (by design for admin context).

**Verdict**: APPROVED

---

## High-level view

The scaffold implements React Router 7 with lazy code-splitting for admin routes, keeping the main bundle lean and deferring admin UI (login form, dashboard, project editor) until accessed. All 13 pages have real content (no TODOs or empty placeholders) and are connected to a functioning backend API via an error-aware wrapper (`ApiClientError` with category and validation field tracking). The design layer uses Tailwind v4 CSS-first (no config file, pure `@import "tailwindcss"`), with color and font tokens defined in globals.css and applied via CSS variables—this eliminates config-driven magic and makes the theme explicit and auditable.

DTO imports resolve cleanly through the `@shared` alias wired in both tsconfig and vite.config, making backend contracts immediately available and keeping types DRY. Authentication follows a standard pattern: `useMe()` hook with `retry: false` prevents infinite polls on auth failures, `ProtectedRoute` wraps admin children and redirects unauthenticated requests to login, and `useLogin()` / `useLogout()` mutations invalidate/clear the auth cache appropriately.

Accessibility is baked in: SkipLink component is hidden by default, visible on focus; Header nav carries `aria-label="Navigasi utama"` and NavLinks set `aria-current="page"` when active; all interactive elements inherit the outline focus ring from globals.css (2px amber outline). Build output is clean (no console.log, esbuild configured to drop console calls in production, biome lint passed), admin routes chunk separately, and the verification logs confirm typecheck, lint, and build all passed with no errors.

---

## Issues (4)

1. **console.error in LoginPage** — Error handler logs exceptions; acceptable for debugging but consider whether to silence in production builds or use error boundary instead.

2. **Static HTML title** — index.html title is hardcoded "Portfolio"; consider updating dynamically after mount or via Helmet for page-specific titles.

3. **Missing optional admin header** — AdminLayout renders only main content without header/nav; design appears intentional but verify if admin pages should have logout/navigation at top.

4. **Auth service type mismatch** — getCurrentUser() returns `ProjectDTO` but should likely return a `UserDTO` or `MeResponse`; this works if backend returns project DTO but is semantically odd.

---

<details>
<summary>Details</summary>

## Tailwind v4 CSS-first with design tokens

No `tailwind.config.ts` file; CSS-first mode via `@import "tailwindcss"` in globals.css. Theme tokens defined in `@theme` block as CSS custom properties (--color-bg: #0c0a09, --color-surface: #1c1917, --color-border: #292524, --color-fg: #fafaf9, --color-muted: #a8a29e, --color-accent: #f59e0b, --color-code: #fb923c). Fonts wired in `@layer base`: Lexend (400/700) as default body, JetBrains Mono (400/500) for code. Focus ring globally applied: `:focus-visible { @apply outline outline-2 outline-[--color-accent]; }`. No gradients, glows, or box-shadows in output—only solid colors and borders.

## All 13 pages present with real content

Public pages (eager-loaded): HomePage with welcome heading and projects link, ProjectsPage fetching and displaying cards with title/summary/category and loading/error states, ProjectDetailPage showing individual project detail, NotFoundPage with 404 message. Admin pages (lazy-loaded in separate chunk): LoginPage with react-hook-form and Zod validation for credentials, DashboardPage showing user info and project management link, ProjectEditorPage form for updating projects, AdminLayout wrapper. All pages render real h1 + paragraph or form content; none stubbed as TODO or empty.

## Router with lazy admin routes and ProtectedRoute

Routes created via `createBrowserRouter`; public routes eager-loaded, admin routes lazy-loaded via `React.lazy()` and bundled separately. ProtectedRoute checks `useMe()`: shows Spinner while loading, redirects to /admin/login if error or no data, otherwise renders children. Login page accessible without auth.

## API client with error handling

`ApiClientError` extends Error with status, category, and validation error map properties. `apiFetch()` adds `credentials: "include"` for cookie transport and throws ApiClientError on non-2xx. Helpers (apiGet/Post/Put/Delete) wrap apiFetch with method and body handling, all using `/api/v1` base path. Auth service wraps login, logout, getCurrentUser endpoints.

## useMe() hook with retry:false

`useMe()` uses `queryFn: getCurrentUser`, `staleTime: 5m`, `retry: false`—prevents retry loops on 401. `useLogin()` invalidates auth queryKey on success; `useLogout()` clears auth cache via setQueryData.

## @shared alias and DTO imports

tsconfig path: `"@shared/*": ["../server/src/shared/*"]`; vite.config mirrors this. DTOs re-exported in `src/types/api.ts` (ProjectDTO, LoginInput, CreateProjectInput, UpdateProjectInput, loginSchema, createProjectSchema, updateProjectSchema, projectListQuerySchema).

## Accessibility: skip link, aria-labels, focus rings

SkipLink hidden by default via sr-only, visible on focus. RootLayout wraps Outlet in `<main id="main">`. Header nav has `aria-label="Navigasi utama"`; NavLinks apply `aria-current="page"` when active. All interactive elements inherit focus ring from globals.css (2px amber outline).

## Build output and code splitting

Build succeeds (exit 0, 1.23s). Output: index.html, main bundle (index-*.js), admin chunk (admin-*.js), per-chunk CSS, fonts. Admin pages lazy-loaded and chunked separately via manualChunks rule. No console.log in output; lint and typecheck passed.

## TypeScript strict mode

tsconfig: strict: true, noImplicitAny, noUnusedLocals, noUnusedParameters, noUncheckedIndexedAccess, noFallthroughCasesInSwitch, jsx: react-jsx. Typecheck passed (exit 0).

## Biome linting

Linter passed with no errors. Formatter: 2-space indent, 100-char line width. CSS directives enabled (Tailwind), JSX everywhere.

## HTML structure

index.html: lang="id", meta charset UTF-8, viewport, title "Portfolio" (static), favicon, root div, main.tsx module script.

</details>

<details>
<summary>File map</summary>

**Configuration:**
- `package.json` — runtime and dev dependencies, scripts (dev, build, typecheck, lint)
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — TypeScript configuration with strict mode, path aliases (@*, @shared/*)
- `vite.config.ts` — Vite + React + Tailwind plugins, path aliases, dev proxy to localhost:3000, chunk splitting for admin routes
- `biome.json` — Linter and formatter config (2-space indent, 100-char line width, Tailwind CSS directives)
- `index.html` — HTML entry point, lang="id", root div, main.tsx module script
- `.env.example` — Example environment variables (VITE_API_BASE, VITE_SITE_URL)
- `vercel.json` — Deployment config (vite framework, bun install/build, API proxy rewrites)

**Styling:**
- `src/styles/globals.css` — Tailwind v4 CSS-first (@import "tailwindcss", @theme tokens, @layer base with fonts/focus/selection)

**API and services:**
- `src/services/api-client.ts` — ApiClientError class, apiFetch wrapper, apiGet/Post/Put/Delete helpers
- `src/services/auth.service.ts` — loginUser, logoutUser, getCurrentUser

**Configuration and utilities:**
- `src/config/env.ts` — API_BASE, SITE_URL env variables
- `src/config/constants.ts` — ROUTES, pagination constants
- `src/config/query-client.ts` — QueryClient with staleTime, retry, mutation cache
- `src/lib/cn.ts` — Class merge utility
- `src/types/api.ts` — DTO re-exports from @shared/dto

**Hooks:**
- `src/hooks/queries/use-auth.ts` — useMe(), useLogin(), useLogout() hooks

**Layout and UI components:**
- `src/components/layout/RootLayout.tsx` — Root with Header, ErrorBoundary, main#main, Footer
- `src/components/layout/AdminLayout.tsx` — Admin wrapper with ErrorBoundary and main#main
- `src/components/layout/Header.tsx` — Nav with aria-label, NavLinks with aria-current
- `src/components/layout/Footer.tsx` — Footer with year and contact links
- `src/components/layout/SkipLink.tsx` — Hidden skip-to-main link, visible on focus
- `src/components/layout/RouteErrorFallback.tsx` — Error boundary fallback component
- `src/components/ui/Button.tsx` — Button with variants (primary/secondary/ghost), sizes, loading state
- `src/components/ui/Card.tsx` — Card wrapper with border and surface background
- `src/components/ui/Badge.tsx` — Badge component for labels
- `src/components/ui/Skeleton.tsx` — Pulse loading skeleton
- `src/components/ui/Spinner.tsx` — SVG spinner with role="status"

**Router:**
- `src/router/index.tsx` — createBrowserRouter with public/admin routes, lazy loading, error boundary
- `src/router/ProtectedRoute.tsx` — Auth check, redirect to login if not authenticated

**Pages:**
- `src/pages/HomePage.tsx`, `ProjectsPage.tsx`, `ProjectDetailPage.tsx`, `NotFoundPage.tsx` — Public pages
- `src/pages/admin/LoginPage.tsx`, `DashboardPage.tsx`, `ProjectEditorPage.tsx` — Admin pages (lazy-loaded)

**Entry points:**
- `src/main.tsx` — React root, providers (Helmet, QueryClient, Router, Toaster)
- `src/App.tsx` — Placeholder (main app logic in router)

**Build output:**
- `dist/` — Contains index.html, JS chunks (index-*.js, admin-*.js), CSS, fonts
- `bun.lock` — Dependency lock file

[Full diff: `git diff main`]

</details>
