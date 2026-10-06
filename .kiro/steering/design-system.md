---
inclusion: fileMatch
fileMatchPattern: "client/src/**/*.tsx"
---

# Portfolio Design System

**Owner:** Firman Subagja | Full-Stack & AI/ML Engineer  
**Status:** FINAL — Approved and ready for implementation

---

## Identity

**Display:** Firman Subagja (heading) — Full-Stack & AI/ML Engineer (sub-heading)  
**Positioning:** Full-Stack & AI/ML Engineer — Building high-performance web products & scalable AI pipelines.  
**Location:** Indonesia (WIB / UTC+7)  
**Availability:** Open to opportunities (Full-time & Project-based)  
**Visual:** Wordmark text (Lexend typography, no decorative profile photo for high-signal aesthetic)

## Design Direction

**Visual Style:** Technical/Modern + Minimal/Clean  
**Tone:** Direct & Technical — lugas, profesional, fokus pada kapabilitas dan solusi  
**Language:** English (maximize global recruiter reach, software engineering standards)  
**Target Audience:** Tech leads & recruiters (local Indonesia + international)  
**Motion Dial:** ENERGY 2 / RHYTHM 2 / MOTION 1 (functional animations, responsive feedback, never distracting)

## Color Palette

All values use Warm Charcoal & Burnt Amber theme, selected for dark-mode developer aesthetic, high contrast, eye comfort, and syntax highlighting visibility.

- **Background:** `#0C0A09` (deep charcoal)
- **Surface:** `#1C1917` (warm charcoal surface)
- **Border:** `#292524` (mid charcoal)
- **Accent:** `#F59E0B` (burnt amber—primary interactive element)
- **Muted/Secondary:** Grays derived from charcoal base (subtle, readable)

**Rationale:** Dark mode is consistent with developer aesthetic, high contrast enables extended reading of case studies and code, and warm amber accent balances the cool charcoal without eye strain. This palette is production-focused, not trendy.

**Application:**
- Use Tailwind `@theme` tokens (defined in `globals.css`) for all color values
- Accent color for CTAs, active states, and highlights
- Border color for subtle dividers and input outlines
- Surface for cards, modals, elevated sections
- Background for page base

## Typography

