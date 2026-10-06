# Implementation Plan: Seed Data for 4 Realistic Projects

## Overview
This PR adds 4 realistic dummy projects to the portfolio backend for testing layout, filter logic, and code syntax highlighting. The seed data covers Full-Stack, AI/ML, Backend, and Data Pipeline categories with 3 featured projects and 1 non-featured (for filter testing).

## Project Schema & Field Mapping
Based on `server/src/db/schema.ts` and `server/src/shared/dto.ts`, each project includes:
- `id`: UUID (auto-generated)
- `title`: string, max 120 chars
- `slug`: string, unique, kebab-case, 3-100 chars
- `summary`: string, 10-280 chars (short description for list view)
- `content`: string, Markdown (long technical overview for detail page)
- `thumbnail_url`: string | null (placeholder URL)
- `gallery_urls`: string[] (empty array for seed data)
- `tech_stack`: string[] (max 20 items)
- `category`: enum "fullstack" | "ai_ml" | "frontend" | "backend" | "experiment"
- `repo_url`: string | null (placeholder or public repo)
- `demo_url`: string | null (placeholder #)
- `notebook_url`: string | null (not used in seed)
- `is_featured`: boolean (true for Projects 1–3, false for Project 4)
- `status`: enum "draft" | "published" | "archived" (all "published")
- `created_at`: timestamp (ISO format, auto-set by DB)
- `updated_at`: timestamp (auto-set by DB)

## Project Details

### Project 1: AI-Powered Dashboard
- **Title:** AI-Powered Dashboard
- **Slug:** ai-powered-dashboard
- **Category:** fullstack
- **Featured:** true
- **Date:** 2024-09-15
- **Summary:** Real-time analytics dashboard with AI-driven insights
- **Tech Stack:** React, TypeScript, Node.js, PostgreSQL, WebSocket, Redis
- **Statistics:** Sub-100ms API latency, 1K concurrent users, Lighthouse 98
- **Code Snippet:** TypeScript React hook (useEffect + API fetch + WebSocket)
- **Repo:** https://placeholder.example.com/repo
- **Demo:** #
- **Thumbnail:** https://placeholder.example.com/thumbnail-16-10.png (placeholder: "Thumbnail coming soon (16:10 aspect)")

### Project 2: Sentiment Analysis Engine
- **Title:** Sentiment Analysis Engine
- **Slug:** sentiment-analysis-engine
- **Category:** ai_ml
- **Featured:** true
- **Date:** 2024-08-20
- **Summary:** Production ML API for text sentiment analysis with sub-100ms latency
- **Tech Stack:** Python, FastAPI, Transformers, Redis, Docker
- **Statistics:** 99.8% uptime, 500+ requests/sec, F1-score 0.94
- **Code Snippet:** Python FastAPI route with async handler
- **Repo:** https://placeholder.example.com/repo
- **Demo:** #
- **Thumbnail:** placeholder

### Project 3: Real-time Notification System
- **Title:** Real-time Notification System
- **Slug:** realtime-notification-system
- **Category:** backend
- **Featured:** true
- **Date:** 2024-07-10
- **Summary:** Scalable WebSocket-based notification service with delivery guarantees
- **Tech Stack:** Bun, WebSocket, PostgreSQL, Docker, Redis
- **Statistics:** <50ms message latency, 100K connections, 99.99% delivery
- **Code Snippet:** JavaScript/TypeScript WebSocket handler
- **Repo:** https://placeholder.example.com/repo
- **Demo:** #
- **Thumbnail:** placeholder

### Project 4: ETL Data Pipeline
- **Title:** ETL Data Pipeline
- **Slug:** etl-data-pipeline
- **Category:** backend
- **Featured:** false (for filter testing)
- **Date:** 2024-06-01
- **Summary:** Distributed data pipeline for processing 10M+ events daily
- **Tech Stack:** Python, Apache Spark, PostgreSQL, Docker
- **Statistics:** Sub-hour processing, 99.5% data accuracy
- **Code Snippet:** Python Spark job definition
- **Repo:** https://placeholder.example.com/repo
- **Demo:** #
- **Thumbnail:** placeholder

## Implementation Steps

- [ ] 1. Update `server/src/db/seed.ts` to add 4 realistic projects.
      Replace the `exampleProjects` array with 4 projects matching the schema above. Each project includes realistic multi-paragraph Markdown content with context, architecture, code snippets, and benchmarks. No generic AI-slop language ("cutting-edge", "seamless", "innovative").
      Files: `server/src/db/seed.ts`
      Verify: `cd server && bun run db:seed` — confirm output shows "✅ Seed completed successfully!" and no errors in console.

- [ ] 2. Confirm seeding is wired on database init and server startup.
      The seed function is standalone and triggered via `bun run db:seed` (package.json script). Verify that running `bun run dev` in the server directory connects to the database and prepares it (seeding is manual via CLI, not auto-init on server start). This is acceptable per design: developers run seed explicitly during setup.
      Files: `server/src/db/seed.ts`, `server/package.json` (no changes needed)
      Verify: Review `server/package.json` to confirm `db:seed` script exists → it does. No changes needed.

- [ ] 3. Test API endpoint: GET /api/v1/projects (all projects, published status).
      Start dev server with `cd server && bun run dev`. Call `GET http://localhost:3000/api/v1/projects` and verify response includes 4 projects with all fields populated: title, slug, summary, tech_stack (array), category, is_featured, status, created_at, updated_at, thumbnail_url, repo_url, demo_url. Verify content is NOT included (list endpoint excludes it). Verify ordering is by is_featured DESC then created_at DESC (featured first, then by date).
      Files: (no changes)
      Verify: `curl -s http://localhost:3000/api/v1/projects | jq '.'` — should return 4 projects in list; confirm `success: true`, `items` array has 4 objects, each with id, title, slug, category, is_featured, status, dates.

- [ ] 4. Test API endpoint: GET /api/v1/projects?featured=true (featured projects only).
      Call `GET http://localhost:3000/api/v1/projects?featured=true` and verify response includes exactly 3 projects (Projects 1, 2, 3). Verify is_featured=true on all 3. Verify Project 4 (ETL Data Pipeline) is NOT in the response.
      Files: (no changes)
      Verify: `curl -s 'http://localhost:3000/api/v1/projects?featured=true' | jq '.data.items | length'` — should return 3.

- [ ] 5. Test API endpoint: GET /api/v1/projects/:slug (full project detail with content).
      Call `GET http://localhost:3000/api/v1/projects/ai-powered-dashboard` and verify response includes full project DTO with content field (Markdown), all tech_stack items, and correct statistics. Verify content is multi-paragraph Markdown with code snippets, context, architecture, benchmarks.
      Files: (no changes)
      Verify: `curl -s http://localhost:3000/api/v1/projects/ai-powered-dashboard | jq '.data.content | length'` — should return string length > 500 chars.

- [ ] 6. Test 404 on invalid slug.
      Call `GET http://localhost:3000/api/v1/projects/nonexistent-slug` and verify response is HTTP 404 with error message "Proyek tidak ditemukan" (NotFoundError).
      Files: (no changes)
      Verify: `curl -s http://localhost:3000/api/v1/projects/nonexistent-slug | jq '.status'` — should return 404.

- [ ] 7. Verify database constraints and indexing.
      Confirm slug unique constraint prevents duplicates. Run seed twice: first run succeeds, second run shows "onConflictDoNothing" behavior (no duplicate insertion error). Verify index on is_featured allows filter queries to use index.
      Files: (no changes; constraints enforced by schema.ts)
      Verify: `cd server && bun run db:seed` twice — first outputs "✅ Seed completed successfully!", second also succeeds (onConflictDoNothing silently skips duplicates).

- [ ] 8. Commit changes with proper message.
      Stage `server/src/db/seed.ts` and commit with message: `feat: add seed data for 4 realistic projects (Full-Stack, AI/ML, Backend, Data)`.
      Files: `server/src/db/seed.ts`
      Verify: `git log --oneline -1` in worktree branch shows commit message.

## Build & Verification Commands

**Worktree:** `d:\File Defir\Projects\My Portfolio\.worktrees\seed-data-projects`

**Dev Server Start:**
```bash
cd server
bun run dev
# Expected: Server listens on http://localhost:3000
```

**Seed Data:**
```bash
cd server
bun run db:seed
# Expected: ✅ Seed completed successfully!
```

**Typecheck & Lint:**
```bash
cd server
bun run typecheck  # tsc --noEmit
bun run lint       # biome check .
```

**Test Projects List (all):**
```bash
curl -s http://localhost:3000/api/v1/projects | jq '.data | {count: (.items | length), featured_count: (.items | map(select(.is_featured)) | length)}'
# Expected: { "count": 4, "featured_count": 3 }
```

**Test Featured Filter:**
```bash
curl -s 'http://localhost:3000/api/v1/projects?featured=true' | jq '.data.items | map(.title)'
# Expected: [ "AI-Powered Dashboard", "Sentiment Analysis Engine", "Real-time Notification System" ]
```

**Test Detail View:**
```bash
curl -s http://localhost:3000/api/v1/projects/ai-powered-dashboard | jq '.data | {title, category, status, is_featured, content_length: (.content | length)}'
# Expected: { "title": "AI-Powered Dashboard", "category": "fullstack", "status": "published", "is_featured": true, "content_length": > 500 }
```

## Design & Scope Notes

- **No AI-slop:** All descriptions are technical and specific. No "cutting-edge", "seamless", "innovative" filler.
- **Placeholder URLs:** Demo URLs use `#` (valid href, no navigation). Repo/thumbnail URLs use `https://placeholder.example.com/...` clearly marked as placeholder.
- **Thumbnail Hints:** URLs include aspect-ratio info (e.g., `-16-10`) for future CMS implementation. Placeholder comment documents intended dimensions.
- **Code Snippets:** Real, plausible code (TypeScript, Python, JavaScript) suitable for syntax highlighting test. Each snippet demonstrates a core concept (React hook + WebSocket, FastAPI async, Spark job).
- **Statistics:** Realistic context-specific metrics (e.g., F1-score for ML, message latency for realtime, data accuracy for pipeline).
- **Featured Filter:** 3 projects featured (`is_featured: true`), 1 non-featured (`is_featured: false`). Tests filter logic end-to-end.
- **Categories:** Full-Stack (fullstack), AI/ML (ai_ml), Backend (backend). Matches design system spec.
- **Status:** All published (not draft, not archived) so they appear in public API by default.

## Anti-Slop Compliance Checklist

- [x] No generic copy ("Learn More", "Explore", "innovative")
- [x] Descriptions specific to each project's domain (analytics, ML, realtime, data)
- [x] Code snippets are realistic and runnable (not pseudo-code)
- [x] Statistics carry domain context (F1-score for ML, latency for realtime, accuracy for pipeline)
- [x] Placeholder URLs clearly marked (placeholder.example.com, #)
- [x] Thumbnail URLs include aspect-ratio hint (16:10)
- [x] Featured/non-featured split enables filter testing
- [x] Tech stacks are real and domain-appropriate
- [x] Multi-paragraph content demonstrates project depth
