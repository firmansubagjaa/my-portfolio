---
inclusion: fileMatch
fileMatchPattern: "client/src/**/*.tsx"
---

# Icon & Motion Design Spec

**Owner:** Firman Subagja | Full-Stack & AI/ML Engineer  
**Status:** DRAFT — Awaiting review & approval

---

## 1. Icon System

### 1.1 Lucide Icon Mapping

All icons sourced from `lucide-react` (consistent with Lucide design principles: 2px stroke, rounded joins, 24x24 canvas, low density).

#### Featured / Priority Badge
**Icon:** `Star` (filled on active)  
**Size:** 16px  
**Color:** `#F59E0B` (Burnt Amber)  
**Usage:** Project cards, featured filter button  
**Component:**
```tsx
import { Star } from 'lucide-react';

<Star size={16} className="fill-amber-500 text-amber-500" />
```

#### Tech Stack Icons

Map each technology to a Lucide icon + color:

| Tech | Lucide Icon | Color | Hex |
|------|-------------|-------|-----|
| React | `Code2` | Blue | `#3B82F6` |
| TypeScript | `Code` | Blue | `#3B82F6` |
| Node.js | `Server` | Green | `#10B981` |
| PostgreSQL | `Database` | Slate | `#64748B` |
| Python | `Code` | Yellow | `#EAB308` |
| FastAPI | `Zap` | Yellow | `#EAB308` |
| Bun | `Zap` | Amber | `#F59E0B` |
| WebSocket | `Radio` | Purple | `#A855F7` |
| Redis | `Zap` | Red | `#EF4444` |
| Docker | `Box` | Blue | `#3B82F6` |
| AWS | `Cloud` | Orange | `#F97316` |
| Tailwind | `Palette` | Cyan | `#06B6D4` |
| Transformers (HF) | `Brain` | Purple | `#A855F7` |

**Implementation:**
```tsx
// techStackIcons.ts
import { Code2, Server, Database, Zap, Radio, Code, Cloud, Box, Palette, Brain } from 'lucide-react';

export const TECH_ICONS = {
  'React': { icon: Code2, color: '#3B82F6' },
  'TypeScript': { icon: Code, color: '#3B82F6' },
  'Node.js': { icon: Server, color: '#10B981' },
  'PostgreSQL': { icon: Database, color: '#64748B' },
  'Python': { icon: Code, color: '#EAB308' },
  'FastAPI': { icon: Zap, color: '#EAB308' },
  'Bun': { icon: Zap, color: '#F59E0B' },
  'WebSocket': { icon: Radio, color: '#A855F7' },
  'Redis': { icon: Zap, color: '#EF4444' },
  'Docker': { icon: Box, color: '#3B82F6' },
  'AWS': { icon: Cloud, color: '#F97316' },
  'Tailwind': { icon: Palette, color: '#06B6D4' },
  'Transformers': { icon: Brain, color: '#A855F7' },
};

export function getTechIcon(tech: string) {
  const techConfig = TECH_ICONS[tech];
  if (!techConfig) return null;
  const { icon: Icon, color } = techConfig;
  return { Icon, color };
}
```

#### Category Icons

| Category | Lucide Icon | Color | Usage |
|----------|-------------|-------|-------|
| Full-Stack | `Layers` | Blue | Project category badge |
| AI/ML | `Brain` | Purple | Project category badge |
| Backend | `Server` | Green | Project category badge |

#### Navigation & Metadata Icons

| Element | Lucide Icon | Size | Color | Usage |
|---------|-------------|------|-------|-------|
| GitHub Link | `Github` | 18px | Muted | Project card footer, detail page |
| Demo Link | `ExternalLink` | 18px | Amber accent | Project card footer, detail page |
| Date/Published | `Calendar` | 14px | Muted | Project metadata |
| Code/Snippet | `Code` | 14px | Muted | Code block header |
| Copy Code | `Copy` | 16px | Muted → Amber on hover | Code block top-right |

---

## 2. Spacing & Visual Rhythm

### 2.1 Spacing Grid

Apply Lucide's principles: consistent, predictable, low-density.

**Base grid:** 4px units (Tailwind standard)

```
xs:   2px  (Lucide's minimum)
sm:   4px  (Tailwind: gap-1)
md:   8px  (Tailwind: gap-2)
lg:   12px (Tailwind: gap-3)
xl:   16px (Tailwind: gap-4)
2xl:  24px (Tailwind: gap-6)
```

