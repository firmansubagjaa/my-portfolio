# Implementation Plan: Fix Critical Bugs in Public Pages

## Overview
Three high-priority bugs affecting the public projects page and project detail page. All fixes are minimal and focused on functionality without visual redesign.

---

## Bug #1: 404 Slug Error State (ProjectDetailPage)

**Current State:** ProjectDetailPage.tsx checks for `error` and `!project`, but only displays a generic error message when the API errors. No proper handling of not-found (404) slug.

**Root Cause:** When a slug doesn't exist, `useProject` hook should handle the 404 response gracefully and distinguish it from an API error. The component has a fallback for `!project` (no data returned), but the hook may not be distinguishing 404 errors from other failures.

**Fix Approach:** 
- ProjectDetailPage.tsx already has the UI fallback for `!project` (line 32: "Proyek tidak ditemukan").
- Verify that the `useProject` hook returns `data: undefined` and `error: null` when a 404 occurs (vs returning `error: NotFoundError`).
- If the API client doesn't treat 404 as "no data" (instead treats it as an error), adjust the error handling in ProjectDetailPage to check for 404 status and render the not-found UI instead of the error UI.

**Files to modify:**
- `d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client\src\pages\ProjectDetailPage.tsx`
- `d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client\src\services\api-client.ts` (if needed, to verify 404 handling)

**Verification:**
1. Start dev server: `cd d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client && npm run dev`
2. Navigate to http://localhost:5173/projects/non-existent-slug-12345
3. Confirm page displays "Proyek tidak ditemukan" (or similar 404 message) instead of a blank page or generic error.
4. Confirm no console errors and page is interactive (back link works).

---

## Bug #2: Featured Filter Broken (ProjectsPage/ProjectFilters)

**Current State:** ProjectFilters.tsx only has category and search filters. No featured filter toggle.

**Root Cause:** The featured filter UI component is missing entirely. Backend already supports `is_featured` field and orders projects by featured first (`orderBy(desc(projects.is_featured), desc(projects.created_at))`), but:
1. No query parameter in PublicProjectListQuery for featured filter
2. No UI toggle in ProjectFilters
3. Service doesn't pass featured parameter to API

**Fix Approach:**
1. **Extend PublicProjectListQuery schema** in `server/src/shared/dto.ts` to accept optional `featured` boolean parameter.
2. **Update buildProjectWhere()** in `server/src/models/project.model.ts` to filter by `is_featured = true` if `featured: true` is passed.
3. **Add featured filter button** in `client/src/components/projects/ProjectFilters.tsx`:
   - Add "Featured" toggle button next to the "All" button in the category filter section, or as a separate fieldset.
   - Wire it to `filters.featured` state.
   - Use same styling as category buttons (rounded pill, toggle background).
4. **Update projects service** in `client/src/services/projects.service.ts` to pass `featured` parameter to query string if set.
5. **Update hook** in `client/src/hooks/use-project-filters.ts` to include `featured` in RESET_PAGE_KEYS so pagination resets when featured is toggled.

**Files to modify:**
- `d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\server\src\shared\dto.ts`
- `d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\server\src\models\project.model.ts`
- `d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client\src\components\projects\ProjectFilters.tsx`
- `d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client\src\services\projects.service.ts`
- `d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client\src\hooks\use-project-filters.ts`

**Verification:**
1. Seed the database with at least 2-3 projects marked `is_featured: true` and 2-3 with `is_featured: false`.
2. Start backend: `cd d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\server && npm run dev`
3. Start frontend: `cd d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client && npm run dev`
4. Navigate to http://localhost:5173/projects
5. Confirm "Featured" toggle button appears in filter section.
6. Click "Featured" toggle — confirm only projects with `is_featured: true` display.
7. Confirm page count/pagination updates correctly when filter changes.
8. Click toggle again — confirm all projects (featured and non-featured) display.
9. Confirm URL query param includes/excludes `featured=true` as appropriate.

---

