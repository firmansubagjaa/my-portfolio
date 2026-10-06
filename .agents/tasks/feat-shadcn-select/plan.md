# Implementation Plan: shadcn/ui Select (Base UI) for the admin CMS

Worktree (use absolute paths only; relative paths land in the parent workspace):
`d:\File Defir\Projects\My Portfolio\.worktrees\shadcn-select` (branch `feat/shadcn-select`). All commands run from
`d:\File Defir\Projects\My Portfolio\.worktrees\shadcn-select\client`. Do not edit `server/`. Do not touch
`.worktrees\fix-upload-mime`. Do not start anything on ports 3000/3003/5173.

Real commands (client/package.json): `bun install`, `bun run typecheck` (tsc --noEmit), `bun run lint`
(biome check . — includes formatting; files use tabs, lineWidth 100), `bun run lint:fix`, `bun run build`
(tsc && vite build). There is no client test runner today; item 6 adds a dependency-free one (`bun test`).

## Decisions (made during exploration)

- D1. Manual install, not the CLI. Registry source for the Base UI variant was read from
  `https://ui.shadcn.com/r/styles/base-nova/select.json`. `shadcn init` is interactive, rewrites globals.css with a
  full oklch theme (incl. a conflicting `--accent`), and pulls tw-animate-css + an icon lib. We hand-write
  `components.json` (so future CLI use works) and port the component code with token edits.
