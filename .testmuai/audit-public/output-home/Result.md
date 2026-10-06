---
test: ../home_test.md
status: passed
started: 2026-10-06T04:36:20.526Z
duration_s: 108
session_id: db1cd306-4afa-4a9b-8bb7-f1f054b2ad0c
---

# Public Home Page Audit — Result

## Scenario: Home page renders hero and featured projects ✓ passed (77.1s)
md5: aea2834406f6ace339626e4d139010c5
### Step 1: Open home
- Navigate to http://localhost:5173/
- Wait 3 seconds

### Step 2: Inspect hero
- Verify page contains a heading "Selamat Datang"
- Verify page contains a link "Lihat Semua Proyek"
- Take a screenshot of the full page

### Step 3: Inspect featured projects
- Verify page contains a heading "Proyek Unggulan"
- Verify page contains a project card titled "AI Chat Platform"
- Scroll to the bottom of the page and verify the footer is visible
