# Admin CMS E2E Test

## Scenario: Admin Login and Create Project

### Step 1: Navigate to Login Page
- Navigate to http://localhost:5173/admin/login
- Verify page title contains "Login"

### Step 2: Login
- Fill username with "admin"
- Fill password with "@Avenged123"
- Click "Login" button
- Wait for page to redirect to /admin

### Step 3: Verify Dashboard
- Verify URL is /admin
- Verify page displays "Dashboard Admin"
- Verify "Create Project" button exists

### Step 4: Create New Project
- Click "Create Project" or "+ Buat Proyek" button
- Navigate to /admin/projects/new

### Step 5: Fill Project Form
- Fill Title with "E2E Test Project"
- Wait 2 seconds (slug check)
- Verify slug field shows green checkmark
- Select Category "web"
- Select Status "published"
- Fill Summary with "Test project created via e2e"
- Fill Description with "# Test\n\nThis is a test project"

### Step 6: Save Project
- Scroll to bottom
- Click "Save" or "Simpan" button
- Wait for success notification

### Step 7: Verify Redirect
- Verify URL redirects back to /admin
- Verify new project appears in table
- Verify table contains "E2E Test Project"

### Step 8: Logout
- Click "Logout" button
- Verify redirected to /admin/login
