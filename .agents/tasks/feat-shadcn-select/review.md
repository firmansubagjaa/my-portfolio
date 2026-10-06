# Base UI Select (shadcn base-nova) for the admin CMS filters and project form

The admin CMS's native `<select>` is gone. In its place is a hand-ported shadcn/ui "base-nova" Select built on `@base-ui/react@1.8.0`, in the same `components/ui/Select.tsx` module. A labeled `SelectField` wrapper serves the two Dashboard filters (Kategori, Status) and the two required ProjectForm fields, which now go through react-hook-form `Controller` instead of `register`. The component classes were rewritten to the project's own tokens rather than adding shadcn CSS variables. The new deps sit in an admin-only chunk, kept out of the public entry by a separate `@/lib/utils` `cn` helper. The public `@/lib/cn` is unchanged. The change is client-only. The `server/` files that show up in `git diff main` come from main having moved ahead (PR #13); `git diff main...HEAD` has only client files.

Watch for: `components.json` declares `iconLibrary: "lucide"` but lucide-react is not installed, so a later `shadcn add` of any other component will generate broken imports (confirmed, non-blocking). The new test file sits outside the tsc `include`, so it is never type-checked (confirmed, non-blocking). The branch is one merge behind `main` and should be rebased before opening the PR (confirmed, no overlapping files).

**Verdict**: APPROVED

## High-level view

The Select keeps a single PascalCase file. The old native `Select` export is replaced by the shadcn primitive names plus `SelectField`, and both callers import `SelectField`. A header comment warns against `shadcn add select`, which on this case-insensitive FS would overwrite the file. A grep of `client/src` finds no leftover `<select>` and no import of the old export.

The token strategy avoids the shadcn `accent` collision completely. No CSS variables were added to `globals.css`. The item highlight uses `data-highlighted:bg-border`, not `bg-accent`. The amber `accent` appears only where it already means "brand accent": the focus ring, the focused border, and the selected-item check. The site-wide `bg-accent`, `outline-accent` and `accent-accent` usages keep their meaning.

The "all" filter option is Base UI's documented `null` item, not a string sentinel. Dashboard state stays `ProjectCategory | ""` and maps both ways with `value={x || null}` / `v ?? ""`. No empty-string value reaches Base UI, and the existing query builder still drops the empty filter. This meets the brief's intent ("all" maps to no filter, no empty string), with `null` doing the job of the suggested `"all"` string.

The ProjectForm integration hands `field.ref` to the trigger button, so focus-on-error targets a focusable element. Edit-mode values come from `defaultValues: project` and were shown preselected in the browser run. `aria-invalid`, `aria-required` and `aria-describedby` → the FieldError id are kept on the trigger. An SSR test covers this, because category and status always hold a value and the error state can't be reached from the UI.

Bundle isolation is shown by the recorded build. The entry JS is byte-identical to baseline (266.22 kB / 85.14 kB gzip). Base UI and tailwind-merge strings appear only in the admin `use-admin-projects-*` chunk, and `index.html` preloads none of it. The shared CSS grows by about 0.77 kB gzip from new utilities. This can't be avoided with one Tailwind CSS file.

<details>
<summary>Issues (3)</summary>

1. **lucide iconLibrary without lucide-react** — `components.json` says `iconLibrary: "lucide"`, but the icons are inlined and lucide-react is not a dependency. Any future `shadcn add <component>` will emit `lucide-react` imports that fail to resolve. Either note this in the header comment or accept adding lucide-react when the next component lands. Non-blocking.
2. **Test file not type-checked** — `client/tests/select-field.test.tsx` is outside tsc's `include`, and bun strips types without checking them, so type drift in the test (for example `SelectField` prop changes) only surfaces as runtime failures. Consider a `tests/tsconfig.json` with `bun-types`, or accept this as a known gap. Non-blocking.
3. **Branch behind main** — main gained PR #13 (server upload MIME fix) after this branch was cut, so a two-dot diff shows server files being reverted. Rebase or merge `main` before opening the PR so the PR diff and CI run against current main. The files don't overlap. Non-blocking.

</details>

<details>
<summary>Details</summary>

### Popup layering and positioning

Content is portaled to `<body>`, and the Positioner and Popup are both `z-50`. That sits above the admin header (`z-40`) and the ProjectForm sticky action bar (`z-10`). `08-create-status-open.png` shows the status list drawn over the action bar's Save button. `SelectField` sets `alignItemWithTrigger={false}`, so the list drops below the trigger at `--anchor-width` instead of using Base UI's macOS-style overlay, which would cover the label. ConfirmDialog holds no Select, so the "inside dialog" case doesn't exist yet. If a Select is ever placed inside ConfirmDialog (also `z-50`), they tie on z-index and DOM order decides. The later portal wins, which works today but is fragile (possible, only relevant to future use).

### Label association and keyboard

`SelectPrimitive.Label` renders a `div` and wires `aria-labelledby` in a client effect, so the SSR test can't check the label link. That link, plus the keyboard behavior, is verified only by the manual browser run (`browser-log.txt`), not by any repeatable test.

### RHF Controller wiring

```tsx
onValueChange={(value) => { if (value) field.onChange(value); }}
```

The null guard drops a `null` change silently. That's only reachable through a placeholder item, and ProjectForm passes none, so a required field can't be cleared through the UI. If someone later adds a placeholder to these fields, the "clear" choice would be swallowed without any feedback (possible, future-only).

### Dependencies

The three new deps are pinned exact in `package.json` and `bun.lock`, and each is the canonical package (MUI's Base UI, lukeed's clsx, dcastil's tailwind-merge). The transitive packages are the expected `@floating-ui/*`, `@base-ui/utils`, `reselect` and `use-sync-external-store`. The `tw-animate-css` dependency was avoided by using Base UI `data-starting-style`/`data-ending-style` transitions with `motion-reduce:transition-none`.

### Test coverage

Four SSR tests cover the selected label, error linkage plus `aria-invalid`, the null placeholder, and `aria-required` with the asterisk. Interactive behavior (open, select, keyboard, layering, edit preselection) is covered only by the recorded manual CDP run, which reported 30 checks passing with 11 screenshots, all present on disk.

Not tested automatically: selection changes calling `onValueChange`, Controller integration in ProjectForm, and Dashboard filter-to-query mapping.

</details>

<details>
<summary>File map</summary>

- `client/package.json`: three exact-pinned deps, plus a `test: bun test` script
- `client/bun.lock`: lockfile entries for the new deps and their transitive packages
- `client/components.json`: hand-written shadcn config (base-nova, `cssVariables: false`, utils → `@/lib/utils`)
- `client/src/lib/utils.ts`: shadcn `cn` (clsx + tailwind-merge), used by admin code only
- `client/src/components/ui/Select.tsx`: native select replaced by the Base UI primitives and the `SelectField` wrapper
- `client/src/pages/admin/DashboardPage.tsx`: filters moved to `SelectField` with the null "all" item; type guards removed
- `client/src/components/form/ProjectForm.tsx`: category/status moved from `register` to `Controller` + `SelectField`
- `client/tests/select-field.test.tsx`: four SSR tests

Full diff: `git diff main...feat/shadcn-select` in `.worktrees/shadcn-select`.

</details>
