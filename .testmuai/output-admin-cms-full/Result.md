---
test: ../admin-cms-full_test.md
status: failed
started: 2026-10-05T01:14:12.159Z
duration_s: 298
session_id: 97ec35d4-941b-4c43-9ac6-c24c180e3ffc
---

# Admin CMS Full E2E Test — Result

## Scenario: Complete Admin Workflow - Login → Create Project → Dashboard ✗ failed (293s)
md5: 2be3d6cff2f62093a7bd11e42c63fef1
Reason: v16-runner exited unexpectedly mid-run (code=null, signal=SIGTERM)
agja\AppData\Local\v16-runner\0.8.20\v16_runner\cli\harness.py", line 2581, in run_harness
  File "C:\Users\Firman Subagja\AppData\Local\v16-runner\0.8.20\asyncio\runners.py", line 190, in run
  File "C:\Users\Firman Subagja\AppData\Local\v16-runner\0.8.20\asyncio\runners.py", line 123, in run
KeyboardInterrupt
Traceback (most recent call last):
  File "C:\Users\Firman Subagja\AppData\Local\v16-runner\0.8.20\weakref.py", line 369, in remove
OSError: Signal 2 ignored due to race condition

### Step 1: Navigate to Login Page
- Navigate to http://localhost:5173/admin/login
- Wait 2 seconds

### Step 2: Login with Admin Credentials
- Fill input[type="text"] with "admin"
- Fill input[type="password"] with "@Avenged123!"
- Click button containing "Login"
- Wait 3 seconds for redirect

### Step 3: Verify Dashboard Loaded
- Verify URL matches /admin$
- Verify page contains "Manajemen Proyek"
- Verify page contains "Logout" button

### Step 4: Navigate to Create Project
- Click button or link containing "Create" or "Buat" or "Edit Project"
- Wait 2 seconds

### Step 5: Fill Project Form - Title
- Verify page contains "Title" or "Judul"
- Fill input with "E2E Test Project" in title field
- Wait 2 seconds (for slug check)

### Step 6: Fill Project Form - Other Fields
- Verify page contains "Category" or "Kategori"
- Select dropdown option "web" or "Web Development"
- Verify page contains "Status" or "Status"
- Select dropdown option "published" or "Published"

### Step 7: Save Project
- Scroll to bottom of form
- Click button containing "Save" or "Simpan"
- Wait 3 seconds

### Step 8: Verify Success
- Verify URL redirects back to /admin
- Verify page contains "Manajemen Proyek" or "E2E Test Project"

### Step 9: Logout
- Click button containing "Logout" or "Keluar"
- Wait 2 seconds
- Verify URL matches /admin/login