## Bug #3: Code Block Triple-Layered Container (CodeBlock Component)

**Current State:** CodeBlock.tsx renders:
```
<pre>
  {highlighted ? <code dangerouslySetInnerHTML /> : <code>{code}</code>}
</pre>
```

When Shiki produces HTML, it returns a full `<pre><code>...</code></pre>` structure. Inserting this into `<pre><code dangerouslySetInnerHTML />` creates:
```
<pre>
  <code>
    <pre><code>...</code></pre>  <!-- Nested pre/code from Shiki HTML -->
  </code>
</pre>
```

**Root Cause:** Shiki's `codeToHtml()` returns a complete HTML `<pre>` element, not just the inner code. Setting `dangerouslySetInnerHTML` on the `<code>` tag embeds the full Shiki output (including nested `<pre>` and `<code>`) instead of just the highlighted content.

**Fix Approach:**
1. Extract the inner HTML from Shiki's output (the `<code>` inner content only).
2. Or: Use Shiki's `codeToTokens()` method (if available) to get tokens and build the DOM without HTML parsing.
3. Simpler approach: Parse the Shiki HTML output to extract only the code token content, then render into a single `<pre><code>` wrapper.

**Implementation:**
- Modify `CodeBlock.tsx` to either:
  - Option A: Use a wrapper div, set `dangerouslySetInnerHTML` on the wrapper, let the contained Shiki `<pre>` render as-is (remove the outer `<pre>` from CodeBlock).
  - Option B: Extract inner HTML from Shiki output and render only the tokens inside CodeBlock's `<pre><code>`.
  
  Recommend **Option A** (simpler, avoids string parsing):
  - Remove the outer `<pre>` from CodeBlock.
  - When Shiki HTML is ready, render it directly in a container div with `dangerouslySetInnerHTML`.
  - Style the Shiki-generated `<pre>` with CodeBlock's padding/border/bg classes via CSS (`.shiki { padding: 1rem; border-radius: 0.5rem; ... }`).

**Files to modify:**
- `d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client\src\components\markdown\CodeBlock.tsx`
- Possibly `d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client\src\styles\globals.css` to add `.shiki` styling if not already present.

**Verification:**
1. Create or find a project with markdown content containing a code block (e.g., `\`\`\`typescript ... \`\`\``).
2. Start frontend dev server: `cd d:\File Defir\Projects\My Portfolio\.worktrees\fix-public-pages-bugs\client && npm run dev`
3. Navigate to http://localhost:5173/projects/<slug> (a project with code blocks).
4. Inspect the rendered code block with browser DevTools (F12).
5. Confirm the DOM shows a single `<pre><code>...</code></pre>` structure (no nested pre/code tags).
6. Confirm syntax highlighting is applied (colored tokens for keywords, strings, etc.).
7. Confirm the code block is readable and has proper padding/background/border styling.
8. Scroll the page and confirm no layout shifts or rendering artifacts.

---

## Execution Order
1. **Bug #3 (Code Block)** — Fix first because it's isolated to one component. Verify syntax highlighting works correctly.
2. **Bug #2 (Featured Filter)** — Requires schema changes, model changes, and UI. Test in browser to confirm filtering works.
3. **Bug #1 (404 State)** — Test last to confirm 404 page renders correctly. May require only a verification step if the code is already correct.

---

## Build & Test Commands (from package.json)
- **Client dev:** `npm run dev` (runs Vite on port 5173)
- **Client build:** `npm run build` (tsc + vite build)
- **Client typecheck:** `npm run typecheck`
- **Client lint:** `npm run lint`
- **Server dev:** (assumed) `npm run dev` (runs Hono dev server on port 3000)
- **Frontend tests:** `npm run test` (bun test)

---

## Notes
- All fixes maintain backwards compatibility.
- No breaking changes to API or UI.
- Code style follows existing patterns: Tailwind for styling, Zod for schema validation, React hooks for state.
- Indonesian UI text (already in place).
- No visual redesign — only bug fixes and functional completeness.
