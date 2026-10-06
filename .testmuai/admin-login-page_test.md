---
tags: ["admin", "login", "smoke"]
---

# Admin Login Page Smoke Test

## Scenario: Verify Login Page Loads

### Step 1: Navigate to Login Page
- Navigate to http://localhost:5173/admin/login
- Wait 2 seconds

### Step 2: Verify Page Elements
- Verify page contains "Login Admin"
- Verify page contains input[type="text"]
- Verify page contains input[type="password"]
- Verify page contains button with "Login"
- Verify page contains Card component

### Step 3: Verify Page Styling
- Verify input fields are visible
- Verify button is clickable
