---
test: ../admin-login-and-dashboard_test.md
status: passed
started: 2026-10-05T01:19:39.166Z
duration_s: 62
session_id: 45f5df21-fc1f-495f-9782-da20a1a658b3
---

# Admin Login and Dashboard — Result

## Scenario: Login and View Dashboard ✓ passed (58.1s)
md5: 868eae803b08f4636cbf51289e72b2a4
### Step 1: Navigate to Login
- Navigate to http://localhost:5173/admin/login
- Wait 2 seconds

### Step 2: Fill Login Form
- Fill input with "admin"
- Wait 1 second

### Step 3: Fill Password
- Fill password input with "@Avenged123!"
- Wait 1 second

### Step 4: Click Login
- Click button containing "Login"
- Wait 5 seconds

### Step 5: Verify Dashboard
- Verify page contains "Manajemen Proyek"
- Verify page contains "Logout"
