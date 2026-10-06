---
tags: ["audit-public", "404"]
---

# Not Found States Audit

## Scenario: Unknown slug and unknown path

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
