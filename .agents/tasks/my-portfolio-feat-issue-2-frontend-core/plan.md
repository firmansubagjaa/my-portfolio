# Implementation Plan: Frontend Core Setup (React + Vite + Bun)

## Overview
Scaffold a complete frontend application in `/client` folder with React + Vite, Tailwind CSS v4 (CSS-first), TypeScript strict mode, and full integration with the backend API. The client imports DTOs from `../server/src/shared/dto.ts` via `@shared` alias. All 13 pages are implemented with temporary valid content (no TODOs or empty placeholders). The setup includes TanStack Query for state management, React Router for navigation, and accessibility-first components.

**Worktree location:** `d:\File Defir\Projects\My Portfolio\.worktrees\feat-issue-2-frontend-core/client`
**Server location (for imports):** `d:\File Defir\Projects\My Portfolio\.worktrees\feat-issue-2-frontend-core/server`

---

## 1. Install Dependencies and Initialize Structure

- [ ] **1.1 Install runtime and dev dependencies with Bun**
  - Navigate to `client` directory and run:
    ```bash
    cd client
    bun add --exact react@19.0.0-rc-66f6d15c-20241106 react-dom@19.0.0-rc-66f6d15c-20241106 react-router@7.13.0 @tanstack/react-query@5.60.2 react-hook-form@7.54.2 @hookform/resolvers@3.4.2 zod@3.23.8 motion@11.15.0 sonner@1.7.1 react-markdown@9.0.1 remark-gfm@4.0.1 shiki@1.23.0 react-helmet-async@2.1.3 react-error-boundary@4.1.12 @uiw/react-md-editor@4.1.4 @fontsource/lexend@5.1.0 @fontsource/jetbrains-mono@5.1.0
    bun add --exact --dev tailwindcss@4.0.0 @tailwindcss/vite@4.0.0 @tailwindcss/typography@0.5.15 @biomejs/biome@2.5.15 @types/node@22.10.5 @types/react@19.0.8 @types/react-dom@19.0.4 typescript@5.7.2 vite@6.1.0 @vitejs/plugin-react@4.3.4
    ```
  - Create base directory structure:
    - `public/` (for favicon and static assets)
    - `src/` (main source directory)
    - `src/components/`, `src/pages/`, `src/router/`, `src/services/`, `src/styles/`, `src/config/`, `src/hooks/`, `src/hooks/queries/`, `src/lib/`, `src/types/`
  - **Files created:** `bun.lock` (auto-generated), package.json with exact versions
  - **Verify:** `bun install` completes without errors; `node_modules` exists with all dependencies

- [ ] **1.2 Create favicon and public assets**
  - Create `public/favicon.ico` (32x32 PNG icon, embedded as base64 data URI in HTML)
  - **Files:** `public/favicon.ico`
  - **Verify:** File exists and is a valid ICO format; `ls public/` shows favicon.ico

---

## 2. Configuration Files (TypeScript, Vite, Tailwind, Biome)

- [ ] **2.1 Create tsconfig.json (root) and tsconfig.app.json**
  - `tsconfig.json` extends nothing, sets `compilerOptions.types` to `["vite/client"]`
  - `tsconfig.app.json`:
    - `target: "ESNext"`, `module: "ESNext"`, `lib: ["ESNext", "DOM", "DOM.Iterable"]`
    - `moduleResolution: "bundler"`, `verbatimModuleSyntax: true`
    - `strict: true`, all unsafe checks enabled (noImplicitAny, noUnusedLocals, noUnusedParameters, noUncheckedIndexedAccess, noFallthroughCasesInSwitch)
    - `jsx: "react-jsx"`
    - `baseUrl: "."`, `paths: { "@/*": ["src/*"], "@shared/*": ["../server/src/shared/*"], "zod": ["node_modules/zod"] }`
    - `include: ["src", "../server/src/shared"]`, `exclude: ["node_modules", "dist"]`
  - `tsconfig.node.json` for build tooling:
    - `target: "ES2020"`, `module: "ESNext"`, `moduleResolution: "bundler"`, `strict: true`
    - `paths: { "@/*": ["src/*"] }`
    - `include: ["vite.config.ts"]`
  - **Files:** `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
  - **Verify:** `bun run typecheck` passes (tsc --noEmit uses tsconfig.app.json)

- [ ] **2.2 Create vite.config.ts**
  - Import and use `react()` plugin from `@vitejs/plugin-react`
  - Import and use `@tailwindcss/vite` plugin
  - Set `resolve.alias`: `@ -> src`, `@shared -> ../server/src/shared`
  - Set `resolve.dedupe: ["zod", "react", "react-dom"]`
  - Configure `server.proxy` for dev:
    - `/api/v1` → `http://localhost:3000` (backend dev server)
  - Configure `build.rollupOptions.output` to split chunks:
    - Default chunk size warning: 500 KiB
    - Create separate chunks for admin routes (lazy code-split)
  - Configure `esbuild.drop: ["console"]` in production build
  - Set `build.minify: "esbuild"`
  - **Files:** `vite.config.ts`
  - **Verify:** `bun run build` succeeds; generated `dist/` folder has separate chunks for admin routes

