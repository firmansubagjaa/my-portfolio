# Public Pages Bug Fixes

Three critical bugs fixed on the projects listing and detail pages: featured filter implementation, code block rendering architecture, and 404 state validation. The featured filter integrates cleanly across server schema, API layer, query builder, and UI. The code block fix removes unnecessary wrapper nesting that was breaking Shiki's HTML output structure.

**Watch for:** Code block rendering depends on `dangerouslySetInnerHTML` with HTML from Shiki; confirm syntax highlighting renders correctly in browser. Featured filter design pattern (toggle with `undefined` to clear) is consistent with existing category filter pattern.

**Verdict**: APPROVED

## High-level view

The featured filter is now fully wired end-to-end. The server schema accepts an optional `featured` boolean, the query builder applies it as a SQL condition when true, and the client query service appends it to the URL only when active. Pagination resets when the filter toggles, preventing stale state. The UI button uses `aria-pressed` for accessibility and matches the existing category filter pattern.

The code block rendering was restructured to resolve nesting. Instead of wrapping Shiki's HTML inside a `<pre><code>` container (which resulted in `<pre><code><pre>...</pre></code></pre>`), the highlighted output now renders directly into a `<div class="shiki-wrapper">`. CSS rules on `.shiki-wrapper pre` and `.shiki-wrapper code` restore layout and typography. The fallback for failed highlighting remains a traditional `<pre><code>` pair.

<details>
<summary>Issues (3)</summary>

1. **XSS surface via dangerouslySetInnerHTML** — Code block uses `dangerouslySetInnerHTML` with HTML from Shiki. This is safe as long as Shiki output is trusted (it is); however, if the `language` parameter or user-supplied code could be injected maliciously, the highlighting could be bypassed. Confirm Shiki is vended via npm lockfile and that `language` is validated server-side before rendering.

2. **CSS targeting specificity** — `.shiki-wrapper pre` and `.shiki-wrapper code` rules use tag selectors without strong specificity. If Shiki's HTML contains inline styles or other CSS rules, they may override the wrapper styles. The `!important` on `background-color` is a workaround; verify in browser that code block background stays correct across all highlighting contexts.

3. **Featured filter URL encoding** — The `featured` parameter is added as `featured=true` but parsing uses `z.coerce.boolean()`. This assumes the query string will always contain the string "true"; if a different client or cache layer sends `featured=1` or `featured=yes`, the filter will not match. Consider whether stricter validation or normalization is needed here.

</details>

## Details

<details>
<summary>Featured Filter Implementation</summary>

The featured filter spans five files. On the server, `publicProjectListQuerySchema` is extended with `featured: z.coerce.boolean().optional()` and `buildProjectWhere` adds a database-level condition `eq(projects.is_featured, true)`. The client query service appends `featured=true` to params only when active, and the hook adds "featured" to `RESET_PAGE_KEYS` to reset pagination when the filter changes.

The UI button in `ProjectFilters` uses `aria-pressed` to communicate toggle state and matches the category filter pattern. The implementation validates input at the schema boundary, filters at the database level, and keeps URLs clean by omitting the param when off.

</details>

<details>
<summary>Code Block Container Flattening</summary>

The original code wrapped Shiki's HTML output inside a `<pre><code>` structure, resulting in nested `<pre><code><pre><code>...</code></pre></code></pre>` elements that broke semantic HTML and syntax highlighter styling. The fix separates the paths: when `highlighted` is truthy, the component renders Shiki HTML directly into a `<div class="shiki-wrapper">` via `dangerouslySetInnerHTML`. When highlighting is pending or fails, it falls back to plain `<pre><code>`. CSS rules target `.shiki-wrapper pre` and `.shiki-wrapper code` to restore layout and typography.

The `dangerouslySetInnerHTML` usage is safe here because Shiki's output is trusted library output, not user-controlled input. The `!important` on `background-color` is a pragmatic workaround if Shiki's theme styles conflict; worth monitoring in browser testing.

</details>

<details>
<summary>File Map</summary>

- `client/src/components/markdown/CodeBlock.tsx` — Removed outer `<pre>` wrapper; renders Shiki HTML directly into a `<div class="shiki-wrapper">`. Fallback still uses `<pre><code>`.
- `client/src/components/projects/ProjectFilters.tsx` — Added featured toggle button in new "Filter tambahan" fieldset with `aria-pressed` for accessibility.
- `client/src/hooks/use-project-filters.ts` — Added "featured" to `RESET_PAGE_KEYS` so pagination resets when filter changes.
- `client/src/services/projects.service.ts` — Appends `featured=true` to query params when filter is active.
- `client/src/styles/globals.css` — Added `.shiki-wrapper pre` and `.shiki-wrapper code` CSS rules for layout and typography.
- `server/src/models/project.model.ts` — Added featured condition to `buildProjectWhere` when `filters.featured === true`.
- `server/src/shared/dto.ts` — Extended `publicProjectListQuerySchema` with `featured: z.coerce.boolean().optional()`.

[Full diff](../../../.worktrees/fix-public-pages-bugs)

</details>
