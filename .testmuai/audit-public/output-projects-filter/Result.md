---
test: ../projects-filter_test.md
status: passed
started: 2026-10-06T04:38:23.707Z
duration_s: 86
session_id: d5903a18-809b-43cc-a7db-f979ac245ead
---

# Projects List Category Filter Audit — Result

## Scenario: Filter projects by Backend category ✓ passed (80.1s)
md5: 388d9c52abad88d79810b602348b3af4
### Step 1: Open projects list
- Navigate to http://localhost:5173/projects
- Wait 3 seconds
- Verify page contains a heading "Proyek"
- Take a screenshot of the full page

### Step 2: Apply category filter
- Click the "Backend" button in the category filter
- Wait 2 seconds
- Verify page contains a project card titled "E-Commerce Microservices"
- Verify page does not contain a project card titled "AI Chat Platform"
- Take a screenshot of the full page