### 2.2 Component Spacing Rules

#### Project Card
- **Internal padding:** `12px` (md) — gives breathing room without feeling empty
- **Gap between icon + text:** `6px` (sm + xs combined)
- **Gap between title + description:** `8px` (md)
- **Gap between tags:** `4px` (sm)

```tsx
// Example: Project card layout
<div className="p-3 space-y-2">
  {/* Header with featured badge */}
  <div className="flex items-center justify-between">
    <h3 className="font-semibold">Project Title</h3>
    {featured && <Star size={16} className="fill-amber-500 text-amber-500" />}
  </div>
  
  {/* Description */}
  <p className="text-sm text-muted-foreground">Description</p>
  
  {/* Tech tags with icons */}
  <div className="flex flex-wrap gap-1">
    {/* tags */}
  </div>
</div>
```

#### Hero Section
- **Top padding:** `32px` (2xl) — breathing room
- **Bottom padding:** `24px` (2xl)
- **Gap between heading + subtitle:** `12px` (lg)
- **Gap between subtitle + CTA:** `16px` (xl)

#### Navigation
- **Horizontal gap between nav items:** `16px` (xl)
- **Icon gap in nav items:** `6px` (sm + xs)

### 2.3 Visual Weight Balance

Test visual balance using **blur test** (Lucide principle):
- Compare project cards side-by-side
- Blur both to `blur(5px)`
- Icons, text, and spacing should appear **equally weighted**
- No card should look heavier/lighter than others

---

## 3. Motion & Micro-interactions

### 3.1 Hover States (Cards & Interactive Elements)

**Principle:** Subtle, purposeful, consistent.

#### Project Card Hover
```tsx
// Transition spec
{
  "duration": "200ms",
  "easing": "ease-in-out",
  "effects": {
    "shadow": "add box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)",
    "border": "change border-color from #292524 to #F59E0B (amber)",
    "scale": "apply scale(1.02) (tiny lift)",
    "icon_star": "if featured: glow effect (opacity 1 → 0.8 → 1, pulse)"
  }
}
```

**CSS:**
```css
.project-card {
  @apply border border-border transition-all duration-200;
}

.project-card:hover {
  @apply border-amber-500 shadow-lg scale-[1.02];
}

.project-card:hover .featured-star {
  @apply text-amber-400 animate-pulse;
}
```

#### Tech Tag Hover
```css
.tech-tag {
  @apply flex items-center gap-1 px-2 py-1 rounded border border-border bg-surface transition-all duration-150;
}

.tech-tag:hover {
  @apply border-amber-500 bg-amber-500/10 scale-105;
}

.tech-tag:hover .tech-icon {
  @apply text-amber-500;
}
```

#### Button / Interactive Element Hover
```css
.button {
  @apply transition-all duration-150;
}

.button:hover {
  @apply scale-105 shadow-md;
}

.button:active {
  @apply scale-95;
}
```

### 3.2 Load-in Animation (Cascade)