- D2. Deps, pinned exact via `bun add --exact` (all verified on npm 2026 registry):
  - `@base-ui/react@1.8.0` (the package shadcn's base registry imports; formerly `@base-ui-components/react`).
    Peer deps react/react-dom ^19 OK; `date-fns`/`@date-fns/tz` peers are optional → not installed.
  - `clsx@2.1.1`, `tailwind-merge@3.7.0` (v3 = Tailwind v4 support).
  - NOT added: `lucide-react` (3 tiny icons are inlined as SVG, matching the inline-SVG style already used in
    ProjectForm), `tw-animate-css` (animate-in/out classes replaced by Base UI `data-starting-style`/
    `data-ending-style` transitions), `shadcn` CLI (not a runtime dep).
- D3. cn(): `src/lib/cn.ts` (plain join) is imported by Button/Card/Badge/Skeleton/Label → public entry chunk.
  Upgrading it in place would put clsx + tailwind-merge (~8 KB gzip) into the public entry, violating the
  hard "new deps out of the public entry chunk" constraint. So: add the standard shadcn helper at
  `src/lib/utils.ts` (`cn = twMerge(clsx(...))`), used only by the shadcn component (admin-only), and point
  `components.json` `aliases.utils` at `@/lib/utils`. `src/lib/cn.ts` and all existing callers stay unchanged.
  This deliberately deviates from the brief's "upgrade cn where it lives"; the bundle constraint wins. Mention it in
  the final summary.
- D4. Token mapping: do NOT add shadcn CSS variables to globals.css (the existing `--color-accent` amber is used
  site-wide as `bg-accent`, `outline-accent`, `accent-accent`; shadcn's `accent` means "hover bg"). Instead the ported
  component classes are rewritten to existing tokens:

  | shadcn class | replacement |
  |---|---|
  | `bg-popover`, `text-popover-foreground` | `bg-surface`, `text-fg` |
  | `border-input`, `bg-transparent`, `dark:bg-input/30`, `dark:hover:bg-input/50` | `border-border`, `bg-bg`, `hover:border-muted/50` |
  | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` | `focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30` |
  | `aria-invalid:border-destructive aria-invalid:ring-*destructive*` | `aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500/30` |
  | `data-placeholder:text-muted-foreground`, `text-muted-foreground` | `data-placeholder:text-muted`, `text-muted` |
  | item `focus:bg-accent focus:text-accent-foreground` (+ `not-data-[variant=destructive]...`) | `data-highlighted:bg-border data-highlighted:text-fg` |
  | `ring-1 ring-foreground/10`, `shadow-md` | `border border-border`, `shadow-lg shadow-black/40` |
  | `bg-border` (separator) | unchanged (exists) |
  | `cn-menu-target cn-menu-translucent` (registry-internal) | removed |
  | `animate-in/out fade-* zoom-* slide-in-*` | `transition-[opacity,scale] duration-100 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 motion-reduce:transition-none` |

  Trigger visuals match `fieldControlClasses` (rounded-md, border, bg-bg, px-3 py-2, text-sm, text-fg) so it is
  the same 38px height as Input in the same grid row. Selected-item check icon uses `text-accent`.
- D5. Filename clash: keep ONE file, `src/components/ui/Select.tsx` (project uses PascalCase ui files; git
  `core.ignorecase=true`). It is rewritten in place (no rename, no `git mv`) to export the shadcn primitives under
  shadcn names (`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`,
  `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`) plus a labeled wrapper
  `SelectField`. Callers import `SelectField`. Do not run `shadcn add select` later (it would write `select.tsx`
  over this file on Windows); add a top-of-file comment saying so.
- D6. "All" option: use Base UI's documented clearable `null` item (`{ value: null, label: "Semua Kategori" }`)
  instead of a string sentinel. Dashboard state stays `ProjectCategory | ""`; it maps as `value={category || null}`
  and `onValueChange={(v) => setCategory(v ?? "")}`. No empty-string values reach Base UI.
- D7. Labeling: use `SelectPrimitive.Label` (Base UI ≥1.x; renders a div, clicking focuses the trigger without
  opening, and Base UI wires `aria-labelledby`). Styled like `Label.tsx` (`text-sm font-medium text-fg`, red `*`
  `aria-hidden` when required). Trigger gets `aria-invalid`, `aria-required`, `aria-describedby` (error id via
  `describedBy`). Fallback only if `Select.Label` does not typecheck in 1.8.0: render `<span id={labelId}>` and put
  `aria-labelledby={labelId}` on the trigger.
- D8. Positioning/layering: Portal to body, Positioner `z-50` (admin header is `z-40`, ProjectForm sticky action
  bar `z-10`, ConfirmDialog `z-50` contains no select). `SelectField` passes `alignItemWithTrigger={false}` so the
  popup opens as a dropdown under the trigger (width `--anchor-width`) instead of covering label/trigger.
  `modal` stays default (`true`).
- D9. RHF: ProjectForm category/status switch from `register` to `Controller`; `field.ref` goes to the trigger
  `<button>` (has `.focus()`) so `shouldFocusError` focuses it. `field.name` → Root `name` (hidden input).
- D10. No FEAT decomposition: this is one cohesive change (~6 files); the existing implement/review loop runs this
  plan as-is.

## Steps

- [ ] 0. Baseline. Install deps and record the current public entry chunk.
      Run `bun install`, then `bun run build`; copy the vite chunk listing lines for `dist/assets/index-*.js`
      and `dist/assets/index-*.css` (name + size + gzip) into the item-7 notes as BASELINE.
      Files: none.
      Verify: `bun run typecheck`, `bun run lint`, `bun run build` all succeed on the untouched branch.

- [ ] 1. Add deps and shadcn config.
      `bun add --exact @base-ui/react@1.8.0 clsx@2.1.1 tailwind-merge@3.7.0`. Confirm package.json shows the three
      with no `^`/`~` and bun.lock updated. Create `client/components.json`:
      ```json
      {
        "$schema": "https://ui.shadcn.com/schema.json",
        "style": "base-nova",
        "rsc": false,
        "tsx": true,
        "tailwind": { "config": "", "css": "src/styles/globals.css", "baseColor": "stone", "cssVariables": false, "prefix": "" },
        "iconLibrary": "lucide",
        "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }
      }
      ```
      (`cssVariables: false` records D4: components use project tokens, no shadcn variables.)
      Files: client/package.json, client/bun.lock, client/components.json
      Verify: `bun run lint` passes (run `bun run lint:fix` first so biome formats components.json with tabs);
      `bun run typecheck` passes.

- [ ] 2. Add the shadcn cn helper.
      Create `client/src/lib/utils.ts`:
      `import { type ClassValue, clsx } from "clsx"; import { twMerge } from "tailwind-merge";`
      `export function cn(...inputs: ClassValue[]): string { return twMerge(clsx(inputs)); }`
      with a one-line comment: admin/shadcn-only; public code keeps `@/lib/cn` to keep tailwind-merge out of the
      entry chunk. Leave `src/lib/cn.ts` untouched.
      Files: client/src/lib/utils.ts
      Verify: `bun run typecheck` and `bun run lint` pass; sanity check from client/:
      `bun -e "import {cn} from './src/lib/utils.ts'; console.log(cn('w-fit px-2 bg-bg text-sm text-fg','w-full px-3'))"`
      prints `bg-bg text-sm text-fg w-full px-3` (custom tokens survive, conflicts resolved).

- [ ] 3. Rewrite `client/src/components/ui/Select.tsx` with the shadcn primitives + `SelectField`.
      Primitives: port the base-nova registry file (import `{ Select as SelectPrimitive } from "@base-ui/react/select"`,
      `cn` from `@/lib/utils`), with: no `"use client"`; `IconPlaceholder` replaced by local inline SVG components
      `ChevronDownIcon`, `ChevronUpIcon`, `CheckIcon` (24x24 viewBox, stroke currentColor, `aria-hidden="true"`);
      the `size` prop/`data-[size]` classes dropped; every class mapped per D4. Concretely:
      - SelectTrigger base: `flex w-fit items-center justify-between gap-2 rounded-md border border-border bg-bg px-3 py-2 text-left text-sm text-fg whitespace-nowrap transition-colors outline-none select-none cursor-pointer hover:border-muted/50 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500/30 data-placeholder:text-muted *:data-[slot=select-value]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`; icon `size-4 text-muted`.
      - SelectContent: same props/defaults as registry (`side="bottom" sideOffset={4} align="center" alignOffset={0} alignItemWithTrigger={true}`), Positioner `isolate z-50 outline-none`, Popup `relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-border bg-surface p-1 text-fg shadow-lg shadow-black/40 outline-none` + the transition classes from D4.
      - SelectItem: `relative flex w-full cursor-pointer items-center gap-2 rounded py-1.5 pr-8 pl-2 text-sm text-fg outline-hidden select-none data-highlighted:bg-border data-highlighted:text-fg data-selected:font-medium data-disabled:pointer-events-none data-disabled:opacity-50`; ItemIndicator span `absolute right-2 flex size-4 items-center justify-center text-accent`.
      - SelectLabel (group label) `px-2 py-1 text-xs text-muted`; Separator `-mx-1 my-1 h-px bg-border`;
        scroll arrows `bg-surface` instead of `bg-popover`.
      Wrapper `SelectField<V extends string>` (function component, React 19 `ref` prop typed
      `React.Ref<HTMLButtonElement>`), props: `label: string; required?: boolean; error?: { message?: string };
      options: { value: V; label: string }[]; placeholder?: string` (when set, prepends a `{ value: null, label:
      placeholder }` item = "all"); `value: V | null; onValueChange: (value: V | null) => void; onBlur?; name?;
      id?; disabled?; className?`. Implementation: `useId` for trigger id and `${id}-error`; build
      `items = placeholder ? [{ value: null, label: placeholder }, ...options] : options`; render
      `<div className="flex flex-col gap-1.5">` → `<Select items={items} value={value} onValueChange={...} name={name}
      disabled={disabled}>` containing `SelectPrimitive.Label` (D7), `SelectTrigger` (`ref`, `id`, `onBlur`,
      `className={cn("w-full", className)}`, `aria-invalid={hasError || undefined}`, `aria-required={required ||
      undefined}`, `aria-describedby={describedBy(hasError && errorId)}`) with `<SelectValue />`, and
      `<SelectContent alignItemWithTrigger={false}>` mapping `items` to `SelectItem` (key `String(item.value)`, null
      item key `"__all"`); then `<FieldError id={errorId} error={error} />` after the Root. Keep the
      `// File: /client/src/components/ui/Select.tsx` header and add the D5 "do not run shadcn add select" comment.
      The old native `Select` export is removed (consumers updated in items 4–5 in the same commit if typecheck must
      stay green; do items 3–5 before running typecheck if needed).
      Files: client/src/components/ui/Select.tsx
      Verify: after items 4–5, `bun run typecheck` and `bun run lint` pass.

- [ ] 4. Migrate the Dashboard filters (depends on 3).
      In `client/src/pages/admin/DashboardPage.tsx` import `{ SelectField } from "@/components/ui/Select"`; replace
      both `<Select>`s:
      `<SelectField label="Kategori" placeholder="Semua Kategori" options={categoryOptions} value={category || null}
      onValueChange={(v) => { setCategory(v ?? ""); setPage(1); }} />` and the same for Status
      (`"Semua Status"`, `statusOptions`, `setStatus`). Type `categoryOptions`/`statusOptions` so `V` infers
      `ProjectCategory`/`ProjectStatus` (e.g. `PROJECT_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))`
      already does). Remove `isCategory`/`isStatus` if now unused (`noUnusedLocals`). `resetFilters` keeps setting `""`.
      Files: client/src/pages/admin/DashboardPage.tsx
      Verify: `bun run typecheck`, `bun run lint` pass.

- [ ] 5. Migrate ProjectForm category/status to `Controller` (depends on 3).
      In `client/src/components/form/ProjectForm.tsx` import `SelectField` from `"../ui/Select"`; replace the two
      `register` selects with:
      `<Controller name="category" control={control} render={({ field }) => (<SelectField label="Kategori" required
      options={categoryOptions} name={field.name} ref={field.ref} value={field.value ?? null}
      onValueChange={(v) => field.onChange(v)} onBlur={field.onBlur} error={errors.category} />)} />`
      and the same for `status`/`statusOptions`/`errors.status`. No placeholder (values always set: create defaults
      `fullstack`/`draft`, edit mode from `project`). If `field.onChange(null)` would be a type issue, guard with
      `if (v) field.onChange(v)` (null is unreachable without a placeholder item).
      Files: client/src/components/form/ProjectForm.tsx
      Verify: `bun run typecheck`, `bun run lint`, `bun run build` pass.

- [ ] 6. Add a dependency-free test for `SelectField` using bun's built-in runner.
      Add `"test": "bun test"` to client/package.json scripts. Create `client/tests/select-field.test.tsx` (outside
      `src`, so tsc's `include: ["src", ...]` does not need `bun:test` types) using `bun:test` +
      `react-dom/server` `renderToStaticMarkup`. Cases: (a) with `value="published"` the trigger text contains the
      option label and the label text "Status" is rendered and referenced by the trigger's `aria-labelledby`;
      (b) with `error={{ message: "Wajib diisi" }}` the trigger has `aria-invalid="true"` and `aria-describedby`
      equal to the id of the `<p>` containing "Wajib diisi"; (c) with `placeholder="Semua Status"` and
      `value={null}` the trigger shows "Semua Status"; (d) `required` renders `aria-required="true"` and the `*`.
      Import via `@/components/ui/Select` (bun honors tsconfig paths). If biome complains about the new folder,
      fix formatting with `bun run lint:fix`.
      Files: client/package.json, client/tests/select-field.test.tsx
      Verify: `bun run test` — 4 tests pass; `bun run lint` passes.

- [ ] 7. Bundle and public-page check (depends on 1–5).
      Run `bun run build`. Compare `dist/assets/index-*.js` / `index-*.css` with the BASELINE from item 0: JS size
      within ~0.3 kB (only lazy-chunk preload map may change); CSS may grow by a few hundred bytes (new utility
      classes; CSS is a single file). Confirm the base-ui/tailwind-merge code went to an admin chunk: search the
      entry JS for `tailwind-merge`'s/base-ui's distinctive strings (e.g. `Select.Root` not present; the
      `twMerge` config strings like `"font-stretch"` absent) and confirm they appear in the chunk shared by
      `DashboardPage`/`ProjectEditorPage`. Record before/after numbers in the final summary.
      Files: none.
      Verify: `bun run build` succeeds; entry chunk size ≈ baseline; deps not present in entry.

- [ ] 8. Manual a11y/visual pass (best effort).
      Only if a backend is already reachable through the Vite proxy: `bunx vite --port 5180` (not 5173), log in,
      check on Dashboard and New/Edit project: Tab focuses the trigger with the amber ring; Enter/Space/ArrowDown open;
      arrows move highlight; typing a letter jumps (type-ahead); Enter selects; Escape closes and returns focus to
      the trigger; popup renders above the sticky header and the sticky action bar; submitting an edit with a
      cleared required field still shows errors (category/status cannot be empty, so check other fields still focus
      on error); edit mode shows the project's saved category/status. Stop the dev server afterwards. If no backend is
      available, state in the summary that this pass was not run (do not start the server on 3000/3003).
      Files: none.
      Verify: observations recorded in the summary.

- [ ] 9. Final gate and commit.
      Run `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build` — all green. `git status` must show only:
      client/package.json, client/bun.lock, client/components.json, client/src/lib/utils.ts,
      client/src/components/ui/Select.tsx, client/src/pages/admin/DashboardPage.tsx,
      client/src/components/form/ProjectForm.tsx, client/tests/select-field.test.tsx (no dist/, no server/).
      Commit locally on `feat/shadcn-select` (stage files by name), message
      `feat(client): use shadcn/ui Select (Base UI) in admin CMS`. Do not push.
      Verify: all four commands succeed; `git log -1 --stat` lists exactly the files above.

## Notes for the reviewer

- `src/lib/cn.ts` intentionally unchanged (D3). Public pages import nothing new.
- Native `<select>` is gone from the codebase; `Select.tsx` remains the single select module (no case rename).
- No CSS-variable layer was added to globals.css (D4); visual parity comes from the class mapping table.
