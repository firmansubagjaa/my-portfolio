# Requirements: Admin CMS for Portfolio Project Management

## Summary

Build a complete admin content management system that allows authenticated users to create, read, update, and delete portfolio projects with full CRUD functionality, image uploads, markdown editing, and project metadata management. This includes backend API endpoints with auth protection, a client-side form interface with file uploads, and integration with Supabase Storage for image assets.

## Functional Requirements

### Backend Admin API

1. **Admin Project CRUD Endpoints**
   - GET /api/v1/admin/projects - List all projects (any status) with pagination, filtering, and search
   - GET /api/v1/admin/projects/:id - Retrieve a single project by ID for editing
   - POST /api/v1/admin/projects - Create new project with full metadata
   - PUT /api/v1/admin/projects/:id - Update project fields (partial update supported)
   - DELETE /api/v1/admin/projects/:id - Hard delete project

2. **Project Model Functions**
   - findProjectById(id) - Query project by UUID for admin editing
   - createProject(input) - Insert new project with validation
   - updateProject(id, input) - Update existing project (merge fields)
   - deleteProject(id) - Remove project from database
   - listAdminProjects(filters, pagination) - List all projects regardless of status for admin view

3. **File Upload Endpoint**
   - POST /api/v1/upload - Accept multipart form data with single file field, validate by magic bytes (not MIME type), return public URL
   - Validates image type via binary signature detection (PNG, JPG, WebP, GIF only; skip AVIF for MVP)
   - Returns Supabase storage public URL after successful upload
   - Handles upload errors (invalid type, size exceeded, storage failure)

4. **Authentication & Authorization**
   - All admin endpoints require requireAuth middleware (session cookie validation)
   - All upload endpoints require authentication
   - Errors return 401 Unauthorized if session invalid/missing
   - Future: support role-based access control (roadmap, not in MVP)

### Frontend Admin Pages & Components

5. **Admin Authentication**
   - LoginPage functional - users log in with username/password and receive session cookie
   - Session cookie automatically sent in all requests via credentials: "include"
   - On 401 response: redirect to login page

6. **Admin Dashboard**
   - DashboardPage displays projects table with:
     - Columns: Title, Slug, Category, Status, Last Updated, Actions
     - Inline actions: Edit (button), Delete (with ConfirmDialog)
     - Create Project button (top right, links to new editor form)
     - Filters: Status dropdown (all statuses visible), Category dropdown
     - Search field (queries title, summary, tech stack)
     - Pagination controls
   - Projects cached with key: ['admin', 'projects', filters, page]
   - 5-minute stale time before auto-refresh

7. **Project Editor Page**
   - Form for creating (POST) and editing (PUT) projects with fields:
     - Text input: Title (min 3, max 120 chars)
     - Slug (auto-generated from title on create, manual edit allowed, validated unique)
     - Select: Category (fullstack, ai_ml, frontend, backend, experiment)
     - Select: Status (draft, published, archived; defaults to draft on create)
     - Textarea: Summary (min 10, max 280 chars)
     - Markdown Editor: Content (min 1 char, required)
     - Image Upload: Thumbnail (optional, single image with preview, drag-drop)
     - Gallery Upload: Images (optional, max 12 images, reorderable, deletable)
     - Tag Input: Tech Stack (optional, max 20 tags, each 1-30 chars)
     - URL inputs: Repo, Demo, Notebook (optional, validated URLs)
     - Checkbox: Is Featured (optional, default false)
   - Slug auto-generation: Title → lowercase, trim → replace spaces/special chars with hyphens → validate regex
   - Slug uniqueness: checked via GET /api/v1/admin/check-slug?slug=X endpoint with debounce, prevents 409 errors
   - Form validation before submit using React Hook Form + Zod
   - Loading states during submission with Spinner component
   - Success/error toast notifications with LazyToaster
   - Race condition handling: on 409 (slug conflict), show toast "Slug already in use" and allow retry

8. **Form UI Components**
   - Input.tsx - Text field with label, error display, optional placeholder
   - Label.tsx - Accessible label component for form fields
   - Textarea.tsx - Multi-line textarea with rows control
   - Select.tsx - Dropdown select with label and error display
   - Checkbox.tsx - Checkbox input with label
   - FieldError.tsx - Displays validation error messages in red
   - ConfirmDialog.tsx - Modal dialog for delete confirmation with Cancel/Delete buttons

