---
tags: ["audit-public", "projects"]
---

# Projects Search Empty State Audit

## Scenario: Search with no matching project shows empty state

### Step 1: Open projects list
- Navigate to http://localhost:5173/projects
- Wait 3 seconds

### Step 2: Search for a non-existent project
- Type "zzzqqq" into the "Cari Proyek" search input
- Wait 2 seconds
- Verify page contains text "Tidak ada proyek tersedia saat ini."
- Take a screenshot of the full page
