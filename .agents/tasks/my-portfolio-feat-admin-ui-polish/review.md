# Admin CMS restyled on dark theme tokens

The admin surface (login, dashboard, project editor, admin shell, shared form primitives) moves off a leftover light theme (`bg-white`, `neutral-*`, `blue-*` focus rings) onto the site's `@theme` tokens. The commit also fixes several functional bugs found along the way: login didn't redirect to the dashboard (the stale `["auth","me"]` cache bounced the user back), admin pagination never rendered (the service dropped the envelope), every `ApiClientError.message` was empty, zod 4 broke `@hookform/resolvers` 3.x so invalid forms failed silently, gallery multi-upload kept only the last file, and the md-editor stayed on GitHub-dark. Server code, `server/.env`, `.testmuai/` and `auth.controller.ts` are untouched, and the branch is one commit on a clean tree.

Watch for: the advisory slug check only ever shows its "cannot check" branch, because a pre-existing backend route-order bug makes `/check-slug` hit `/:id` (likely, documented by the coder). Three flows were not verified in the browser: edit-with-loaded-data, logout click, and the mobile header after its last fix (confirmed gaps in verification.md). Small shared-primitive changes leak to the public site (confirmed).

**Verdict**: APPROVED

## High-level view

The theme work holds up. A grep of the admin files for `neutral-`, `gray-`, `bg-white`, `blue-`, `-100`, `alert(`, `as any` and `: any` returns nothing. The only `text-white` left is on the danger button and on a black-overlay icon button over gallery images. Both are deliberate and readable. The screenshots show readable headings, table headers, cells and filter controls on `#0c0a09`/`#1c1917`, with no white blocks.

Button colors now live only in variants, because `cn()` is a plain join. The new `danger` variant is what makes "Hapus" red (03-dashboard.png), not a className override that would lose to `bg-surface`. `buttonClasses()` lets router Links look like buttons without nesting interactive elements. Card got a `padding` prop for the same reason.

The data layer is now typed end to end. `getAdminProjects` returns `{items, pagination}` from the envelope. `useAdminProject` is disabled on `/new`. The list keeps previous data, so the search input doesn't unmount. Stats come from one 50-row request counted client-side, with a sequential per-status fallback. That fallback works around the server's single-connection DB pool, not a client design choice.

Accessibility is substantially better. Inputs, selects, textareas, the checkbox and the md-editor textarea all get `useId` labels with `aria-invalid`/`aria-describedby`. ConfirmDialog has role/aria-modal/labelledby, Escape, Tab trap, scroll lock and initial focus on "Batal". Icon-only and repeated-label buttons carry contextual `aria-label`s. The global `:focus-visible` outline was invalid CSS on main and is now a real accent ring.

Behavior is preserved apart from two intended changes. Filters, delete confirm, the 409 slug banner and uploads keep working. Slug availability is now checked on blur instead of on every keystroke, and editing no longer warns about the project's own slug. The remaining gaps are environmental: browser coverage was cut short by a flaky remote DB and a pre-existing backend routing bug.

<details>
<summary>Issues (5)</summary>

