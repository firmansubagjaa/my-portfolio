# Implementation Plan: Public Showcase (Issue #4)

## Overview

Implement public project showcase (M3) with backend endpoints for public list/detail projects, SQL filtering, frontend Bento Grid with URL-driven filters, detail page with Markdown + syntax highlighting, and motion animations.

---

## BACKEND IMPLEMENTATION

### 1. Create SQL utility for LIKE escaping
- [ ] Create `server/src/utils/sql.ts` with `escapeLike(pattern: string): string` function
  - Escape special characters (%, _, \\) by doubling backslash prefix
  - Example: '50%_off\\' -> '50\\%\\_off\\\\'
  - Used by search filter in dynamic SQL builder
  - Files: `server/src/utils/sql.ts`
  - Verify: `cd server && bun test src/utils/sql.test.ts` — tests pass

### 2. Update server DTOs for public endpoint
- [ ] Update `server/src/shared/dto.ts`:
  - Add `publicProjectListQuerySchema`: extends `projectListQuerySchema`, status enum restricted to ['published', 'archived'] with default 'published', limit default 6
  - Add `ProjectListItemDTO` type: `Omit<ProjectDTO, 'content'>`
  - Add `ProjectListResponse` interface with `items: ProjectListItemDTO[]` and `pagination: PaginationMeta`
  - Export new schemas
  - Files: `server/src/shared/dto.ts`
  - Verify: `cd server && bun run typecheck` — no type errors

### 3. Create project data layer with filtering
- [ ] Create `server/src/models/project.model.ts`:
  - Export `buildProjectWhere(filters: Partial<PublicProjectListQuery>): SQL` — builds WHERE clause
    - status: if string use `eq()`, if array use `inArray()`
    - category: use `eq()`
    - search: use `or()` + `ilike()` with escapeLike() on title, summary, or `array_to_string(tech_stack, ',')`
  - Export `listProjects(filters, pagination): Promise<{ items: ProjectListItemDTO[], total: number }>`
    - SELECT all columns except content
    - Run query + count in parallel
    - Order by `is_featured DESC, created_at DESC`
  - Export `findPublicProjectBySlug(slug: string): Promise<ProjectDTO | undefined>`
    - WHERE `status IN ('published', 'archived')`
  - Files: `server/src/models/project.model.ts`
  - Verify: `cd server && bun run typecheck` — no type errors

### 4. Create project test for SQL utilities
- [ ] Create `server/src/utils/sql.test.ts`:
  - Test `escapeLike()`:
    - '50%_off\\' -> '50\\%\\_off\\\\'
    - Empty string -> empty string
    - No special chars -> unchanged
    - Only special chars '%_\\' -> '\\%\\_\\\\'
    - Verify no false positive matches (test ILIKE with escaped pattern)
  - Files: `server/src/utils/sql.test.ts`
  - Verify: `cd server && bun test src/utils/sql.test.ts` — all tests pass

### 5. Create public projects controller
- [ ] Create `server/src/controllers/project.controller.ts`:
  - Route: `GET /` (list public projects)
    - Validate query with `publicProjectListQuerySchema`
    - Extract pagination params via `getPaginationParams()`
    - Call `listProjects(filters, pagination)`
    - Return `ApiResponse.success()` with pagination meta
  - Route: `GET /:slug` (get project detail)
    - Validate param `slug` with `slugSchema`
    - Call `findPublicProjectBySlug(slug)`
    - Return full `ProjectDTO` or 404
  - Files: `server/src/controllers/project.controller.ts`
  - Verify: `cd server && bun run typecheck` — no type errors

### 6. Register project routes in server
- [ ] Update `server/src/index.ts`:
  - Import `projectController`
  - Add `app.route("/api/v1/projects", projectController);`
  - Files: `server/src/index.ts`
  - Verify: `cd server && bun run typecheck` — no type errors

### 7. Run backend verification
- [ ] Verify backend build and endpoints:
  - `cd server && bun run build:check` (or equivalent type + lint)
  - Manual test: `curl http://localhost:3000/api/v1/projects?page=1&limit=6` returns paginated projects without content
  - Manual test: `curl http://localhost:3000/api/v1/projects/ai-project-slug` returns full ProjectDTO or 404
  - Files: N/A
  - Verify: Both endpoints return correct format with no drafts

---

## FRONTEND IMPLEMENTATION