**Principle:** Icons + cards load in sequence (predictable, like Lucide's grid alignment).

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.project-card {
  animation: slideIn 300ms ease-out;
}

.project-card:nth-child(1) { animation-delay: 0ms; }
.project-card:nth-child(2) { animation-delay: 50ms; }
.project-card:nth-child(3) { animation-delay: 100ms; }
.project-card:nth-child(4) { animation-delay: 150ms; }
/* etc. */
```

### 3.3 Icon Transitions

#### Icon Rotation (on category change)
```css
.category-icon {
  @apply transition-transform duration-200;
}

.category-icon.active {
  @apply rotate-[360deg];
}
```

#### Icon Color Transition (featured toggle)
```css
.featured-icon {
  @apply transition-colors duration-200;
  color: #9CA3AF; /* muted */
}

.featured-icon.active {
  color: #F59E0B; /* amber */
}
```

---

## 4. Component Examples

### 4.1 Featured Badge Component

**File:** `client/src/components/ui/FeaturedBadge.tsx`

```tsx
import { Star } from 'lucide-react';

interface FeaturedBadgeProps {
  size?: number;
  showLabel?: boolean;
}

export function FeaturedBadge({ size = 16, showLabel = true }: FeaturedBadgeProps) {
  return (
    <div className="flex items-center gap-1">
      <Star 
        size={size} 
        className="fill-amber-500 text-amber-500 transition-all duration-200 hover:text-amber-400" 
      />
      {showLabel && <span className="text-xs font-medium text-amber-600">Unggulan</span>}
    </div>
  );
}
```

### 4.2 Tech Tag Component

**File:** `client/src/components/ui/TechTag.tsx`

```tsx
import { getTechIcon } from '@/lib/techStackIcons';

interface TechTagProps {
  tech: string;
  interactive?: boolean;
}

export function TechTag({ tech, interactive = false }: TechTagProps) {
  const iconData = getTechIcon(tech);
  
  if (!iconData) {
    return <span className="text-xs px-2 py-1 bg-surface border border-border rounded">{tech}</span>;
  }
  
  const { Icon, color } = iconData;
  
  return (
    <div 
      className={`
        flex items-center gap-1 px-2 py-1 rounded border bg-surface
        ${interactive ? 'cursor-pointer border-border hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-150 hover:scale-105' : 'border-border'}
      `}
    >
      <Icon 
        size={14} 
        style={{ color }}
        className={interactive ? 'transition-colors duration-150' : ''}
      />
      <span className="text-xs font-medium text-foreground">{tech}</span>
    </div>
  );
}
```

### 4.3 Project Card Component (Updated)

**File:** `client/src/components/projects/ProjectCard.tsx`

```tsx
import { Star, ExternalLink, Github } from 'lucide-react';
import { FeaturedBadge } from '@/components/ui/FeaturedBadge';
import { TechTag } from '@/components/ui/TechTag';

interface ProjectCardProps {
  title: string;
  description: string;
  featured: boolean;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
}

export function ProjectCard({ 
  title, 
  description, 
  featured, 
  tags, 
  demoUrl, 
  githubUrl 
}: ProjectCardProps) {
  return (
    <div className="project-card group border border-border rounded-lg bg-surface p-3 transition-all duration-200 hover:border-amber-500 hover:shadow-lg hover:scale-[1.02]">
      {/* Header with featured badge */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {featured && <FeaturedBadge size={16} showLabel={false} />}
      </div>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      
      {/* Tech tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {tags.map(tag => <TechTag key={tag} tech={tag} interactive={false} />)}
      </div>
      
      {/* Links footer */}
      <div className="flex gap-2">
        {demoUrl && (
          <a 
            href={demoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-500 transition-colors duration-150"
          >
            <ExternalLink size={14} />
            Demo
          </a>
        )}
        {githubUrl && (
          <a 
            href={githubUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-500 transition-colors duration-150"
          >
            <Github size={14} />
            Code
          </a>
        )}
      </div>
    </div>
  );
}
```

---

## 5. Implementation Checklist

- [ ] Install `lucide-react` in client
- [ ] Create `lib/techStackIcons.ts` with icon + color mapping
- [ ] Create `components/ui/FeaturedBadge.tsx`
- [ ] Create `components/ui/TechTag.tsx`
- [ ] Update `ProjectCard.tsx` with icons + motion styles
- [ ] Update `ProjectFilters.tsx` featured toggle (use `Star` icon)
- [ ] Update `ProjectDetailPage.tsx` metadata (use `Calendar`, `Code`, `Github`, `ExternalLink` icons)
- [ ] Update `globals.css` with motion classes (`.project-card:hover`, `.tech-tag:hover`, etc.)
- [ ] Add to seed data: tech stack tags for each project
- [ ] Test visual weight balance (blur test on cards)
- [ ] Test hover animations in browser
- [ ] Test cascade load-in animation

---

## 6. Color Reference

**Warm Charcoal & Burnt Amber Palette:**
- Background: `#0C0A09`
- Surface: `#1C1917`
- Border: `#292524`
- Amber Accent: `#F59E0B`
- Muted: `#9CA3AF`
- Foreground: `#FAFAF9`

**Icon Colors (from table above):**
- Blue: `#3B82F6`
- Green: `#10B981`
- Yellow: `#EAB308`
- Purple: `#A855F7`
- Red: `#EF4444`
- Orange: `#F97316`
- Cyan: `#06B6D4`

---

## Notes

- All animations use `ease-in-out` timing function for smoothness
- Icon sizes: 14–18px for interactive elements, 16–20px for badges
- Motion durations: 150–200ms for micro-interactions, 300ms for cascade loads
- All transitions respect `prefers-reduced-motion` (implement with `@media (prefers-reduced-motion: reduce)`)
- No spinning, bouncing, or distracting animations—only purposeful transitions

---

**Next:** Review & approve this spec. Once approved, proceed with seed data + implementation.