9. **Specialized Form Fields**
   - MarkdownEditorField.tsx - Wraps @uiw/react-md-editor with dark theme, form integration
   - ImageUploadField.tsx - Single image upload with preview, drag-drop support, validate magic bytes, max 5 MB
   - GalleryUploadField.tsx - Multiple image upload (max 12), preview grid, drag to reorder, delete individual images, max 5 MB each
   - TagInput.tsx - Tech stack input as comma-separated chips or paste-to-split, max 20, validate each

10. **Services & Utilities**
    - admin-projects.service.ts - API calls for admin project CRUD with admin-only cache keys:
      - getAdminProjects(filters, page, limit) - GET /api/v1/admin/projects
      - getAdminProject(id) - GET /api/v1/admin/projects/:id
      - createProject(data) - POST /api/v1/admin/projects
      - updateProject(id, data) - PUT /api/v1/admin/projects/:id
      - deleteProject(id) - DELETE /api/v1/admin/projects/:id
    - upload.service.ts - API calls for file uploads:
      - uploadImage(file) - POST /api/v1/upload as multipart FormData, return URL string
    - admin-slug.service.ts - Slug availability check:
      - checkSlugAvailability(slug) - GET /api/v1/admin/check-slug?slug=X, returns {available: boolean}
    - slugify.ts - Utility to convert title to URL-friendly slug (lowercase, trim, replace spaces/special chars with hyphens)
    - useAdminProjects hook - React Query hook for admin projects list with filters/pagination
    - useAdminProject hook - React Query hook to fetch single project by ID
    - useCreateProject hook - useMutation to POST new project, invalidates ['admin', 'projects']
    - useUpdateProject hook - useMutation to PUT project, invalidates ['admin', 'projects'] only for status changes to published
    - useDeleteProject hook - useMutation to DELETE project with confirmation, invalidates ['admin', 'projects']
    - useUploadImage hook - useMutation to upload image file, returns URL
    - useCheckSlug hook - useQuery to check slug availability with 300ms debounce, disabled if slug unchanged from original

## Non-Functional Requirements

1. **Security**
   - File uploads validate magic bytes (binary signatures) to prevent malicious file uploads
   - All admin endpoints protected with requireAuth middleware
   - CORS headers configured for admin routes
   - Session tokens validated on every admin request
   - Multipart upload respects max file size (5 MB per file, 60 MB total per request)

2. **Performance**
   - Admin projects list cached with 5-minute stale time (React Query)
   - Slug availability check debounced 300ms to avoid excessive API calls
   - Gallery images lazy-loaded in preview grid
   - Pagination default 10 items per page, max 50

3. **Error Handling**
   - All network errors caught and shown to user via toast notifications
   - Validation errors displayed inline on form fields
   - Slug conflicts (409) handled with user-friendly message and retry option
   - Image upload errors (invalid type, too large, storage failure) shown with specific reason

4. **Accessibility**
   - All form inputs have associated labels
   - Error messages linked to fields via aria-describedby
   - Confirm dialog keyboard accessible (Enter to confirm, Esc to cancel)
   - Images have alt text where applicable

## Acceptance Criteria

1. **Backend Setup**
   - [ ] Supabase client initialized with error handling in server/src/config/supabase.ts
   - [ ] Magic byte detection utility created in server/src/utils/image-detection.ts with PNG, JPG, WebP, GIF support
   - [ ] @hono/node-multipart dependency installed and configured

2. **Admin Model Functions**
   - [ ] findProjectById returns full project or undefined, no status filtering
   - [ ] listAdminProjects returns paginated results with all statuses visible, filterable by status/category/search
   - [ ] createProject inserts with auto-generated ID/timestamps, throws ConflictError on slug duplicate
   - [ ] updateProject merges fields, throws NotFoundError if missing, ConflictError on slug duplicate
   - [ ] deleteProject removes row, throws NotFoundError if missing

3. **Admin Controller Endpoints**
   - [ ] GET /admin/projects returns paginated project list with pagination metadata
   - [ ] GET /admin/projects/:id returns full project object with content field
   - [ ] POST /admin/projects creates project and returns 201 with new object
   - [ ] PUT /admin/projects/:id updates project and returns 200 with updated object
   - [ ] DELETE /admin/projects/:id removes project and returns 200
   - [ ] All endpoints require authentication and return 401 if missing

