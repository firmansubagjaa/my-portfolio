## Summary

Replaces the admin CMS's native `<select>` with a hand-ported shadcn/ui "base-nova" Select built on Base UI. Client-only change.

- `client/src/components/ui/Select.tsx`: native select replaced by the Base UI primitives plus a labeled `SelectField` wrapper. Header comment warns against `shadcn add select` (it would overwrite this PascalCase file on a case-insensitive FS).
- `client/src/pages/admin/DashboardPage.tsx`: Kategori / Status filters use `SelectField`. "Semua …" is Base UI's documented `null` item; state stays `ProjectCategory | ""` via `value={x || null}` / `v ?? ""`, so no empty string reaches Base UI and the query builder still drops the empty filter.
- `client/src/components/form/ProjectForm.tsx`: category/status moved from `register` to RHF `Controller` + `SelectField`. `field.ref` goes to the trigger so focus-on-error works; `aria-invalid`, `aria-required`, `aria-describedby` are kept on the trigger.
- `client/src/lib/utils.ts`: shadcn `cn` (clsx + tailwind-merge), admin-only. Public `@/lib/cn` unchanged.
- `client/components.json`: hand-written shadcn config (base-nova, `cssVariables: false`, utils → `@/lib/utils`).
- `client/tests/select-field.test.tsx` + `test: bun test` script: 4 SSR tests.

## New dependencies (pinned exact)

- `@base-ui/react@1.8.0`
- `clsx@2.1.1`
- `tailwind-merge@3.7.0`

Transitive: `@floating-ui/*`, `@base-ui/utils`, `reselect`, `use-sync-external-store`. No lucide-react, tw-animate-css, or shadcn CLI (transitions use Base UI `data-starting-style`/`data-ending-style` with `motion-reduce:transition-none`).

## Token mapping

Component classes were rewritten to the project's existing tokens instead of adding shadcn CSS variables, so nothing was added to `globals.css`. This avoids the shadcn `accent` collision: item highlight uses `data-highlighted:bg-border` (not `bg-accent`), and the amber `accent` is used only where it already means brand accent (focus ring, focused border, selected-item check). Popup: surface bg, fg text, border color.

## Verification

- `bun run typecheck`: 0 errors
- `bunx biome check . --line-ending=auto`: only the 2 pre-existing diagnostics (`src/types/api.ts`, `globals.css`); none in changed files
- `bun run test`: 4 pass, 0 fail
- `bun run build`: ok
- Bundle isolation: entry JS is byte-identical to baseline (266.22 kB / 85.14 kB gzip). Base UI and tailwind-merge strings appear only in the admin `use-admin-projects-*` chunk; `index.html` preloads none of it. Shared CSS +0.77 kB gzip from new utilities.
- Browser (headless Chrome via local CDP, real mouse/keyboard input): 30 checks pass — combobox role + label link, popup layering above header (z-40) and sticky action bar (z-10), mouse & keyboard selection (Arrow keys, type-ahead, Enter, Escape, Space), filter → query param mapping, create-form defaults and validation focus, edit-page preselection.

## Screenshots

In `.agents/tasks/feat-shadcn-select/screenshots/` (local, not committed):
`01-dashboard-closed.png`, `02-dashboard-category-open.png`, `03-dashboard-filtered-category.png`, `04-keyboard-focus-ring.png`, `05-keyboard-typeahead.png`, `06-dashboard-filtered-status.png`, `07-create-category-open.png`, `08-create-status-open.png`, `09-create-validation.png`, `10-edit-preselected.png`, `11-edit-category-open.png`

## Known non-blocking items

- `components.json` declares `iconLibrary: "lucide"` but lucide-react isn't installed; a future `shadcn add` will emit unresolved imports.
- `client/tests/select-field.test.tsx` is outside tsc `include`, so it isn't type-checked.
- Not tested automatically: `onValueChange` on selection, ProjectForm Controller integration, Dashboard filter-to-query mapping (covered by the manual browser run).