### 8. Create projects service with URL query building
- [ ] Create `client/src/services/projects.service.ts`:
  - Export `getPublicProjects(params: PublicProjectListQuery): Promise<ProjectListResponse>`
    - Build URLSearchParams, skip undefined/empty values
    - Only include non-default values in URL (page=1, status='published' omitted)
    - Call `apiGet("/api/v1/projects?" + searchParams)`
  - Export `getProjectBySlug(slug: string): Promise<ProjectDTO>`
    - Call `apiGet("/api/v1/projects/" + slug)`
  - Files: `client/src/services/projects.service.ts`
  - Verify: `cd client && bun run typecheck` — no type errors

### 9. Create projects query hooks
- [ ] Create `client/src/hooks/queries/use-projects.ts`:
  - Export `projectKeys` object for query key factory
  - Export `useProjects(params): UseQueryResult<ProjectListResponse>`
    - queryKey: `projectKeys.list(params)`
    - placeholderData: keepPreviousData (preserve old data during filter change)
    - staleTime: 5 * 60 * 1000
  - Export `useProject(slug: string, enabled: boolean): UseQueryResult<ProjectDTO>`
    - queryKey: `projectKeys.detail(slug)`
    - enabled guard
    - staleTime: 10 * 60 * 1000
  - Files: `client/src/hooks/queries/use-projects.ts`
  - Verify: `cd client && bun run typecheck` — no type errors

### 10. Create URL filter state management hook
- [ ] Create `client/src/hooks/use-project-filters.ts`:
  - Export `useProjectFilters()`: returns `{ filters, setFilters }`
  - Parse searchParams with `publicProjectListQuerySchema.safeParse()` (no crash on invalid)
  - Return parsed filters with defaults (page=1, status='published')
  - `setFilters(newFilters)`: 
    - Reset page to 1 if category/search/status changes
    - Delete defaults from URL (page=1, status='published' not serialized)
    - Use `navigate(path, { replace: true })` for search state changes
  - Files: `client/src/hooks/use-project-filters.ts`
  - Verify: `cd client && bun run typecheck` — no type errors

### 11. Create debounced value hook (if not exists)
- [ ] Create `client/src/hooks/use-debounced-value.ts`:
  - Export `useDebouncedValue<T>(value: T, delay: number = 300): T`
  - Use `useEffect` with `setTimeout` and cleanup
  - Files: `client/src/hooks/use-debounced-value.ts`
  - Verify: `cd client && bun run typecheck` — no type errors

### 12. Create motion feature loader
- [ ] Create `client/src/components/motion/motion-features.ts`:
  - Export `async function loadMotionFeatures()`
    - Dynamically import domMax from `motion/dom`
    - Return { domMax }
  - Lazy-load domMax to keep bundle < 100KB gzip
  - Files: `client/src/components/motion/motion-features.ts`
  - Verify: Separate chunks in build output (motion chunk exists)

### 13. Create MotionProvider wrapper
- [ ] Create `client/src/components/motion/MotionProvider.tsx`:
  - Export `MotionProvider` component (client component)
    - Use `LazyMotion` with `strict` mode
    - Load features via `loadMotionFeatures()`
    - Use `MotionConfig` with `reducedMotion: 'user'`
    - Render `{children}`
  - Files: `client/src/components/motion/MotionProvider.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 14. Create AnimatedOutlet with route transitions
- [ ] Create `client/src/components/motion/AnimatedOutlet.tsx`:
  - Export `AnimatedOutlet` component (client component)
    - Use `useLocation()` to get pathname
    - Wrap `Outlet` in `AnimatePresence` with `mode='wait'`
    - Wrap Outlet in `motion.div` with:
      - key={location.pathname} (only pathname, not query)
      - initial={{ opacity: 0, y: 10 }}
      - animate={{ opacity: 1, y: 0 }}
      - exit={{ opacity: 0, y: -10 }}
      - transition={{ duration: 0.2 }}
  - Files: `client/src/components/motion/AnimatedOutlet.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 15. Create BentoGrid layout component
- [ ] Create `client/src/components/bento/BentoGrid.tsx`:
  - Export `BentoGrid` component
    - Accept `children: ReactNode[]` (ProjectCards)
    - Wrap in `LayoutGroup`
    - Use CSS Grid with `AnimatePresence` mode='popLayout'
    - Grid template:
      - featured (is_featured && index < 2): `col-span-4 row-span-2`
      - other featured (is_featured): `col-span-3`
      - regular: `col-span-2`
    - Gap: `gap-6`
    - Responsive: `grid-cols-1 md:grid-cols-6 lg:grid-cols-12`
  - Files: `client/src/components/bento/BentoGrid.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 16. Create ProjectCard component
- [ ] Create `client/src/components/bento/ProjectCard.tsx`:
  - Export `ProjectCard` component
    - Accept `project: ProjectListItemDTO`
    - Render as `<article>` with `<Link to={...}>` wrapper
    - Inside: `<img>` with `aspect-[16/10]`
    - Title, summary, category badge
    - Pseudo-element: `after:absolute` for focus visible ring
    - Class: `has-[a:focus-visible]:ring-2`
    - Motion: `motion.article` with layout animation
  - Files: `client/src/components/bento/ProjectCard.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 17. Create BentoSkeleton loader
