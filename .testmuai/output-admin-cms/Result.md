---
test: ../admin-cms_test.md
status: failed
started: 2026-10-05T01:02:14.561Z
duration_s: 150
session_id: a30559e0-d687-4892-9e61-6513ec2c49f8
---

# Admin CMS E2E Test — Result

## Scenario: Admin Login and Create Project ✗ failed (144s)
md5: 67cc7f81c1f30b9ad773728d2b521883
Reason: AP determined agent is stuck — no viable actions remain — bug verdict: Admin login blocked by rate limit [environment_issue/bot_detection, confidence 0.98]
### Step 1: Navigate to Login Page
- Navigate to http://localhost:5173/admin/login
- Wait for page load
- Verify page contains "Login Admin"

### Step 2: Login
- Fill input[type="text"] with "admin"
- Fill input[type="password"] with "@Avenged123"
- Click button containing "Login"
- Wait 3 seconds

### Step 3: Verify Dashboard
- Verify URL matches /admin$
- Verify page contains "Dashboard Admin"

### Step 4: Verify Create Project Button
- Verify page contains button or link with "Create" or "Buat Proyek"

### Step 5: Logout
- Click button containing "Logout"
- Wait 2 seconds
- Verify URL matches /admin/login
