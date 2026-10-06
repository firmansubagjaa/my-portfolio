---
tags: ["audit-public", "detail"]
---

# Project Detail E-Commerce Microservices Audit

## Scenario: Detail page renders and back link returns to the list

### Step 1: Open detail page
- Navigate to http://localhost:5173/projects/ecommerce-microservices
- Wait 4 seconds
- Verify page contains a heading "E-Commerce Microservices"
- Take a screenshot of the full page

### Step 2: Back navigation
- Click the link "Kembali ke Proyek"
- Wait 2 seconds
- Verify the URL ends with "/projects"