- [ ] Create `client/src/components/bento/BentoSkeleton.tsx`:
  - Export `BentoSkeleton` component
    - Render same grid layout as BentoGrid (12 skeleton cards)
    - Match BentoGrid size exactly (CLS < 0.01)
    - Use Skeleton component with correct col/row spans
  - Files: `client/src/components/bento/BentoSkeleton.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 18. Create EmptyState component
- [ ] Create `client/src/components/bento/EmptyState.tsx`:
  - Export `EmptyState` component
    - Accept optional `message?: string`
    - Display centered message with icon
  - Files: `client/src/components/bento/EmptyState.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 19. Create ProjectFilters form
- [ ] Create `client/src/components/projects/ProjectFilters.tsx`:
  - Export `ProjectFilters` component
    - Accept `filters, onFiltersChange: (filters) => void`
    - Render as `<form role='search'>`
    - Search input (debounced 300ms, `useDebouncedValue`)
    - Category button group (`aria-pressed`)
    - Sync to URL on change
  - Files: `client/src/components/projects/ProjectFilters.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 20. Create Pagination component
- [ ] Create `client/src/components/projects/Pagination.tsx`:
  - Export `Pagination` component
    - Accept `current: number, total: number, onChange: (page: number) => void`
    - Render as `<nav aria-label="Pagination">`
    - Previous/Next buttons (disabled appropriately)
    - Page X of Y display with `aria-live="polite"`
    - Scroll to top on page change
  - Files: `client/src/components/projects/Pagination.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 21. Create ProjectMeta component
- [ ] Create `client/src/components/projects/ProjectMeta.tsx`:
  - Export `ProjectMeta` component (for detail page)
    - Display tech stack, links, etc.
  - Files: `client/src/components/projects/ProjectMeta.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 22. Create Markdown component with code highlighting
- [ ] Create `client/src/components/markdown/Markdown.tsx`:
  - Export `Markdown` component
    - Accept `content: string`
    - Use `react-markdown` + `remark-gfm`
    - Handle code blocks via custom renderer
  - Files: `client/src/components/markdown/Markdown.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 23. Create CodeBlock with Shiki highlighting
- [ ] Create `client/src/components/markdown/CodeBlock.tsx`:
  - Export `CodeBlock` component
    - Accept `code: string, language: string`
    - First render plain `<pre><code>`
    - `useEffect` + `getHighlighter()` from `highlighter.ts`
    - Call `codeToHtml(code, { lang, theme: 'dark-plus' })`
    - Update with syntax-highlighted HTML via `dangerouslySetInnerHTML`
  - Files: `client/src/components/markdown/CodeBlock.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 24. Create Shiki lazy loader
- [ ] Create `client/src/components/markdown/highlighter.ts`:
  - Export `getHighlighter()`: async returns Shiki instance
  - Use `createHighlighterCore` with:
    - JavaScript engine (no WebAssembly)
    - Limited languages: ts, tsx, js, json, bash, sql, python, css, html
    - Theme: 'dark-plus'
  - Singleton pattern (cache instance)
  - Lazy-loaded only on detail page
  - Files: `client/src/components/markdown/highlighter.ts`
  - Verify: `cd client && bun run typecheck` — no type errors

### 25. Update HomePage to show featured projects
- [ ] Update `client/src/pages/HomePage.tsx`:
  - Replace static content with:
    - Intro section
    - Featured grid: `useProjects({ limit: 6, page: 1 })`
    - First card marked as priority (`priority` for img)
    - BentoSkeleton while loading
  - Files: `client/src/pages/HomePage.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 26. Update ProjectsPage with filters and pagination
- [ ] Update `client/src/pages/ProjectsPage.tsx`:
  - Use `useProjectFilters()` to get/set filters
  - Use `useProjects(filters)` for data
  - Render:
    - `ProjectFilters` component
    - `BentoGrid` with `ProjectCard` children (or `BentoSkeleton`)
    - `Pagination` component
    - `EmptyState` if no results
  - Files: `client/src/pages/ProjectsPage.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 27. Update ProjectDetailPage with markdown
- [ ] Update `client/src/pages/ProjectDetailPage.tsx`:
  - Use `useProject(slug)` (replace current impl)
  - Render:
    - Back link
    - Title, summary, badges
    - `Markdown` component with content
    - `ProjectMeta` component
    - Links (demo, repo)
  - Replace `MDEditor.Markdown` with custom `Markdown` component
  - Files: `client/src/pages/ProjectDetailPage.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 28. Wrap RootLayout with MotionProvider
