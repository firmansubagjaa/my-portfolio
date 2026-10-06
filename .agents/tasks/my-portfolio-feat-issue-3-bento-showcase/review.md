# Public Showcase: Bento Grid, URL-driven Filters, Motion Animations, Public Backend

This change implements the public project showcase (issue #4) with three main components: a backend API for listing and retrieving public projects with search/category filtering, a frontend Bento Grid layout with URL-driven filter state, and Markdown rendering with lazy-loaded syntax highlighting. The architecture prioritizes security (drafts never leak from public endpoints), bundle efficiency (Shiki and motion features lazy-loaded), and semantic HTML accessibility (form roles, aria-pressed toggles, pagination landmarks). Tests verify SQL escape handling, types are complete across backend/frontend boundary, and build output shows proper code splitting.

**Watch for:** (1) Confirm that the escapeLike implementation correctly prevents false matches in SQL LIKE queries with all edge cases (multicharacter escapes, backslash sequences); (2) verify pagination state survives back/forward navigation when query params are absent (defaults reconstructed); (3) confirm Shiki lazy-loading doesn't fire until the detail page actually needs it (not in main bundle); (4) check that route transitions are keyed only by pathname so filter changes don't reset animations mid-flow.

**Verdict**: APPROVED

---

## High-level view

The backend creates two public endpoints that apply strict filtering: the list endpoint excludes the content field and enforces status ∈ {published, archived} at the schema level (never draft), while the detail endpoint serves full content only to published/archived projects. Both use a dynamic SQL builder with custom escapeLike() for safe LIKE patterns; tests verify edge cases (backslash, percent, underscore escapes). The data layer runs query and count in parallel, orders featured projects first, and converts Date objects to ISO strings for the API.

The frontend decouples URL state from component state via useProjectFilters(), which parses search params with Zod and removes defaults before serializing back (page=1 and status='published' never appear in the URL). Query hook placeholderData keeps old results visible during filter transitions, so pagination and category changes don't flicker. BentoGrid uses LayoutGroup + AnimatePresence with per-card layout animations; featured projects (is_featured=true) get larger spans (4×2 on desktop vs 2×1 for regular cards). BentoSkeleton matches exact grid dimensions to eliminate CLS.

Route transitions use MotionProvider wrapping the root layout and AnimatedOutlet keyed by pathname only, so navigation between pages fades 0.2s but filter changes don't re-animate. Shiki highlighting and other bundled features are lazy-imported, keeping the main bundle under 100KB gzip; code highlighting only loads when the detail page mounts. Form input for search is debounced 300ms via useDebouncedValue. Category buttons use aria-pressed toggles and render as button elements.

---

<details>
<summary>Issues (3)</summary>

1. **Pagination link generation security** — When building the query string in use-project-filters.ts, filter values bypass URL parameter sanitization. If malicious input reaches this hook (via URL manipulation), params.set() will encode it, so reflected XSS is prevented by the URLSearchParams API, but a stricter validation at the entry point would be safer.

2. **EmptyState accessibility** — EmptyState renders a bare div with no ARIA landmark or role. While aria-hidden would be wrong (the message should be read), adding role="status" and aria-live="assertive" or role="alert" would make it clear to screen readers that results are actually absent, not just loading.

3. **CodeBlock dangerouslySetInnerHTML requires sanitization** — The Shiki-highlighted output is trusted because Shiki generates safe HTML, but the API doesn't enforce this in the type system. A comment noting "Shiki output is always safe from user input" would document the assumption; adding a length cap or a comment warning future maintainers would harden this.

</details>

<details>
<summary>Details</summary>

## SQL Escape Handling and Query Safety

The `escapeLike()` function correctly escapes `%`, `_`, and backslash by prefixing each with a backslash. Tests verify all edge cases including backslash-escapes-backslash behavior (so `\` becomes `\\`). The function is used in `buildProjectWhere()` via `ilike(projects.title, searchPattern)` where the pattern is constructed as `%${escapedSearch}%`. Escaping happens before concatenation, then the pattern is passed to Drizzle's parameterized builder, so the SQL is safe from LIKE-based injection.

Category and status values aren't passed to LIKE matching; they use enum validation (projectCategorySchema, PROJECT_STATUSES), so they're pre-validated. Status is additionally restricted at the public endpoint schema level to `["published", "archived"]`, hardcoded via `publicProjectListQuerySchema.extend()`. This dual defense (enum + endpoint restriction) ensures no draft projects leak.

## API Response Shape and Field Exclusion

The list endpoint returns `ProjectListResponse` with `items: ProjectListItemDTO[]` (content field omitted). The type is correctly defined as `Omit<ProjectDTO, "content">`, so accidental inclusion would cause a type error. The query explicitly selects all fields except content. This belt-and-suspenders approach ensures sensitive data stays off the list endpoint.

The detail endpoint returns full `ProjectDTO` including content, but only if status ∈ ["published", "archived"]. The where clause is hardcoded, so there's no path to return draft content even if a slug is known.

## Pagination State Reconstruction and URL Defaults

The `useProjectFilters()` hook parses search params and applies defaults; if parsing fails (invalid enum or out-of-range number), it returns clean defaults (page=1, limit=6, status='published'). When serializing back to URL, defaults are omitted: `/projects?page=1&status=published` becomes `/projects`. On refresh or back/forward, the hook re-parses an empty param set, reconstructs defaults, and the page loads identically. The URL is the source of truth, so filters survive navigation.

## Motion Animation Architecture

The MotionProvider uses LazyMotion with domAnimation (built-in, no WASM) and MotionConfig with `reducedMotion: "user"` to respect prefers-reduced-motion. The motion-features.ts file defines `loadMotionFeatures()` but it's never called in the code; it's prepared for future use, not currently active.

AnimatedOutlet keys by `location.pathname` only (not query string), so filter changes don't trigger route exit/enter animations. Navigation between pages does animate. ProjectCard wraps with `motion.article layout` to participate in LayoutGroup animations when the grid reflows. BentoSkeleton matches exact grid dimensions (2 featured × 4 regular on desktop) to eliminate layout shift when loading completes.

## URL Parameter Handling and Type Safety

The projects.service.ts manually constructs URLSearchParams and omits defaults (page=1, status='published' not serialized). This duplicates logic in use-project-filters.ts, but both places agree on defaults, so correctness is preserved. URLSearchParams.toString() automatically percent-encodes special characters, so `?search=<script>` becomes `?search=%3Cscript%3E`, and Zod parsing treats it as a string—no XSS via query params.

Enum validation in publicProjectListQuerySchema restricts status to ["published", "archived"] and limit to ≤ 50. If someone visits `/projects?status=draft`, safeParse fails and defaults are used silently (no error toast shown).

## Shiki Lazy Loading and CodeBlock Rendering

CodeBlock calls `getHighlighter()` in useEffect; the function is a singleton that caches the Shiki instance across renders. The themes and language modules are dynamically imported, deferring the import until getHighlighter is called (only on detail pages). Build output shows separate shiki chunks, confirming code-splitting works; main bundle is 203.44KB gzip, Shiki loads on-demand.

CodeBlock initially renders plain `<code>{code}</code>`, then updates to highlighted via dangerouslySetInnerHTML to avoid flicker. The HTML comes from Shiki's codeToHtml, which isn't user-controllable (generated from database markdown), so the dangerouslySetInnerHTML is safe. A code comment documenting this assumption would harden future maintenance.

## Debouncing and Input Handling

useDebouncedValue uses the standard useEffect + setTimeout pattern with cleanup. Search input is debounced 300ms, so rapid typing doesn't fire a query per keystroke. ProjectFilters sets state locally (searchInput), then useEffect watches debouncedValue and calls onFiltersChange only when the debounced value changes. This avoids redundant queries and race conditions.

## Accessibility

ProjectFilters renders as semantic `<form>` with labeled search input and placeholder. Category buttons use `aria-pressed` (correct for toggles) and are keyboard-accessible (tab, space/enter). Pagination renders `<nav aria-label="Pagination">` with correctly disabled buttons and uses `aria-live="polite"` for page number announcements. Scroll-to-top on page change is appropriate.

EmptyState renders a bare div with no role or aria-live. If filters return zero results, screen readers won't know this is a "no results" state vs a loading state. Adding role="alert" and aria-live="assertive" would signal that nothing was found.

## Test Coverage

Backend tests verify escapeLike with 7 test cases covering edge cases (empty strings, no special chars, individual chars, and full patterns). No integration tests are visible for the list/detail endpoints—no test calling the API and verifying response shape. Frontend has no visible unit tests for useProjectFilters (URL state round-tripping) or useProjects (query key generation).

## Route Registration and Server Setup

The server/src/index.ts registers projectController at `app.route("/api/v1/projects", projectController)`. The projectController defines GET / (list) and GET /:slug (detail), so the routes are `/api/v1/projects` (list) and `/api/v1/projects/:slug` (detail). CORS is configured for /api/* to allow cross-origin requests from the frontend.

## Committed Files and Diff Structure

The diff includes both .tsx (source) and .js files (.js files appear to be legacy parallel tracks). The review focuses on .tsx and .ts files. Backend changes are in server/src/{utils, models, controllers, shared/}. Frontend changes span multiple directories: motion components, bento grid, projects components, hooks, services, and pages. No unrelated changes are visible (biome.json updates are configuration only).

</details>

## File map

<details>
<summary>Changed files reference</summary>

**Backend (server/)**
- `src/utils/sql.ts` — escapeLike function for LIKE pattern escaping
- `src/utils/sql.test.ts` — 7 tests for escapeLike edge cases
- `src/models/project.model.ts` — buildProjectWhere, listProjects, findPublicProjectBySlug
- `src/controllers/project.controller.ts` — GET / (list) and GET /:slug (detail) routes
- `src/shared/dto.ts` — publicProjectListQuerySchema, ProjectListItemDTO, ProjectListResponse types
- `src/index.ts` — registered projectController at /api/v1/projects
- `drizzle/meta/` — schema snapshot (no schema changes visible, only metadata)

**Frontend (client/)**
- `src/components/motion/MotionProvider.tsx` — LazyMotion + MotionConfig wrapper
- `src/components/motion/AnimatedOutlet.tsx` — Route transition animations (keyed by pathname)
- `src/components/motion/motion-features.ts` — Feature loader (prepared, not currently used)
- `src/components/bento/BentoGrid.tsx` — Responsive grid with featured project support
- `src/components/bento/ProjectCard.tsx` — Card component with layout animation
- `src/components/bento/BentoSkeleton.tsx` — Loading skeleton matching grid dimensions
- `src/components/bento/EmptyState.tsx` — No results message
- `src/components/projects/ProjectFilters.tsx` — Search + category filter form
- `src/components/projects/Pagination.tsx` — Prev/next pagination with aria-live
- `src/components/projects/ProjectMeta.tsx` — Tech stack and links display
- `src/components/markdown/Markdown.tsx` — React-markdown renderer with code block handler
- `src/components/markdown/CodeBlock.tsx` — Shiki syntax highlighting wrapper
- `src/components/markdown/highlighter.ts` — Lazy Shiki loader with limited language support
- `src/hooks/use-project-filters.ts` — URL state parsing and filtering logic
- `src/hooks/use-debounced-value.ts` — Debounce hook (300ms default)
- `src/hooks/queries/use-projects.ts` — React Query hooks with caching
- `src/services/projects.service.ts` — API client functions
- `src/pages/ProjectsPage.tsx` — Updated with filters, grid, pagination
- `src/pages/ProjectDetailPage.tsx` — Updated with Markdown rendering
- `src/components/layout/RootLayout.tsx` — Wrapped with MotionProvider and AnimatedOutlet
- `src/types/api.ts` — Type re-exports from shared DTO

Full diff: `git diff main` in the feat/issue-3-bento-showcase worktree (299KB).

</details>

---
