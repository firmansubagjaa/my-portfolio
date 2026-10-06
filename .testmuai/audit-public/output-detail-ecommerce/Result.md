---
test: ../detail-ecommerce_test.md
status: passed
started: 2026-10-06T04:36:20.092Z
duration_s: 103
session_id: c4bfc71f-98b0-47f3-9f00-c3f048de529f
---

# Project Detail E-Commerce Microservices Audit — Result

## Scenario: Detail page renders and back link returns to the list ✓ passed (71.4s)
md5: 0583c2ddc76d58b6da5a3c1c3cda1611
### Step 1: Open detail page
- Navigate to http://localhost:5173/projects/ecommerce-microservices
- Wait 4 seconds
- Verify page contains a heading "E-Commerce Microservices"
- Take a screenshot of the full page

### Step 2: Back navigation
- Click the link "Kembali ke Proyek"
- Wait 2 seconds
- Verify the URL ends with "/projects"