1. **Mobile header not re-verified** — 07-dashboard-mobile.png still shows "Lihat Situs" wrapping into the "Proyek" nav pill. The code fix (`sr-only sm:not-sr-only`) looks correct but was never re-captured. Re-screenshot at 375px before merging.
2. **Edit and logout flows unverified in browser** — edit page with loaded data and the logout click were not exercised (verification.md #15, #16). Run both once the DB is stable.
3. **Slug check unusable until backend route order is fixed** — `GET /check-slug` registered after `GET /:id` returns 400, so the spinner→✓/⚠ path was never seen live. File a follow-up to move the route above `/:id` (out of scope here).
4. **Focus lost after successful delete** — ConfirmDialog restores focus to the row's "Hapus" button, which no longer exists once the row is gone, so focus falls to `<body>`. Move focus to the list or heading on success.
5. **Shared primitives changed public visuals** — Card `rounded`→`rounded-lg`, Button `md` text `base`→`sm`, and CATEGORY_LABELS ("Full-Stack"→"Fullstack", "AI / ML"→"AI/ML") also affect public pages. Glance at the public project list and RouteErrorFallback to confirm the change is acceptable.

</details>

<details>
<summary>Details</summary>

### Verification evidence and what it doesn't cover

verification.md records `typecheck` exit 0, `build` exit 0 (compiled CSS checked for `body{background-color:var(--color-bg)}` and the accent outline), and `biome check` on all 32 changed files at 0 errors. Repo-wide lint is 66 errors, down from the 94 on main, and none are in changed files. All 11 recorded screenshots exist in `browser/shots/`. kane-cli was replaced by a CDP script so computed styles and focus could be asserted. That is an acceptable deviation, since it still drives a real Chrome and wrote nothing to `.testmuai/`.

The confirmed gaps are pagination (N/A, only 2 projects), the edit page with real data, the logout click, and a post-fix mobile header capture. 07-dashboard-mobile.png predates the header fix and visibly shows "Lihat Situs" stacking over the nav. The new markup collapses it to an icon with an sr-only name below `sm`, which should resolve it, but nothing visual confirms that.

### Login redirect and error feedback

`useLogin` now seeds `["auth","me"]` with the login response instead of invalidating an inactive query. That is the right fix for the "logged in but stays on the login page" reports, and it was confirmed in the browser (redirect lands on /admin). `ApiClientError` finally carries the server message, and a non-JSON body (proxy error page while the API is down) becomes a typed `INTERNAL_ERROR` instead of a raw JSON parse exception. LoginPage maps 401, 429, 400/422 and everything else to distinct Indonesian banners in a `role="alert"` region and honors `location.state.from`. 02-login-wrong-password.png shows the 401 banner. The 429 branch is mapped in code (confirmed) but was not exercised, which is reasonable given the 5-per-15-min limiter.

`auth.service.ts` drops the unused `ProjectDTO` import and types both login and `/me` as `AuthUser {id, username}`.

### Custom zod 4 resolver

`lib/zod-resolver.ts` replaces `@hookform/resolvers` for ProjectForm and LoginPage. It nests issues by path and keeps the first message per field, which is enough for the flat and one-level schemas here. It's a deliberate local workaround that avoids adding a dependency. Upgrading `@hookform/resolvers` to a zod-4-aware version later would let it be deleted.

### ConfirmDialog

The dialog has `role="dialog"`, `aria-modal`, `aria-labelledby`/`aria-describedby` via `useId`, Escape to cancel (suppressed while deleting), a Tab/Shift+Tab trap, body scroll lock, initial focus on "Batal", and focus restore on unmount. React 19 is in use, so passing `ref` as a plain prop to `Button` works. The coder's CDP assertions confirm Batal receives focus (06-delete-dialog.png shows the ring). The weak spot is the restore target after a successful delete. The previously focused "Hapus" button belongs to the row that was just removed, so `previouslyFocused.focus()` is a no-op and keyboard users land on `<body>` (likely). A delete error keeps the dialog open with an inline `role="alert"` message plus a toast.

### Dashboard

The desktop table sits behind `hidden md:block overflow-x-auto` with a `caption`, `scope="col"` headers and an sr-only "Aksi" column. Below `md` there is a card list. 07-dashboard-mobile.png shows no horizontal overflow. Category cells use `CATEGORY_LABELS` (AI/ML, Backend in 03-dashboard.png). Status uses `success`/`warning`/new `neutral` badges, and Featured uses a new `accent` badge. Filter changes reset to page 1, and the debounced search resets the page through an effect. A second effect steps back when a delete empties the last page, guarded by `isPlaceholderData` so it doesn't fire on stale data. The "Lihat" link only appears for published projects.

### Project editor

The form is grouped into four Cards with a sticky action bar. In 08-create-project.png the bar appears mid-page only because that is a full-page capture of a sticky element. Slug availability is now checked on blur of slug (and title, in create mode). The result shows only when it matches the current field value, and the check is skipped when the slug equals the project's own slug in edit mode. Because of the backend route-order bug, the only live state seen is "Tidak dapat memeriksa ketersediaan slug…" (09-create-slug-available.png, misnamed). The 409 banner path is unchanged in behavior. The page swallows 409 so the form can render its own banner, and every other error goes to the external banner. Both banners scroll into view. The edit page now tells a 404 ("tidak ditemukan") apart from other failures ("Gagal memuat" + retry), shown in 11-edit-load-error-state.png.

### Uploads and md-editor

Gallery multi-upload appends through a ref, so concurrent uploads no longer overwrite each other. It tracks an in-flight count instead of a single mutation's `isPending`, and errors are keyed by file name. Both drop zones are now real `<button>`s, and `alert()` is gone from uploads and TagInput. The md-editor override needed `[data-color-mode]` specificity to beat the lazily loaded library CSS. Screenshots show toolbar, textarea and preview on the surface/bg tokens.

### Spill-over onto the public site

`globals.css` now actually applies the body background and focus ring site-wide. Main had both as invalid CSS, so this is a fix, but it does change the public pages. Card's default radius moved from `rounded` to `rounded-lg`, Button `md` dropped from `text-base` to `text-sm`, and the CATEGORY_LABELS rename shows up on public cards and filters (the plan accepted the rename). None of these were screenshotted on public routes.

</details>

<details>
<summary>File map</summary>

- `client/src/styles/globals.css`: fixed invalid `@apply` token syntax and added the md-editor token override
- `client/src/components/ui/Button.tsx`: `danger` variant, `buttonClasses()`, default `type="button"`, spinner keeps label
- `client/src/components/ui/{Badge,Card,Skeleton}.tsx`: `neutral`/`accent` badges, Card `padding` prop, Skeleton `tone`
- `client/src/components/ui/{Input,Select,Textarea,Checkbox,Label,FieldError}.tsx`, `field-styles.ts`: tokenized controls, `useId` labels, aria wiring
- `client/src/components/ui/ConfirmDialog.tsx`: accessible modal with focus trap and inline error
- `client/src/components/form/*`: tokenized uploads/tags/md-editor, gallery race fix, shared `upload-utils.tsx`, ProjectForm regrouped with on-blur slug check
- `client/src/components/layout/AdminLayout.tsx`: sticky header with nav, "Lihat Situs", user, logout
- `client/src/pages/admin/{LoginPage,DashboardPage,ProjectEditorPage}.tsx`: redesigned pages
- `client/src/router/ProtectedRoute.tsx`: dark loading state with visible text
- `client/src/services/{api-client,auth.service,admin-projects.service,upload.service}.ts`: error message plumbing, typed auth/admin APIs, envelope pagination
- `client/src/hooks/queries/{use-auth,use-admin-projects}.ts`: login cache seeding, stats hook, typed filters
- `client/src/lib/zod-resolver.ts`: zod 4 resolver
- `client/src/config/constants.ts`: label updates and `STATUS_LABELS`

Full diff: `git diff main` in `.worktrees/admin-ui-polish`.

</details>