- [ ] **2.3 Create biome.json**
  - Match server conventions: indent 2 spaces, line width 100
  - `linter.rules`:
    - `style: { singleQuote: true }`
    - `a11y: { all: true }` (enforce accessibility)
    - `suspicious: { noExplicitAny: true }`
    - Allow only `console.error` and `console.warn` (deny `console.log`)
  - `formatter: { indentWidth: 2, lineWidth: 100, quoteStyle: "single" }`
  - `javascript: { parser: { jsx: true } }`
  - **Files:** `biome.json`
  - **Verify:** `bun run lint` passes; `biome check .` shows no errors

---

## 3. Styling (Tailwind CSS v4 CSS-First + Global Styles)

- [ ] **3.1 Create src/styles/globals.css**
  - Import Lexend (400, 700 weights) and JetBrains Mono (400, 500 weights) from @fontsource
  - `@import "tailwindcss"` (CSS-first, v4 syntax)
  - `@plugin "@tailwindcss/typography"` for prose styling
  - `@theme` block with custom color tokens:
    - `--color-bg: #0C0A09` (dark background)
    - `--color-surface: #1C1917` (surface layer)
    - `--color-border: #292524` (border color)
    - `--color-fg: #FAFAF9` (foreground/text)
    - `--color-muted: #A8A29E` (muted text)
    - `--color-accent: #F59E0B` (accent)
    - `--color-code: #FB923C` (code highlighting)
  - `@layer base`:
    - Set dark mode as default: `:root { @apply dark; }`
    - Global body font: Lexend, sans-serif
    - Code font: `code { font-family: "JetBrains Mono", monospace; }`
    - Selection styles: `::selection { @apply bg-accent/20 text-fg; }`
    - Focus ring: `:focus-visible { @apply outline outline-2 outline-accent; }`
    - Prose overrides: `.prose { @apply dark:text-fg; --tw-prose-body: theme(colors.muted); }`
  - **Files:** `src/styles/globals.css`
  - **Verify:** Import in `main.tsx`; visual inspection in dev server shows correct colors/fonts

---

## 4. API Client and Error Handling

- [ ] **4.1 Create src/services/api-client.ts**
  - Define `ApiClientError` class extending `Error`:
    - Properties: `status: number`, `category: ApiErrorCategory`, `errors?: Record<string, string[]>`
    - Constructor parses ApiError responses
  - Export `apiFetch(url, options)`: wrapper around native fetch
    - Add `credentials: "include"` to send cookies with requests
    - Parse responses as JSON
    - Throw `ApiClientError` on non-2xx responses
    - Re-export response types: `ApiSuccess<T>`, `ApiError`, `PaginationMeta` from `@shared/dto`
  - Export helper functions:
    - `apiGet<T>(url: string, options?): Promise<T>`
    - `apiPost<T>(url: string, data: unknown, options?): Promise<T>`
    - `apiPut<T>(url: string, data: unknown, options?): Promise<T>`
    - `apiDelete<T>(url: string, options?): Promise<T>`
  - All helpers use `apiFetch` and respect API base path `/api/v1`
  - **Files:** `src/services/api-client.ts`
  - **Verify:** TypeScript strict mode passes; ApiClientError correctly catches and parses server errors

