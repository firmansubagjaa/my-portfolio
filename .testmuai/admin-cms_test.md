---
tags: ["admin", "cms", "e2e"]
---

# Admin CMS E2E Test

## Scenario: Admin Login and Create Project

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
