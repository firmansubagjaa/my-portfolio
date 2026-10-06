# Verification: feat/shadcn-select (iteration 1)

All commands ran from `d:\File Defir\Projects\My Portfolio\.worktrees\shadcn-select\client` unless noted.

## Environment notes
- `bun run typecheck` and `bun run build` need `server/node_modules` (the client tsconfig includes `../server/src/shared`, which imports `zod`). I ran `bun install` in the worktree `server/`. It rewrote `server/bun.lock`, so I reverted that with `git checkout -- server/bun.lock`. No server files changed.
- The worktree is checked out with `core.autocrlf=true`, so every tracked file is CRLF on disk. Plain `bun run lint` (biome, LF formatter) flags formatting on about 77 untouched files on the **untouched baseline** too. That noise comes from the environment, not from this change. Comparable lint: `bunx biome check . --line-ending=auto` (= CRLF on Windows). Git stores LF, so the committed content matches the repo's normal LF formatting.

## Baseline (before any change)
- typecheck: 0 errors (after server deps installed)
- lint (`--line-ending=auto`/crlf): **1 error** (`src/types/api.ts` organizeImports, pre-existing) + **1 warning** (`src/styles/globals.css` noDescendingSpecificity, pre-existing)
- build entry chunk: `dist/assets/index-DHtMBOcC.js 266.22 kB │ gzip 85.14 kB`, `dist/assets/index-BBY9ne7B.css 75.15 kB │ gzip 23.56 kB`

## After
| Command | Result |
|---|---|
| `bun install` | ok; `bun add --exact @base-ui/react@1.8.0 clsx@2.1.1 tailwind-merge@3.7.0` (+11 transitive pkgs) |
| `bun run typecheck` | 0 errors |
| `bunx biome check . --line-ending=auto` | 1 error + 1 warning, the **same two pre-existing** diagnostics; none in changed/new files |
| `bun run test` (new: `bun test`) | 4 pass, 0 fail (`tests/select-field.test.tsx`) |
| `bun run build` | ok |
| cn sanity: `cn('w-fit px-2 bg-bg text-sm text-fg','w-full px-3')` | `bg-bg text-sm text-fg w-full px-3` (custom tokens survive, conflicts merged) |

npm check (`npm view`): `@base-ui/react` latest = 1.8.0 (peers react/react-dom ^17–19, optional date-fns/@date-fns/tz not installed), `clsx` 2.1.1, `tailwind-merge` 3.7.0. All three are well-known and all are pinned exact. No lucide-react, tw-animate-css or shadcn CLI.

### Bundle / chunk listing (relevant lines)
```
dist/assets/index-DI1E9frV.css            79.34 kB │ gzip:  24.33 kB   (baseline 75.15 / 23.56)
dist/assets/index-qYuzh-GS.js            266.22 kB │ gzip:  85.14 kB   (baseline 266.22 / 85.14 — identical size)
dist/assets/DashboardPage-B1BElfOr.js     13.61 kB │ gzip:   4.28 kB
dist/assets/use-admin-projects-rhAurGf6.js 150.75 kB │ gzip: 51.34 kB  (admin-only shared chunk)
dist/assets/ProjectEditorPage-D7Ywph3J.js 908.72 kB │ gzip: 317.07 kB
```
String search over `dist/assets/*.js`:
- `base-ui`, `select-trigger`, `alignItemWithTrigger`, `data-highlighted` → only `use-admin-projects-rhAurGf6.js`
- tailwind-merge config strings `fvn-spacing`, `overscroll-x` → only `use-admin-projects-rhAurGf6.js`
- `use-admin-projects-*` is imported by `DashboardPage-*` and `ProjectEditorPage-*`. `index.html` modulepreloads only `rolldown-runtime`, `react`, `jsx-runtime`, `api-client`, so the new deps are **not** in the public entry.
- The single global CSS file grew by about 4.2 kB raw (0.77 kB gzip) from the new utility classes (Tailwind emits one CSS file for the whole app).