- [ ] **4.2 Create src/services/auth.service.ts**
  - Implement `loginUser(username: string, password: string)`: POST `/api/v1/auth/login` with `LoginInput` payload
  - Implement `logoutUser()`: POST `/api/v1/auth/logout`
  - Implement `getCurrentUser()`: GET `/api/v1/auth/me` (protected)
  - Use API helpers from api-client.ts; import LoginInput from @shared/dto
  - **Files:** `src/services/auth.service.ts`
  - **Verify:** Functions match server endpoint signatures; TypeScript strict mode passes

---

## 5. Configuration and Utilities

- [ ] **5.1 Create src/config/env.ts**
  - Export `API_BASE = import.meta.env.VITE_API_BASE ?? "/api/v1"`
  - Export `SITE_URL = import.meta.env.VITE_SITE_URL ?? "http://localhost:5173"`
  - **Files:** `src/config/env.ts`
  - **Verify:** Variables resolve at build time and in dev mode

- [ ] **5.2 Create src/config/constants.ts**
  - Export pagination constants: `PROJECTS_PER_PAGE = 6`
  - Export route paths: `ROUTES = { PUBLIC: "/", PROJECTS: "/projects", ADMIN_LOGIN: "/admin/login", ADMIN: "/admin", ... }`
  - Export UI constants: `QUERY_RETRY_COUNT = 1` (retry false in login/auth)
  - **Files:** `src/config/constants.ts`
  - **Verify:** Constants are used in router and pages

- [ ] **5.3 Create src/config/query-client.ts**
  - Initialize TanStack Query `QueryClient`:
    - `defaultOptions.queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false, retry: (failureCount, error) => failureCount < 1 }`
    - `defaultOptions.mutations: { retry: 0 }`
  - Create `MutationCache` listener:
    - On `onSuccess`: show toast from `sonner` with success message
    - On `onError`: show error toast with `error.message || "Terjadi kesalahan"`
  - **Files:** `src/config/query-client.ts`
  - **Verify:** Query client initializes without errors; can be used in `QueryClientProvider`

- [ ] **5.4 Create src/lib/cn.ts**
  - Implement utility function `cn(...classes: any[])` to merge Tailwind classes
  - Use simple string concatenation or `clsx` if preferred
  - **Files:** `src/lib/cn.ts`
  - **Verify:** Function combines class strings correctly

---

## 6. Type Definitions and DTO Re-export

- [ ] **6.1 Create src/types/api.ts**
  - Re-export all DTOs from `@shared/dto`:
    - Schemas: `createProjectSchema`, `updateProjectSchema`, `projectListQuerySchema`, `loginSchema`
    - Types: `CreateProjectInput`, `UpdateProjectInput`, `ProjectListQuery`, `LoginInput`
    - Interfaces: `ProjectDTO`, `PaginationMeta`, `ApiSuccess<T>`, `ApiError`
    - Enums/literals: `ProjectStatus`, `ProjectCategory`, `ApiErrorCategory`
  - **Files:** `src/types/api.ts`
  - **Verify:** All imports resolve; no circular dependencies

---

## 7. Authentication Hooks (TanStack Query Hooks)

- [ ] **7.1 Create src/hooks/queries/use-auth.ts**
  - Implement `useMe()` hook:
    - Uses `useQuery({ queryKey: ["auth", "me"], queryFn: getCurrentUser, staleTime: 5 * 60 * 1000, retry: false })`
    - Imports from `auth.service.ts` and `config/query-client.ts`
  - Implement `useLogin()` mutation hook:
    - `useMutation({ mutationFn: (input: LoginInput) => loginUser(...), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth"] }) })`
    - Optimistic update: set user in cache before response
  - Implement `useLogout()` mutation hook:
    - `useMutation({ mutationFn: logoutUser, onSuccess: () => queryClient.setQueryData(["auth", "me"], null) })`
  - All hooks use `useQueryClient()` for cache invalidation
  - **Files:** `src/hooks/queries/use-auth.ts`
  - **Verify:** Hooks initialize query client correctly; mutation functions match service signatures

---

## 8. Core UI Components (Layout & Accessibility)