4. **Upload Endpoint**
   - [ ] POST /upload accepts multipart form data with "file" field
   - [ ] Detects image type via magic bytes (PNG, JPG, WebP, GIF)
   - [ ] Rejects unrecognized types with 400 BadRequest
   - [ ] Rejects files > 5 MB with 413 PayloadTooLarge
   - [ ] Uploads to Supabase Storage bucket and returns public URL
   - [ ] Returns 401 if not authenticated

5. **Slug Availability Endpoint**
   - [ ] GET /admin/check-slug?slug=X returns {available: true} or {available: false}
   - [ ] Checks uniqueness against projects table
   - [ ] Returns 400 if slug parameter missing or invalid
   - [ ] Returns 401 if not authenticated

6. **Frontend Form Components**
   - [ ] Input, Label, Textarea, Select, Checkbox, FieldError, ConfirmDialog implemented and styled
   - [ ] MarkdownEditorField shows editor with dark theme, preview toggle, form integration
   - [ ] ImageUploadField uploads single image with preview, drag-drop, validates magic bytes client-side
   - [ ] GalleryUploadField uploads max 12 images with reordering and delete buttons
   - [ ] TagInput parses comma-separated text or individual chip entry
   - [ ] All components match existing design system (colors, spacing, fonts)

7. **Admin Pages**
   - [ ] LoginPage fully functional with username/password form, success redirects to /admin
   - [ ] DashboardPage displays projects table with edit/delete actions, search, filter, pagination
   - [ ] ProjectEditorPage form submits and redirects to dashboard on success
   - [ ] ProjectEditorPage handles loading, validation errors, network errors with appropriate UI feedback

8. **Services & Hooks**
   - [ ] admin-projects.service.ts exports functions for getAdminProjects, getAdminProject, createProject, updateProject, deleteProject
   - [ ] upload.service.ts exports uploadImage(file) that sends FormData and returns URL
   - [ ] admin-slug.service.ts exports checkSlugAvailability(slug) that returns availability boolean
   - [ ] slugify.ts converts title to valid slug format
   - [ ] useAdminProjects returns query with data, isLoading, error
   - [ ] useCreateProject returns mutation with mutate, isPending
   - [ ] useUploadImage returns mutation with mutate, isPending
   - [ ] useCheckSlug returns query with debounce and disable conditions

9. **Cache Strategy**
   - [ ] Admin project list uses cache key ['admin', 'projects', filters, page]
   - [ ] Public project list uses cache key ['projects', filters, page] (no collision)
   - [ ] 5-minute stale time for all queries
   - [ ] Create/update project invalidates admin cache
   - [ ] Status change to published invalidates both admin and public caches
   - [ ] Gallery uploads don't trigger cache invalidation

10. **End-to-End Flow**
    - [ ] Admin logs in → redirected to dashboard
    - [ ] Admin clicks "Create Project" → navigates to editor with empty form
    - [ ] Admin fills form → slug auto-generates from title, validates on blur
    - [ ] Admin uploads thumbnail and gallery images → previews show
    - [ ] Admin submits form → creates project, redirects to dashboard
    - [ ] Admin edits project → form populates with existing data, slug availability checked
    - [ ] Admin deletes project → shows confirmation, removes from table and cache

## Out of Scope

- Image optimization, resizing, or format conversion (MVP uses original uploads)
- Role-based access control (RBAC) beyond authentication
- Image deletion from Supabase Storage when project deleted (cleanup task separate)
- Bulk project operations (multi-select delete, status change)
- Project versioning or edit history
- Scheduled publishing or draft-to-publish workflows
- SEO metadata auto-generation or optimization
- Image CDN optimization or watermarking

## Assumptions

1. @supabase/supabase-js already in server dependencies (verified in package.json)
2. @uiw/react-md-editor available for markdown editing
3. React Hook Form patterns already established (verified in existing pages)
4. Drag-drop library decision deferred (using HTML5 native API for MVP)
5. Image uploads always public (no private bucket needed)
6. Slug auto-generation only on create form load; manual edits not overridden
7. Gallery reorder uses native HTML5 drag-drop API, not external library
8. All file uploads to same Supabase bucket (portfolio-assets)
9. No user account creation endpoint (admin account pre-populated in DB)