**Body & Headings:** [Lexend](https://www.lexend.com/) (modern, geometric, high readability—chosen for legible case study content and cross-cultural accessibility)  
**Code & Metadata:** JetBrains Mono (technical, monospace, consistent—trusted standard for code visibility and metadata labeling)

**Rationale:** Lexend provides comfortable reading for longer technical narratives without forcing sans-serif monotony. JetBrains Mono is industry-standard for developer tools and code blocks. Together they signal "built by engineers, for engineers" without generic AI-design feel.

**Usage:**
- h1 (Hero): Lexend, bold, large (32–48px), minimal spacing
- h2 (Section): Lexend, bold, 24–32px
- h3 (Card Title): Lexend, semibold, 18–20px
- Body: Lexend, regular, 14–16px
- Code blocks: JetBrains Mono, regular, 12–14px
- Metadata/Tags: JetBrains Mono, small, 11–13px

## Component Specs

### Hero Section (HomePage)
- Full-width, minimal vertical padding
- Clear h1: "Firman Subagja — Full-Stack & AI/ML Engineer"
- Subtitle: short, direct tagline in muted text
- CTA button: amber accent, clear label (e.g., "View Work")
- No hero image—embrace whitespace; opt for subtle gradient or accent line if needed

### Project Cards (ProjectsPage, Bento Grid)
- **Size:** Flexible grid (2–3 cols desktop, 1 col mobile)
- **Layout:** Title, category tag, description, featured indicator
- **Featured Filter:** Toggle button to show only `featured: true` projects
- **Interactions:** Hover—subtle elevation (shadow), border highlight, accent color on interaction
- **Category Tags:** Use JetBrains Mono, small, muted background with border
- **Featured Badge:** Amber accent, clearly visible (e.g., "Featured" label or star icon)

### Project Detail Page
- Clean layout: hero image (or placeholder), title, metadata (category, date, tech stack)
- Description in body Lexend
- Code blocks: syntax-highlighted, JetBrains Mono, clean container (flatten nested divs)
- Related projects: 2–3 cards below
- 404 state: clear messaging, link back to projects

### Code Blocks
- Language badge: top-left corner, JetBrains Mono, muted
- Copy button: top-right, amber accent on hover
- Container: single div with border, surface background, no triple nesting
- Line numbers: optional, muted color
- Syntax highlighting: use Shiki or PrismJS with warm charcoal theme

### Navigation & 404 Page
- Clear hierarchy, minimal design
- 404 page: "404 — Not Found" with link to home or projects
- Nav: sticky or fixed, clean links, accent on active

## Seed Data (3–4 Realistic Dummy Projects)

Until projects are input via Admin CMS, use realistic dummy projects representing core competencies:

1. **Full-Stack:** e.g., "SaaS Dashboard" — React + TypeScript + Node.js + PostgreSQL + Tailwind
2. **AI/ML:** e.g., "ML-Powered API" — Python + FastAPI + Transformers + Redis
3. **Backend/Infrastructure:** e.g., "Real-time Service" — Bun + WebSocket + Streaming
4. (Optional) **Mixed/Experimental:** e.g., "Data Pipeline" — Python + Apache Spark + Docker

**Each project includes:**
- Title, slug, description (short + long)
- Category (Full-Stack, AI/ML, Backend), tags (tech stack)
- Featured flag (mix: 2-3 featured, 1 non-featured for filter testing)
- Date, **placeholder thumbnail** (minimalist label "Thumbnail coming soon", aspect-ratio 16:10 or 4:3)
- Demo link (# or placeholder), GitHub link (# or public repo)
- Code snippet for detail page (realistic, syntax-highlighted)
- Statistics (realistic placeholders: "Sub-100ms latency", "Lighthouse 100", "1K concurrent")

**Rationale:** Placeholder data allows testing Bento Grid layout, featured filter, code block rendering, and animations. Real data imported via CMS after layout is verified.

## Design Principles (Anti-Slop Guidelines)

This portfolio adopts [anti-slop](https://github.com/miqdadbadjuber/anti-slop) (MIT License) as a filter: every visual decision must have a one-sentence justification; no generic templates, decorative fluff, or AI-generated copy. The design is deliberate, not templated.

1. **Signal-to-Noise:** Every element has a purpose. Remove decorative clutter.
2. **Hierarchy:** Typography and spacing make scannability clear. No guessing the order of importance.
3. **Consistency:** Color, spacing, font usage—predictable across all pages. Icons match Lucide's strict design system.
4. **Motion:** Animations are functional (feedback on interaction), not distracting. 150-200ms hover transitions, 300ms cascade loads. Respect `prefers-reduced-motion`.
5. **Whitespace:** Breathing room. Don't cram content.
6. **Interactive Feedback:** Every button, link, filter—shows clear state (hover, active, disabled).
7. **Identity:** All content tied to Firman's name, positioning, and technical focus. No filler copy or generalized branding.
8. **Tech Stack Visibility:** Icons + colors for technologies signal at a glance (React = Code2 icon, Python = Code icon, etc.). This is not decoration; it's information architecture.

**Delivery Gate:** Before shipping, verify:
- No generic copy ("Learn More", "Explore", "Get Started")
- All links resolve (no 404 demo links)
- 404 slug state handled gracefully
- Featured filter works correctly
- Code blocks render without triple nesting
- Empty/loading/error states present
- Console clean, no warnings
- Contrast WCAG AA (verified)
- Keyboard/focus accessible
- Motion respects `prefers-reduced-motion`

## Implementation Order

1. ✅ Bug fixes (404, featured filter, code blocks) — PR #15 merged
2. ⏭️ **Seed data** (3-4 realistic projects, Lucide icons, spacing)
3. ⏭️ **Icon system** (integrate Lucide, tech stack colors, Featured badge)
4. ⏭️ **Spacing & motion** (apply grid, hover states, cascade animations)
5. ⏭️ **Hero polish** (Firman's name, positioning, CTA clarity)
6. ⏭️ **Card design** (featured badge, category tags, hover feedback)
7. ⏭️ **Detail page** (hero image, gallery, meta header, related projects)
8. ⏭️ **Navigation & 404** (clear error messaging, consistent nav)
9. ⏭️ **SEO & polish** (Helmet per page, final micro-refinements)
10. ⏭️ **Additional sections** (About, Skills/Stack, Contact, CV download)

---

## Lucide Icon System

**Star Icon (Featured Badge):**
```tsx
import { Star } from 'lucide-react';
<Star size={16} className="fill-amber-500 text-amber-500" />
```
*Rationale:* Immediately recognizable as "featured" or "priority" without text. Amber matches accent color.

**Tech Stack Icons & Colors:**

| Tech | Icon | Color | Rationale |
|------|------|-------|-----------|
| React | Code2 | #3B82F6 (Blue) | Frontend/UI ecosystem |
| TypeScript | Code | #3B82F6 (Blue) | Language tier |
| Node.js | Server | #10B981 (Green) | Backend/runtime |
| Python | Code | #EAB308 (Yellow) | ML/scripting tier |
| FastAPI | Zap | #EAB308 (Yellow) | API/async tier |
| PostgreSQL | Database | #64748B (Slate) | Data tier |
| Bun | Zap | #F59E0B (Amber) | Runtime/build |
| WebSocket | Radio | #A855F7 (Purple) | Realtime/protocol |
| Redis | Zap | #EF4444 (Red) | Cache/queue |
| Docker | Box | #3B82F6 (Blue) | Infrastructure |
| Transformers (HF) | Brain | #A855F7 (Purple) | ML/AI tier |

*Rationale:* Color grouping by layer (Frontend/UI = Blue, Backend/Runtime = Green/Amber, Data = Slate, AI/ML = Purple) enables quick scanning of tech stack depth. Icons from Lucide maintain consistency with design system (2px stroke, low density). All colors part of extended palette (7 colors total, justified by categorical information hierarchy per anti-slop R-29).

**Category Icons:**
- Full-Stack: `Layers` (Blue)
- AI/ML: `Brain` (Purple)
- Backend: `Server` (Green)

**Metadata Icons:**
- GitHub Link: `Github` (18px, Muted)
- Demo Link: `ExternalLink` (18px, Amber accent on hover)
- Published Date: `Calendar` (14px, Muted)
- Code Snippet: `Code` (14px, Muted)
- Copy Code: `Copy` (16px, Muted → Amber on hover)