- [ ] **8.1 Create src/components/layout/RootLayout.tsx**
  - Export component that:
    - Renders `<Header />` with nav `aria-label="Navigasi utama"`
    - Renders `<main id="main" className="flex-1">` wrapping `<Outlet />`
    - Wraps in `<ErrorBoundary resetKeys={[location]}>` from react-error-boundary
    - Renders `<Footer />`
  - Layout structure: flex column, min-height-screen
  - **Files:** `src/components/layout/RootLayout.tsx`
  - **Verify:** Component renders without errors; `id="main"` present for skip link target

- [ ] **8.2 Create src/components/layout/AdminLayout.tsx**
  - Similar to RootLayout but for admin pages
  - Wraps content in error boundary with `resetKeys={[location]}`
  - May have different header styling (admin nav indicator)
  - **Files:** `src/components/layout/AdminLayout.tsx`
  - **Verify:** Component renders; ErrorBoundary works

- [ ] **8.3 Create src/components/layout/Header.tsx**
  - Export header component:
    - `<header className="bg-surface border-b border-border">` 
    - `<nav aria-label="Navigasi utama" className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">`
    - NavLink to Beranda (/) and Proyek (/projects) using `react-router` NavLink
    - Active link: `aria-current="page"` + `text-fg`, inactive: `text-muted`
    - Logo/site title on left
  - **Files:** `src/components/layout/Header.tsx`
  - **Verify:** Links are keyboard navigable; aria-current applies on active route

- [ ] **8.4 Create src/components/layout/Footer.tsx**
  - Export footer component:
    - `<footer className="bg-surface border-t border-border mt-16 py-8">`
    - Display current year (2026 → dynamic via `new Date().getFullYear()`)
    - Links to GitHub profile and email (mailto:)
    - Semantic HTML: use `<address>` for contact info if desired
  - **Files:** `src/components/layout/Footer.tsx`
  - **Verify:** Year is dynamic; links are accessible

- [ ] **8.5 Create src/components/layout/SkipLink.tsx**
  - Export skip-to-main-content link:
    - `<a href="#main" className="sr-only focus:not-sr-only">` Lewati ke konten utama `</a>`
    - Apply sr-only (screen reader only) Tailwind utility
    - Becomes visible on focus
  - **Files:** `src/components/layout/SkipLink.tsx`
  - **Verify:** Link is hidden by default, visible on tab focus

- [ ] **8.6 Create src/components/layout/RouteErrorFallback.tsx**
  - Export error boundary fallback component:
    - Takes `FallbackComponent` props from react-error-boundary
    - Display friendly error message: "Terjadi kesalahan saat memuat halaman"
    - Show reset button to retry
    - Render in centered container with h1 + paragraph
  - **Files:** `src/components/layout/RouteErrorFallback.tsx`
  - **Verify:** Component renders error state; reset button works

---

## 9. Reusable UI Components

- [ ] **9.1 Create src/components/ui/Button.tsx**
  - Export `Button` component with variants:
    - `variant: "primary" | "secondary" | "ghost"` (default primary)
    - `size: "sm" | "md" | "lg"` (default md)
    - Primary: `bg-accent text-bg hover:bg-accent/90`
    - Secondary: `bg-surface border border-border text-fg hover:bg-surface/80`
    - Ghost: `text-fg hover:bg-surface/50`
    - All variants: `:focus-visible` outline ring (from globals.css)
    - Loading state: accept `isLoading` prop, disable if true, show spinner inside
  - **Files:** `src/components/ui/Button.tsx`
  - **Verify:** All variants render correctly; focus ring visible

- [ ] **9.2 Create src/components/ui/Card.tsx**
  - Export `Card` component:
    - `<div className="bg-surface border border-border rounded px-6 py-4">`
    - Accept `children`, `className` props
  - **Files:** `src/components/ui/Card.tsx`
  - **Verify:** Card renders with correct background and border

- [ ] **9.3 Create src/components/ui/Badge.tsx**
  - Export `Badge` component:
    - `variant: "default" | "success" | "error" | "warning"` (default)
    - Small, pill-shaped component for labels (e.g., project category)
    - Use Tailwind for styling: `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium`
  - **Files:** `src/components/ui/Badge.tsx`
  - **Verify:** Component renders with correct variant styling