## Browser verification
Setup, without touching the user's servers on 3000/5173 (both stayed up the whole time):
- copied `server/.env` into the worktree `server/` (gitignored by `server/.gitignore`; contents never printed). Deleted afterwards.
- backend: `$env:PORT="3004"; bun src/index.ts` (worktree server), background
- client: `bunx vite --config vite.verify.config.ts`, a **temporary untracked** config that `mergeConfig`s `vite.config.ts` with `port 5175` and `/api/v1 → http://localhost:3004`. `vite.config.ts` was not edited. I deleted the temp config afterwards.
- driver: a local CDP script (Bun + headless Chrome, real `Input.dispatchMouseEvent`/`dispatchKeyEvent`). I used this instead of kane-cli so nothing leaves the machine. The script read the admin password from the copied .env itself. The script lived in %TEMP% and has been deleted.
- data: 2 projects in the DB (`AI/ML/Published`, `Backend/Published`). No data was modified: the create form was submitted empty (client-side validation only) and the edit form was never submitted.

Full log: `screenshots/browser-log.txt`. Final run: **RESULT: ALL PASS** (30 checks). Summary:

| Check | Result |
|---|---|
| Triggers are `role=combobox`, `aria-labelledby` → "Kategori" / "Status" label (Base UI Select.Label) | PASS |
| Trigger height 38px = search Input height | PASS |
| Dashboard defaults "Semua Kategori" / "Semua Status" (null item) | PASS |
| Category popup topmost at 5 probe points (Positioner z-50 > header z-40); colors bg `rgb(28,25,23)`=surface, text `rgb(250,250,249)`=fg, border `rgb(41,37,36)`=border | PASS |
| Select "AI/ML" by mouse → request `/api/v1/admin?page=1&limit=10&category=ai_ml`, rows all AI/ML | PASS |
| "Semua Kategori" → trigger reset, rows identical to initial (served from React Query cache, no category param) | PASS |
| Tab from search → Tab → status trigger; `:focus-visible` true, amber 2px ring box-shadow + amber border | PASS |
| ArrowDown opens; ArrowDown moves highlight (Semua Status → Draft); type-ahead `p` → Published | PASS |
| Enter selects Published → rows all Published; focus stays on trigger | PASS |
| Enter opens; Escape closes, focus back on trigger, value unchanged | PASS |
| Space opens; select "Semua Status" resets | PASS |
| Create page: defaults Fullstack / Draft; labels "Kategori*" / "Status*", `aria-required=true`; hidden inputs `name=category value=fullstack`, `name=status value=draft` | PASS |
| Create: category popup topmost; changing to Backend works | PASS |
| Create: status select scrolled next to the sticky action bar (z-10), popup topmost over it | PASS |
| Create: submit empty → focus moves to first invalid field (`title`); title/slug/summary `aria-invalid`; selects not invalid (always valued) | PASS |
| Edit page: triggers show the saved "AI/ML" / "Published"; the open list marks AI/ML `aria-selected=true` | PASS |

The select error state (`aria-invalid` + `aria-describedby` → error `<p>`) can't be reached from the UI, because category/status always have a value. The SSR test `links the error message and marks the trigger invalid` covers it instead. The browser run verified the label link (`aria-labelledby`), since Base UI sets it in a client effect.

ConfirmDialog contains no select, so there is no in-dialog case to check. The popup portals to `<body>` at z-50.

### Screenshots (`d:\File Defir\Projects\My Portfolio\.agents\tasks\feat-shadcn-select\screenshots\`)
- `01-dashboard-closed.png`: filters with "Semua Kategori" / "Semua Status"
- `02-dashboard-category-open.png`: category popup open under the trigger, check on the current item
- `03-dashboard-filtered-category.png`: filtered to AI/ML (1 row, "Reset filter" visible)
- `04-keyboard-focus-ring.png`: status trigger focused via Tab (amber ring)
- `05-keyboard-typeahead.png`: status popup opened by keyboard, "Published" highlighted by type-ahead
- `06-dashboard-filtered-status.png`: filtered to Published
- `07-create-category-open.png`: create form, category popup open
- `08-create-status-open.png`: create form, status popup over the sticky action bar
- `09-create-validation.png`: submit without required fields (errors, focus on title)
- `10-edit-preselected.png`: edit page with saved AI/ML / Published
- `11-edit-category-open.png`: edit page category popup, AI/ML checked

## Cleanup
- Stopped the processes on 3004 and 5175, plus the headless Chrome on 9337. The user's servers on 3000 and 5173 are untouched and still listening.
- Deleted: worktree `server/.env`, `client/vite.verify.config.ts`, `client/dist`, the temp CDP script and Chrome profile, and the temp logs.
- `git status` before commit showed only the intended files.
