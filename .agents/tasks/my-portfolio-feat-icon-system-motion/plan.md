# Implementation Plan: Icon System + Motion (Lucide Integration)

**Worktree:** `d:\File Defir\Projects\My Portfolio\.worktrees\icon-system-motion`  
**Client App:** `d:\File Defir\Projects\My Portfolio\.worktrees\icon-system-motion\client`  
**Dev Server:** `bun run dev` (starts at http://localhost:5173, proxies API to http://localhost:3000)  
**Test Command:** `bun test`  
**Build Command:** `bun run build`

---

## Context & Decisions

### Codebase Findings
- **Project structure confirmed:** BentoGrid layout with ProjectCard, ProjectFilters, ProjectMeta, ProjectDetailPage components
- **Featured field:** `is_featured` boolean (from ProjectDTO/ProjectListItemDTO)
- **Category field:** `category` enum (fullstack, ai_ml, frontend, backend, experiment) with CATEGORY_LABELS already defined
- **Tech stack:** Array of strings, currently displayed as plain Badge components
- **Colors:** Theme tokens defined in `globals.css` via Tailwind @theme (--color-bg, --color-surface, --color-border, --color-accent, --color-muted, --color-code)
- **Motion setup:** Already using `motion/react` with domMax, AnimatePresence, LayoutGroup in BentoGrid
- **Seed projects:** 4 projects defined in `server/src/db/seed.ts` with 3 featured (`is_featured: true`)

### Design Decisions
1. **Create `techStackIcons.ts`** in `src/lib/` (co-located with `cn.ts`, `slugify.ts`) to centralize tech→icon+color mapping. Aligns with existing pattern of utility exports.
2. **Create UI components** in `src/components/ui/` (FeaturedBadge, TechTag, CategoryBadge) to keep atomic components grouped, following existing structure (Button, Badge, etc.).
3. **Update globals.css** with:
   - Spacing grid CSS variables (--spacing-2, --spacing-4, etc.) for consistency
   - Motion classes (hover-transition, card-hover, tech-tag-hover, featured-pulse, slide-in-cascade) to keep animation logic in CSS, not scattered in component classNames
   - Respect `prefers-reduced-motion` at the @media layer
4. **Update ProjectCard, ProjectMeta, ProjectFilters, ProjectDetailPage** to import and use new components and icons (incremental enhancement, no breaking changes).
5. **Color palette for tech stack:** Use extended Tailwind palette (Blue #3B82F6, Green #10B981, Yellow #EAB308, Purple #A855F7, Red #EF4444, Orange #F97316, Cyan #06B6D4, Slate #64748B) — not defined in theme; rely on Tailwind defaults or add custom layer.

### Implementation Notes
- **Lucide icons** are tree-shakeable ES modules; import individually (e.g., `import { Star } from 'lucide-react'`) to minimize bundle size.
- **Motion transitions:** 150-200ms for hover (expo-out ease already defined in `TRANSITION` constant in `constants.ts`), 300ms cascade with 50ms stagger.
- **Keyboard accessibility:** All interactive elements (featured toggle, filter buttons, tech tags) already use semantic HTML; icon-only buttons will include aria-label.
- **Featured badge:** Optional 'Featured' text label on card; Star icon always visible and filled with amber.
- **Empty category colors:** If a tech has no entry in TECH_ICONS, fall back to muted color + Code icon (safe default).

---

## Implementation Plan

### Phase 1: Dependency & Utilities

- [ ] **1. Install lucide-react and verify**
      
      Add `lucide-react` to package.json dependencies and run `bun install`.
      
      Files: `client/package.json`, `client/bun.lock` (auto-updated)
      
      Verify: `bun list lucide-react` shows version, no peer dependency errors, `bun run typecheck` passes
      
- [ ] **2. Create `src/lib/techStackIcons.ts` with TECH_ICONS and CATEGORY_ICONS maps**
      
      Define TECH_ICONS (tech name → {icon: LucideIcon, color: string, label: string}) and CATEGORY_ICONS (category enum → {icon: LucideIcon, color: string, label: string}).
      Include getTechIcon(tech: string) and getCategoryIcon(category: ProjectCategory) helpers that return {icon, color, label} objects or a default fallback.
      
      Tech stack: React=Code2/#3B82F6, TypeScript=Code/#3B82F6, Node.js=Server/#10B981, PostgreSQL=Database/#64748B, Python=Code/#EAB308, FastAPI=Zap/#EAB308, Bun=Zap/#F59E0B, WebSocket=Radio/#A855F7, Redis=Zap/#EF4444, Docker=Box/#3B82F6, AWS=Cloud/#F97316, Tailwind=Palette/#06B6D4, Transformers=Brain/#A855F7.
      
      Category icons: Full-Stack=Layers/#3B82F6, AI/ML=Brain/#A855F7, Backend=Server/#10B981, Frontend=Code2/#3B82F6, Experiment=Lightbulb/#A855F7.
      
      Files: `client/src/lib/techStackIcons.ts`
      
      Verify: `bun run typecheck` passes, no unused imports
      
- [ ] **3. Create motion & spacing utility classes in `src/styles/globals.css`**
      
      Add CSS custom properties for spacing grid (--spacing-2, --spacing-4, --spacing-6, --spacing-8, --spacing-12, --spacing-16, --spacing-24).
      
      Add @layer utilities for:
      - `.hover-transition` (duration 200ms, ease expo-out)
      - `.card-hover` (border amber, shadow boost, scale 1.02 on hover)
      - `.tech-tag-hover` (border amber, bg amber/10, scale 1.05 on hover)
      - `.featured-pulse` (subtle pulse animation on featured badge, 2s infinite)
      - `.slide-in-cascade` (300ms ease-out slide-in, with nth-child stagger 0/50/100/150ms)
      - All wrapped with `@media (prefers-reduced-motion: no-preference)` to respect accessibility preference
      
      Files: `client/src/styles/globals.css`
      
      Verify: `bun run build` succeeds, CSS loads in DevTools (no syntax errors)

### Phase 2: Icon-Aware UI Components

- [ ] **4. Create `src/components/ui/FeaturedBadge.tsx`**
      
      Component: renders Star icon (16px, filled amber) + optional 'Featured' text label, inside a span with hover pulse effect.
      Props: optional `showLabel?: boolean` (default true), optional `className?: string` for additional styling.
      Uses `featured-pulse` class from globals.css.
      
      Files: `client/src/components/ui/FeaturedBadge.tsx`
      
      Verify: Component renders without error, icon fills amber, text label visible when showLabel=true
      
- [ ] **5. Create `src/components/ui/TechTag.tsx`**
      
      Component: renders icon (14-16px) + text label, in a pill/badge with optional interactive cursor-pointer.
      Props: `tech: string`, optional `interactive?: boolean`, optional `className?: string`.
      Imports getTechIcon(tech) from `src/lib/techStackIcons.ts`, renders icon + tech name in small font.
      On hover (when interactive=true), applies tech-tag-hover class (border amber, bg amber/10, scale 1.05).
      Fallback: if tech not in map, renders Code icon + muted color.
      
      Files: `client/src/components/ui/TechTag.tsx`
      
      Verify: Renders tech name + icon, correct color, hover effect works in browser
      
- [ ] **6. Create `src/components/ui/CategoryBadge.tsx`**
      
      Component: renders category icon (16px) + category label, consistent styling with TechTag.
      Props: `category: ProjectCategory`, optional `className?: string`.
      Imports getCategoryIcon(category) from `src/lib/techStackIcons.ts`.
      
      Files: `client/src/components/ui/CategoryBadge.tsx`
      
      Verify: Renders category icon + label, correct color matches design spec

### Phase 3: Update Existing Components

- [ ] **7. Update `src/components/bento/ProjectCard.tsx`**
      
      - Import FeaturedBadge, TechTag, and update styling
      - Add FeaturedBadge in card header (top-right or below title) when `project.is_featured === true`
      - Replace Badge component calls with TechTag for tech_stack items (preserve MAX_BADGES logic)
      - Apply card-hover class to article root for scale/border/shadow on hover
      - Verify featured star pulses when card is hovered
      
      Files: `client/src/components/bento/ProjectCard.tsx`
      
      Verify: Featured badge appears on 3 projects in grid, tech tags show correct icon+color, card hover effect applies
      
- [ ] **8. Update `src/components/projects/ProjectFilters.tsx`**
      
      - Import Star icon from lucide-react for featured filter button
      - Replace ⭐ emoji with `<Star size={16} className="fill-current" />` inline in the featured button
      - Keep aria-pressed, existing toggle logic unchanged
      - Ensure hover effect consistent with filter buttons
      
      Files: `client/src/components/projects/ProjectFilters.tsx`
      
      Verify: Featured filter button shows Lucide Star icon instead of emoji, toggle works (shows 3/1 projects)
      
- [ ] **9. Update `src/components/projects/ProjectMeta.tsx`**
      
      - Import Calendar, Code, Github, ExternalLink icons from lucide-react
      - Replace text links section with icon+text meta section:
        - Calendar icon (14px, muted) + date if available
        - Code icon (14px, muted) + "View Code" for repo_url
        - ExternalLink icon (14px, amber on hover) for demo_url
        - Github icon (14px, muted) + "Repository" for repo_url (alternative)
      - Apply icon-link hover (amber color) to link icons
      - Replace tech stack rendering with TechTag components
      
      Files: `client/src/components/projects/ProjectMeta.tsx`
      
      Verify: Icons render for date/links, hover turns amber, repo/demo links functional
      
- [ ] **10. Update `src/components/pages/ProjectDetailPage.tsx`**
      
      - Add CategoryBadge near title (e.g., "Category: [icon + label]")
      - Verify ProjectMeta icons render correctly in detail view
      - Test responsive layout at 390px (icons stay visible, links tap-friendly)
      
      Files: `client/src/pages/ProjectDetailPage.tsx`
      
      Verify: Category badge appears near title, meta icons below content, all links accessible

### Phase 4: Integration & Testing

- [ ] **11. Responsive verification & console cleanup**
      
      Start dev server: `bun run dev`, navigate to http://localhost:5173/projects
      - Verify 4 projects load in Bento Grid with cascade animation (slide-in-cascade)
      - Featured filter button shows Star icon, toggle shows/hides featured projects (3/1)
      - Hover over cards: border turns amber, shadow increases, scale 1.02 applies, featured star pulses
      - Hover over tech tags: border amber, bg amber/10, scale 1.05
      - Hover over metadata icons: turn amber
      - Click detail page: category badge visible, meta icons functional
      - Responsive check at 390px: no overflow, icons 14-16px, tap targets ≥44px, tech tags wrap, 1-column stack
      - Console: no Lucide import warnings, no TypeScript errors
      - Keyboard navigation: Tab through cards, visible focus ring, all interactive elements reachable
      
      Files: All modified components
      
      Verify: Browser inspection + responsive DevTools + console clean

- [ ] **12. Build & type verification**
      
      Run `bun run build` and `bun run typecheck` — both must pass with no errors or warnings.
      
      Files: `client/` (all source files)
      
      Verify: `bun run typecheck` output shows 0 errors, build completes successfully, dist/ contains no warnings

---

## Divergences from Spec

**None identified.** Spec file paths match actual codebase. Actual field names (`is_featured` vs hypothetical `featured`) confirmed in seed.ts and dto.ts.

---

## Key Testing Points

1. **Featured badge pulses on card hover** (motion-react animation + CSS pulse class)
2. **Tech tags show correct color per tech** (icon + color from TECH_ICONS map)
3. **Featured filter toggles correctly** (3 shown when featured=true, 1 hidden; 4 shown when undefined)
4. **Cascade animation on load** (slide-in-cascade with staggered delays on BentoGrid list items)
5. **Icons honor prefers-reduced-motion** (no animation if user has set preference)
6. **Keyboard & focus accessibility** (tab through cards, visible focus rings, aria-labels on icon-only buttons)
7. **Responsive at 390px** (icons visible, no text overflow, tap targets 44px+)
8. **No console warnings** (Lucide imports tree-shake correctly, no unused code)

