---
inclusion: fileMatch
fileMatchPattern: ["client/src/pages/**/*.tsx", "client/src/components/**/*.tsx", "client/src/styles/**/*.css"]
---

# Anti-Slop UI Filter

**Adapted from** [anti-slop](https://github.com/miqdadbadjuber/anti-slop) by Miqdad Badjuber (MIT License)  
**Purpose:** Filter out generic AI-generated UI, decoration without purpose, and template cloning. This is a *filter*, not a style guide—direction comes from `design-system.md`.

---

## Core Rules (Hard Gate + Quality Locks)

**Absolute (ship-blocking if violated):**

- **R-26/R-38 (Real/Labeled):** Every control, link, and text must be real or clearly labeled placeholder. No demo links to 404. No fake footer social links.
- **R-27 (State Handling):** Empty state, loading skeleton, error state, and 404 page must all exist and be visually distinct.
- **R-32 (Keyboard + Focus):** Every interactive element keyboard-accessible. Focus ring visible. Semantic HTML (buttons, links, form controls, not divs).
- **R-25 (Contrast):** Minimum WCAG AA (4.5:1 for text, 3:1 for UI). Test with `contrast-check.py` or browser tools.
- **R-24 (Nav):** No links to non-existent pages. Breadcrumbs/back nav work. Current page indicated.

**Quality Locks (must have written reason):**

- **R-20 (Identity):** All copy, imagery, and positioning tied to Firman Subagja's name, role, and technical focus. No generic "Portfolio" branding. One-line reason: why this visual choice?
- **R-31 (One-Line Reason):** Every major design decision (color, icon, layout, motion) must have a one-sentence explanation. If you can't write it, it's probably AI slop.
- **R-05 (Layout):** Bento grid is *not* default—use it only when data density justifies it (6+ items). For case studies or featured projects, use list layout. Reason: why grid here, not list?
- **R-11 (Radius Consistency):** Define 2-3 radius values (e.g., `rounded-lg` for cards, `rounded` for buttons, `rounded-full` for badges). No arbitrary mix.
- **R-14 (Card Identity):** Cards don't look identical. Featured cards vs. secondary cards must have visual distinction (color, scale, border, shadow).
- **R-19 (Motion):** Animations have purpose (feedback, loading, transition). No spinning, bouncing, or distracting motion. Respect `prefers-reduced-motion: reduce`.
  - Hover transitions: 150–200ms, `ease-in-out`
  - Cascade/load-in: 300ms, with stagger (50ms between items)
  - No animation longer than 500ms unless it's a continuous microanimation

---

## Component Checklist

**Before shipping any component:**

- [ ] Empty state exists (not just loading + error)
- [ ] Loading skeleton matches final layout (not generic)
- [ ] Error state has CTA ("Try again", "Go back")
- [ ] Hover state is distinct and responsive (not color-only)
- [ ] Disabled state visually clear (opacity, color, cursor: not-allowed)
- [ ] Focus ring visible (global: 2px solid accent)
- [ ] Interactive target ≥ 44px (touch-friendly)
- [ ] Links are `<a>` (keyboard Tab + Enter), buttons are `<button>`
- [ ] Icons have `aria-label` or paired text
- [ ] Motion respects `prefers-reduced-motion`

---

## Anti-Patterns to Avoid

❌ **Generic copy:** "Learn More", "Explore", "Get Started", "Cutting-edge", "Seamless"  
✅ **Specific:** "View AI implementation details", "See database schema", "Clone repository"

❌ **Placeholder images as product shots:** Skeleton, loading state, or generic "coming soon"  
✅ **Labeled placeholder:** "Thumbnail coming soon (16:10 aspect)", or real screenshot

❌ **Gradient + Glow + Shadow stack:** Overdecorated, not technical  
✅ **Flat, high-contrast, minimal shadow:** Emphasizes content

❌ **Rounded corners on everything:** Pill badges, rounded buttons, rounded cards (`rounded-full`, `rounded-full`, `rounded-full`)  
✅ **Radius hierarchy:** Cards `rounded-lg` (8px), buttons `rounded` (4px), badges `rounded` (4px)

❌ **Motion on every interaction:** Cascade loads, hovers, route transitions all animated  
✅ **Motion on primary CTAs:** Featured project hover, filter toggle. Secondary: subtle fade only.

❌ **Dark theme with light mode toggle that's broken:** Both or neither, never one-way  
✅ **Dark-only with documented reason:** "Developer aesthetic, syntax visibility"

---

## Delivery Gate (Before PR)

Run through this checklist **before opening a PR:**

**Hard Gate (all must PASS):**
- [ ] No 404 links (demo, repo, social)
- [ ] Empty/loading/error/404 states all present
- [ ] Keyboard navigation works (Tab, Enter, Escape where applicable)
- [ ] Focus ring visible everywhere
- [ ] No console errors (warnings OK if known/documented)
- [ ] Contrast ≥ WCAG AA

**Quality Gate (all need one-line reason):**
- [ ] Why this color palette?
- [ ] Why Lucide icons for tech stack?
- [ ] Why this radius scale?
- [ ] Why featured badge style?
- [ ] Why this motion timing?
- [ ] Why bento grid here (not list)?

**Smoke Test (manual click-through):**
- [ ] Desktop (1440px): render, click, navigate
- [ ] Mobile (390px): no overflow, tap targets ≥44px
- [ ] Dark theme only: all text readable, no contrast issues
- [ ] Featured filter toggles correctly
- [ ] 404 slug shows error state, not blank
- [ ] Code blocks render clean (no triple nesting)

---

## References

- [anti-slop repo](https://github.com/miqdadbadjuber/anti-slop) (MIT License, v3.2.20)
- `design-system.md` (this project's direction: identity, dial, seed data)
- Lucide Icons: https://lucide.dev/ (design principles)

**License:** anti-slop adapted content is MIT. This steering file is project-specific guidance.