- [ ] Update `client/src/components/layout/RootLayout.tsx`:
  - Wrap with `MotionProvider`
  - Replace `<Outlet />` with `<AnimatedOutlet />`
  - Files: `client/src/components/layout/RootLayout.tsx`
  - Verify: `cd client && bun run typecheck` — no type errors

### 29. Run frontend verification
- [ ] Verify frontend build:
  - `cd client && bun run build` — no errors
  - Check bundle chunks: separate `shiki` and `motion-features` chunks in dist
  - `cd client && bun run typecheck && bun run lint` — no errors
  - Manual test: `/projects?search=ai&category=fullstack&page=2` preserves filters on refresh
  - Manual test: Filter changes animate grid reflow, not full page
  - Manual test: Route transitions fade 0.2s opacity/y
  - Manual test: Detail page renders markdown + syntax-highlighted code
  - Files: N/A
  - Verify: All checks pass, bundle format correct

---

## FULL SYSTEM VERIFICATION

### 30. Integration test: Server + Client
- [ ] Verify end-to-end flow:
  - `cd server && bun run dev` in one terminal
  - `cd client && bun run dev` in another terminal
  - GET /api/v1/projects?page=1&limit=6 returns paginated projects (no drafts, no content)
  - GET /api/v1/projects/published-project-slug returns full project or 404
  - /projects page loads grid, filters work, pagination works
  - /projects/:slug page loads detail, markdown + code highlighting render
  - Grid reflow animate on filter change (not full page fade)
  - Route transitions fade (HomePage -> ProjectsPage)
  - Keyboard: Tab through cards, focus visible rings appear
  - Files: N/A
  - Verify: All features work as specified

---

## DEPENDENCIES TO ADD

### Server
- No new dependencies (Drizzle ORM already has SQL builder)

### Client
- `motion` v11.15.0 (already in package.json)
- `react-markdown` v9.0.1 (already in package.json)
- `remark-gfm` v4.0.1 (already in package.json)
- `shiki` v1.23.0 (already in package.json)

---

## KEY DESIGN DECISIONS

1. **Backend Status Filter**: Restricted to 'published' or 'archived' (no drafts) per spec
2. **SQL Builder**: Dynamic WHERE clause using Drizzle's `and()`, `or()`, `eq()`, `inArray()`, `ilike()`
3. **LIKE Escaping**: Custom `escapeLike()` to prevent false matches in search
4. **Pagination**: Default limit 6, page 1; metadata included in response
5. **Project Ordering**: Featured DESC, created_at DESC (featured projects always first)
6. **Motion**: LazyMotion + domMax async-loaded, MotionConfig with reducedMotion: 'user'
7. **Shiki**: createHighlighterCore with limited languages, JavaScript engine, lazy-loaded on detail page only
8. **Route Transitions**: Key by pathname only (not query), animations on main outlet
9. **Filter Changes**: Animate only grid reflow (layout animation), not full-page fade
10. **URL State**: Defaults cleaned (page=1, status='published' not serialized), preserved on back/forward
11. **Query Hooks**: placeholderData: keepPreviousData for smooth filter transitions
12. **Accessibility**: Form roles, aria-pressed, aria-live for pagination, focus-visible rings

---

## VERIFICATION CHECKLIST

- [ ] `cd server && bun run typecheck && bun run lint && bun test` — all pass
- [ ] `cd client && bun run typecheck && bun run lint && bun run build` — all pass
- [ ] GET /api/v1/projects?page=1&limit=6 returns paginated projects, no drafts, no content
- [ ] GET /api/v1/projects/:slug returns full ProjectDTO or 404
- [ ] /projects page displays Bento Grid with featured/regular layouts
- [ ] Search, category, pagination filters work and preserve on refresh
- [ ] Filter changes animate grid reflow only (not full page)
- [ ] Route transitions fade 0.2s opacity/y
- [ ] Detail page renders markdown + syntax-highlighted code blocks
- [ ] Skeleton and grid same size (CLS < 0.01)
- [ ] `bun run build` produces separate shiki and motion-features chunks
- [ ] All TypeScript types check
- [ ] All Biome lint checks pass