- [ ] **9.4 Create src/components/ui/Skeleton.tsx**
  - Export `Skeleton` component for loading placeholders:
    - `<div className="animate-pulse bg-surface rounded" />`
    - Accept `width`, `height` props (className style)
  - **Files:** `src/components/ui/Skeleton.tsx`
  - **Verify:** Component shows pulse animation

- [ ] **9.5 Create src/components/ui/Spinner.tsx**
  - Export `Spinner` component (16px SVG):
    - SVG with animated stroke (rotation)
    - `role="status"` for accessibility
    - Return simple inline SVG with `animate-spin` class
  - **Files:** `src/components/ui/Spinner.tsx`
  - **Verify:** Spinner rotates; role attribute present

---

## 10. Router and Protected Routes

- [ ] **10.1 Create src/router/ProtectedRoute.tsx**
  - Export `ProtectedRoute` component:
    - Accept `children` element as prop
    - Use `useMe()` hook to check auth status
    - Show `<Spinner />` while loading
    - If authenticated: render `children`
    - If error or no data: redirect to `/admin/login` using `<Navigate to="/admin/login" replace />`
  - **Files:** `src/router/ProtectedRoute.tsx`
  - **Verify:** Component redirects when not authenticated

- [ ] **10.2 Create src/router/index.tsx**
  - Export `router` created with `createBrowserRouter`:
    - Root route `/` → `RootLayout` (Layout component rendering Outlet)
      - `/` → `HomePage` (eager load)
      - `/projects` → `ProjectsPage` (eager load)
      - `/projects/:slug` → `ProjectDetailPage` (eager load)
      - `*` → `NotFoundPage` (catch-all)
    - `/admin/login` → `LoginPage` (lazy load: `lazy(() => import("../pages/admin/LoginPage"))`)
    - `/admin` → `AdminLayout` (Layout for admin routes, wrapped in `ProtectedRoute`)
      - `/admin` → `DashboardPage` (lazy load, inside ProtectedRoute)
      - `/admin/projects/:id/edit` → `ProjectEditorPage` (lazy load, inside ProtectedRoute)
    - Error boundary: `errorElement: <RouteErrorFallback />`
  - All admin routes use lazy code-splitting via `React.lazy()`
  - **Files:** `src/router/index.tsx`
  - **Verify:** `bun run build` creates separate chunks for admin routes; router initializes without errors

---

## 11. Pages (13 total, all with valid placeholder content)

**Public Pages (in `src/pages/` root):**

- [ ] **11.1 Create HomePage.tsx**
  - Render welcome section: `<h1>Selamat Datang</h1>`
  - Include brief intro paragraph (2-3 sentences about portfolio)
  - Link to /projects
  - **Files:** `src/pages/HomePage.tsx`
  - **Verify:** Page renders with h1 and text content

- [ ] **11.2 Create ProjectsPage.tsx**
  - Use `useQuery` to fetch projects from `/api/v1/projects` (public list endpoint)
  - Display list of projects as grid or cards
  - Show loading state: `<Skeleton />`
  - Show error state: "Gagal memuat proyek"
  - Each project card: title, summary, category badge, link to `/projects/:slug`
  - Render pagination if API provides it
  - **Files:** `src/pages/ProjectsPage.tsx`
  - **Verify:** Page fetches and displays projects; loading state works

- [ ] **11.3 Create ProjectDetailPage.tsx**
  - Use `useParams()` to get `:slug`
  - Fetch project from `/api/v1/projects/:slug`
  - Display: title, thumbnail, tech stack as badges, content (rendered with react-markdown)
  - Show demo/repo links if available
  - Add back link to /projects
  - **Files:** `src/pages/ProjectDetailPage.tsx`
  - **Verify:** Page renders project detail; markdown content displays correctly

- [ ] **11.4 Create NotFoundPage.tsx**
  - Render 404 message: `<h1>Halaman Tidak Ditemukan</h1>`
  - Include helpful text and link back to home
  - **Files:** `src/pages/NotFoundPage.tsx`
  - **Verify:** Page displays error message

**Admin Pages (in `src/pages/admin/` with lazy loading):**

