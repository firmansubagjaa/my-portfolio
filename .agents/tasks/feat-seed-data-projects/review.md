# Seed Data: 4 Realistic Projects

This change adds 4 representative projects to the database seed, covering Full-Stack, AI/ML, Backend, and Data categories with realistic technical depth. Three projects are featured, one is not—a split that exercises the filter logic. The content is multi-paragraph Markdown with domain-specific code snippets, architecture trade-offs, and performance metrics. All fields required by the API schema are present and populated.

**Watch for:** The verification covers schema compliance, API contract validation, and anti-slop standards; deployment readiness hinges on whether your local database schema matches the schema.ts version in the branch.

**Verdict**: APPROVED

## High-level view

All 4 projects follow the established schema and carry technical depth appropriate for a senior engineer's portfolio. The featured/non-featured split correctly enables filter testing: 3 projects return on `?featured=true`, 1 does not. Descriptions avoid AI-slop patterns—no "seamless", "innovative", or "cutting-edge"—instead grounding claims in concrete metrics (F1-score 0.94, sub-100ms latency, 99.99% delivery). Code snippets are realistic and demonstrate domain-specific patterns (React hooks with WebSocket cleanup, FastAPI async inference, Bun connection lifecycle, Spark job orchestration). Placeholder URLs are unmistakably non-real (`placeholder.example.com`, `#` for demo links). The content fields are multi-paragraph Markdown, each articulating problem statement, technical approach, performance trade-offs, and real-world outcome. Seeding is wired to run via `bun run db:seed` and uses `onConflictDoNothing` to idempotently handle duplicate runs.

<details>
<summary>Issues (0)</summary>

No blocking concerns.

</details>

<details>
<summary>Details</summary>

### Project Coverage & Category Representation

All four projects present across Full-Stack (React + Node.js + WebSocket), AI/ML (DistilBERT + FastAPI), and Backend (Bun + WebSocket, Spark + Airflow). This distribution covers stated expertise areas and provides varied test data for layout and category filtering.

### Featured Flag & Filter Testing

Featured distribution: 3 true, 1 false (ETL Data Pipeline). Verification confirms `GET /api/v1/projects?featured=true` returns exactly 3 projects; the non-featured project is excluded. This split exercises both filter presence and absence.

### Schema Compliance & Required Fields

All fields present and within schema bounds: title (max 120, longest 31 chars), slug (kebab-case, 3-100 range), summary (10-280 chars), content (2800–3400 chars Markdown with code), category (valid enums), tech_stack (4-6 items), status (all "published"), is_featured (3 true / 1 false), thumbnail_url (with 16-10 aspect-ratio hint), repo/demo URLs (placeholder.example.com / #).

### Anti-Slop Compliance

No filler language present. Descriptions use domain-specific terminology ("TimescaleDB extension for time-series", "ONNX Runtime for inference speed", "Spark SQL transformation") and articulate trade-offs explicitly ("DistilBERT: 2x inference speed at 3% accuracy loss", "Chose WebSocket over SSE for bidirectional handshakes"). Statistics are concrete and contextual: F1-score 0.94, sub-100ms p99 latency, 99.99% delivery, 100K concurrent connections—all grounded in realistic metrics for their respective domains.

### Code Snippets: Realism & Syntax Highlighting Ready

Each snippet demonstrates a core domain pattern: React hooks with WebSocket cleanup (AI Dashboard), FastAPI async inference (Sentiment Engine), Bun WebSocket handler with connection lifecycle (Notification System), and Spark job orchestration (ETL Pipeline). All are syntactically valid and suitable for code highlighting; no pseudo-code.

### Placeholder URLs & Asset Hints

Thumbnail URLs embed aspect-ratio hint in filename (`*-16-10.png`); demo URLs use `#` (safe no-op href); repo URLs use `placeholder.example.com` (unmistakably non-functional). CMS updates can use these as-is without confusion about what is real vs. placeholder.

### Content Depth & Structure

Each project content section follows: problem/motivation → architecture/stack → implementation (with code snippet) → performance metrics & real-world impact → trade-offs & design decisions. Example: AI Dashboard spans latency requirement, React + Node + WebSocket + Redis + PostgreSQL architecture, useEffect pattern with connection pooling, p99 latency + concurrent user metrics, and WebSocket vs SSE trade-offs. This is senior engineer documentation, not marketing.

### Seeding Mechanism & Idempotency

Projects inserted via `onConflictDoNothing` on slug, enabling idempotent runs: `bun run db:seed` multiple times succeeds without duplicate insertion errors. Verification confirms first and re-runs both succeed (conflicts silently ignored).

### API Contract Validation

List endpoint (`/api/v1/projects`) returns 4 projects with all required fields; featured filter (`?featured=true`) returns exactly 3. Detail endpoint includes full Markdown content. 404 handling confirmed on invalid slug. All project counts and featured flags verified correct.

</details>

## File map

| File | Change |
|------|--------|
| `server/src/db/seed.ts` | Replace example projects array with 4 realistic projects (Full-Stack, AI/ML, Backend ×2). Add domain-specific code snippets, multi-paragraph Markdown content, realistic metrics, and anti-slop copy. 274 insertions, 47 deletions. |

**Full diff:** `git diff HEAD~1 HEAD --stat` shows `server/src/db/seed.ts | 321 ++++++++++++++++++++++++++++++++++++++++++--------`
