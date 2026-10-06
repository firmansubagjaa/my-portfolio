---
test: ../projects-search-empty_test.md
status: passed
started: 2026-10-06T04:38:45.213Z
duration_s: 59
session_id: 20e64efa-e28c-40dd-ae1e-2a5a92713ac6
---

# Projects Search Empty State Audit — Result

## Scenario: Search with no matching project shows empty state ✓ passed (52.4s)
md5: d32aba6d8f75e362808bc65b396d1be4
### Step 1: Open projects list
- Navigate to http://localhost:5173/projects
- Wait 3 seconds

### Step 2: Search for a non-existent project
- Type "zzzqqq" into the "Cari Proyek" search input
- Wait 2 seconds
- Verify page contains text "Tidak ada proyek tersedia saat ini."
- Take a screenshot of the full page