- [ ] **11.5 Create LoginPage.tsx**
  - Render form with `react-hook-form` + Zod validation
  - Fields: username, password (both required, with constraints from schema)
  - Submit button uses `useLogin()` mutation
  - Show loading state while submitting
  - On success: redirect to `/admin` using `useNavigate()`
  - Show error messages from server: display `error.errors` if validation error
  - **Files:** `src/pages/admin/LoginPage.tsx`
  - **Verify:** Form validates client-side; submits to server; shows errors

- [ ] **11.6 Create DashboardPage.tsx**
  - Render admin overview: `<h1>Dashboard Admin</h1>`
  - Show current user info from `useMe()` hook
  - Display quick stats or project list summary
  - Link to project editor: `/admin/projects/{id}/edit`
  - Include logout button using `useLogout()` mutation
  - **Files:** `src/pages/admin/DashboardPage.tsx`
  - **Verify:** Page displays admin content; logout button works

- [ ] **11.7 Create ProjectEditorPage.tsx**
  - Use `useParams()` to get `:id`
  - Fetch project from `/api/v1/admin/projects/:id` (protected)
  - Render form with `react-hook-form` + Zod validation using `updateProjectSchema`
  - Fields: title, slug, summary, category, status, tech_stack, content, URLs (repo, demo, notebook), featured toggle
  - Submit button uses `useMutation()` to PUT `/api/v1/admin/projects/:id`
  - Show loading state and success/error messages
  - **Files:** `src/pages/admin/ProjectEditorPage.tsx`
  - **Verify:** Form loads and submits; validation works

---

## 12. Application Entry Points and Root Component

- [ ] **12.1 Create src/main.tsx**
  - Import React, ReactDOM, router, globals.css
  - Import QueryClientProvider from TanStack Query
  - Import Toaster from `sonner`
  - Import HelmetProvider from `react-helmet-async`
  - Render:
    ```tsx
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </HelmetProvider>
    ```
  - Mount to `#root` element in index.html
  - **Files:** `src/main.tsx`
  - **Verify:** App starts in dev mode on http://localhost:5173

- [ ] **12.2 Create src/App.tsx**
  - Simple placeholder: export default App that renders router outlet
  - (Note: most apps use RouterProvider directly; keep minimal)
  - **Files:** `src/App.tsx`
  - **Verify:** File exists; no import errors

