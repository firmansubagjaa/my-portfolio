## Summary

Overhauls the admin CMS (login, dashboard, project create/edit) so it matches the site's dark theme tokens and fixes several bugs that blocked normal use, including login not redirecting to the dashboard.

### Restyled pages and components
- **Pages:** `LoginPage`, `DashboardPage`, `ProjectEditorPage`, `AdminLayout` shell (header, "Lihat Situs" link that is icon-only on mobile with an sr-only label, Logout).
- **UI primitives on site tokens:** `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Select`, `Checkbox`, `Label`, `FieldError`, `Skeleton`, plus shared `field-styles.ts`.
- **Form components:** `ProjectForm`, `TagInput`, `ImageUploadField`, `GalleryUploadField` (multi-upload), `MarkdownEditorField`, plus new `upload-utils.tsx`.

### Fixes and features
- **Button:** new `danger` variant, and `className` now merges correctly instead of being dropped or overriding variant styles. "Hapus" renders red with white text.
- **Category label mapping** (`config/constants.ts`): shows readable labels (AI/ML, Backend, …) instead of raw enum values.
- **LoginPage error feedback:** a wrong password shows a red banner ("Username atau password salah."). A correct login now lands on `/admin` and isn't bounced back (`use-auth.ts`, `ProtectedRoute.tsx`).
- **Markdown editor dark mode:** the toolbar, textarea and preview use theme tokens instead of GitHub-dark. This uses higher-specificity `.admin-md-editor[data-color-mode]` overrides in `globals.css`. The editor textarea now has a label.
- **Dashboard:** stats cards, category filter with "Reset filter", debounced search that keeps input focus, and empty states. Pagination now reads the API envelope's `pagination` (it was always undefined before). Stats come from one request because the DB pool is `max: 1`.
- **Mobile table:** below the breakpoint the table is replaced with a card list, with no horizontal overflow at 375px.
- **`auth.service.ts` type fix:** response typing aligned with the API envelope. Also, `api-client.ts` now passes through API error messages.
- **Validation:** new `lib/zod-resolver.ts`. `@hookform/resolvers` 3.4 re-throws zod 4 errors, so invalid forms silently didn't submit.
- **Edit page:** shows "Proyek tidak ditemukan" only on a 404. Other errors show "Gagal memuat proyek." with a retry button.
- **Accessibility:** the confirm dialog has `role=dialog`, `aria-modal` and a label. Focus starts on "Batal", Tab is trapped, body scroll is locked, and Escape closes it and returns focus to the trigger. Labels are tied to inputs, focus-visible outlines use the accent token, and the login form autofocuses.

## Verification

Full report: `.agents/tasks/my-portfolio-feat-admin-ui-polish/verification.md` (local run artifact, not committed).

- `bun run typecheck`: pass
- `bun run build`: pass
- `bunx biome check` on the 32 changed files: 0 errors, 1 intentional warning (specificity note on the md-editor override)
- `bun run lint` repo-wide: 66 errors, all already there and none in changed files (main has 94)
- Browser checks in headless Chrome at 1280×900 and 375×812, with screenshots captured (`browser/shots/01-login.png` … `11-edit-load-error-state.png`):
  - Pass: login, wrong-password banner, login redirect, dashboard contrast, badges, stats, filter, search, delete dialog a11y, mobile card list, create page, md-editor dark mode, validation messages
  - Not verified: edit page with loaded data and the logout click. The remote Supabase pooler was intermittently timing out (environment issue, not this change)

### Known pre-existing issue (not changed here)
`GET /admin/check-slug` is registered after `GET /admin/:id` in `server/src/controllers/admin.controller.ts`, so the slug check returns `400 Invalid UUID`. This PR has no backend API changes, so it's left for a follow-up. The 409 conflict banner on save still catches duplicate slugs.

## Before / after
- **Before:** admin pages had light/white blocks on the dark site and low-contrast text. Raw category enums showed in lists. "Hapus" wasn't styled as destructive. The md-editor used GitHub-dark colors. The table overflowed on mobile. Login failed silently or didn't move to the dashboard, and invalid forms showed no errors.
- **After:** everything uses the site tokens (bg `#0c0a09`, surface `#1c1917`, text `#fafaf9`, muted `#a8a29e`). Labels are readable, status and featured badges are colored, and "Hapus" is red. Mobile uses cards. Login shows clear errors and redirects correctly, forms show validation messages, and the dialog is accessible.
