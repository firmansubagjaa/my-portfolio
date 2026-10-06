---
test: ../not-found_test.md
status: passed
started: 2026-10-06T04:38:18.716Z
duration_s: 94
session_id: 60341fd0-59d6-490d-a186-18c716fed090
---

# Not Found States Audit — Result

## Scenario: Unknown slug and unknown path ✓ passed (87.2s)
md5: bd9c36e4f5b901563ced768e64b27601
### Step 1: Unknown project slug
- Navigate to http://localhost:5173/projects/does-not-exist
- Wait 5 seconds
- Take a screenshot of the visible page
- Report the main message text shown on the page

### Step 2: Unknown path
- Navigate to http://localhost:5173/random-path
- Wait 3 seconds
- Verify page contains a heading "Halaman Tidak Ditemukan"
- Take a screenshot of the visible page