- [ ] **12.3 Create index.html**
  - `<!DOCTYPE html>`
  - `<html lang="id">` (Indonesian)
  - `<head>`:
    - `<meta charset="UTF-8">`
    - `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
    - `<title>Portfolio | {username}</title>` (can be dynamic after load)
    - `<link rel="icon" href="/favicon.ico">`
  - `<body class="dark">` (enforce dark theme)
    - `<div id="root"></div>`
    - `<script type="module" src="/src/main.tsx"></script>`
  - **Files:** `index.html`
  - **Verify:** HTML is valid; script loads main.tsx

---

## 13. Environment and Deployment Configuration

- [ ] **13.1 Create vercel.json**
  - `framework: "vite"`
  - `buildCommand: "bun run build"`
  - `installCommand: "bun install"`
  - `rewrites`:
    - `/api/v1/*` → `https://<SERVER_DOMAIN>/api/v1/*` (production backend)
    - `(.*)` → `/index.html` (SPA fallback, placed last)
  - Example:
    ```json
    {
      "framework": "vite",
      "buildCommand": "bun run build",
      "installCommand": "bun install",
      "rewrites": [
        { "source": "/api/v1/(.*)", "destination": "https://<SERVER_DOMAIN>/api/v1/$1" },
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
  - **Files:** `vercel.json`
  - **Verify:** JSON is valid; no syntax errors

- [ ] **13.2 Create .env.example**
  - `VITE_API_BASE=/api/v1` (dev proxy, prod rewrite in vercel.json)
  - `VITE_SITE_URL=http://localhost:5173` (dev)
  - **Files:** `.env.example`
  - **Verify:** File can be copied to `.env` for local development

---

## 14. Package.json Scripts and Build Output

- [ ] **14.1 Create/update package.json with scripts**
  - `"dev"`: `vite` (starts dev server on http://localhost:5173)
  - `"build"`: `tsc && vite build` (type-check then build)
  - `"preview"`: `vite preview` (preview production build)
  - `"typecheck"`: `tsc --noEmit` (TypeScript check)
  - `"lint"`: `biome check .` (Biome linting)
  - `"lint:fix"`: `biome check --write .` (Biome format + fix)
  - **Files:** `package.json` (auto-generated from dependencies, update scripts section)
  - **Verify:** `bun run build` produces `dist/` folder with index.html and JS chunks

---

## 15. Verification Checklist (Comprehensive)

Run these commands in order to verify the entire implementation:

- [ ] **15.1 Development Environment**
  - `bun install` → all deps installed, no errors
  - `bun run typecheck` → all TypeScript strict checks pass
  - `bun run lint` → Biome finds no errors/warnings
  - `bun run dev` → Vite dev server starts on http://localhost:5173, no console errors

- [ ] **15.2 Browser Smoke Test (Dev Mode)**
  - Navigate to http://localhost:5173 → HomePage loads with h1 + paragraph
  - Navigate to /projects → ProjectsPage loads, fetches from backend (if server running on :3000)
  - Click project → ProjectDetailPage loads with full content
  - Click 404 link → NotFoundPage displays correctly
  - Open DevTools → no console errors, network requests to /api/v1/* succeed

- [ ] **15.3 Build and Production Output**
  - `bun run build` → build succeeds, generates `dist/` folder
  - `dist/index.html` exists with correct structure (lang="id", dark theme)
  - `dist/` contains separate JS chunks for admin routes (code-split verification: 2+ JS files in `dist/assets/`)
  - `dist/` contains CSS file from Tailwind (globals.css compiled)

- [ ] **15.4 Type Safety and DTO Imports**
  - `tsc --noEmit` passes in strict mode
  - `@shared/dto` imports resolve correctly: `ProjectDTO`, `LoginInput`, `createProjectSchema` all available
  - `src/types/api.ts` re-exports all DTOs without circular dependencies

- [ ] **15.5 Accessibility and Focus**
  - Open DevTools → Elements tab
  - Inspect Header nav → verify `aria-label="Navigasi utama"` present
  - Tab through page → SkipLink becomes visible on first tab
  - Inspect links with active route → verify `aria-current="page"` set
  - Inspect all interactive elements → `:focus-visible` outline visible in dark theme

- [ ] **15.6 Tailwind CSS v4 Verification**
  - No `tailwind.config.ts` file present (CSS-first config only)
  - `globals.css` contains `@import "tailwindcss"` and `@theme` tokens
  - Color inspection: elements use `--color-*` CSS variables from theme
  - Background: `#0C0A09` (bg), surface: `#1C1917`, accent: `#F59E0B`
  - No inline gradients, glows, or box-shadows (per spec)

- [ ] **15.7 Console Output Verification**
  - `bun run build` output: no `console.log` in bundle (esbuild drop enabled)
  - Dev mode: no console.log statements in source files (biome lint catches them)

- [ ] **15.8 Router and Code Splitting**
  - Inspect `dist/assets/` folder: should contain multiple JS files
  - Admin routes chunk should be separate (lazy-loaded)
  - `dist/index.html` contains script tags for main JS + split chunks

---

## Summary

This plan provides a complete, production-ready frontend scaffold with:
- React + Vite + Tailwind v4 (CSS-first) + TypeScript strict mode
- 13 fully implemented pages (7 public + 6 admin with lazy loading)
- TanStack Query for server state management
- React Router with protected routes
- Accessible components with proper ARIA labels and focus management
- API client with error handling and DTO re-exports
- Biome linting with Indonesian language conventions
- Build configuration for code-splitting admin routes
- Vercel deployment config with API rewrites
- All 15 major features grouped into logical implementation steps
- Comprehensive verification checklist using the project's build and test commands

**Key Files to Create: 50+ files across config, components, pages, hooks, services, and utilities**
**Build Commands: `bun run dev`, `bun run build`, `bun run typecheck`, `bun run lint`**
**Total Verification Steps: 8 categories covering dev, build, types, accessibility, styling, console, router, and deployment**
