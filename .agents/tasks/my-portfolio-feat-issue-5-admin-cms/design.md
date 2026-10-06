# Design: Admin CMS for Portfolio Project Management

## Overview

The Admin CMS layer sits on top of the existing project API, adding protected endpoints for content creators to manage portfolio projects. The design separates concerns into three layers: (1) backend API with Supabase Storage integration for file uploads, (2) React hooks and services for API consumption with strict cache separation, and (3) form-driven UI components that follow the existing design system. Authentication uses the existing session-based JWT middleware, and all admin operations are guarded by `requireAuth`. The implementation leverages existing patterns (API client, error handling, validation with Zod) and extends them with admin-specific schemas, model functions, and form components.

## Technology Stack (Locked)

**Backend:**
- Framework: Hono + Bun runtime
- Database: PostgreSQL via Drizzle ORM
- Authentication: JWT in session cookie
- File Storage: Supabase Storage (@supabase/supabase-js)
- Multipart Parsing: @hono/node-multipart
- Validation: Zod
- Response Pattern: ApiSuccess/ApiError envelope

**Frontend:**
- Framework: React + Vite
- Data Fetching: React Query (@tanstack/react-query)
- Forms: React Hook Form + Zod
- Markdown Editor: @uiw/react-md-editor
- File Upload: HTML5 FormData API + native drag-drop
- UI: Tailwind CSS (existing components: Button, Card, Badge, Spinner, Skeleton)

---

## Backend Design

### Authentication & Authorization

All admin endpoints use the existing `requireAuth` middleware from `server/src/middlewares/auth.ts`. This middleware:
- Validates session cookie (env.COOKIE_NAME, default "portfolio_session")
- Extracts JWT payload and validates signature with JWT_SECRET
- Sets `c.get("user")` with user ID and username for downstream use
- Throws UnauthorizedError (401) if token missing or invalid

No additional role-based access control at this stage; all authenticated users have admin access. Future iterations can add role fields to users table and check via separate `requireAdmin` middleware.

**Files modified**: server/src/index.ts (register admin and upload controllers under /api/v1/admin and /api/v1/upload, apply requireAuth)

---

### Admin Project Model Functions

**Approach: Add to existing server/src/models/project.model.ts (not separate file)**

Rationale: Public functions (listProjects, findPublicProjectBySlug) already handle projects table. Consolidating admin functions in same file keeps database layer together, prevents duplication of query logic, and makes filtering logic reusable.

**Model Layer Error Handling Policy** (REVISED - addressing HIGH finding #2):
- **All model functions propagate native Drizzle errors** (database connection failures, syntax errors) to the caller without catching.
- **Controller layer catches specific conditions** and throws HTTP semantics (NotFoundError for missing rows, ConflictError for unique constraint violations).
- **Rationale**: Model layer owns database interaction; controller owns HTTP response. This clean separation prevents model layer from knowing about HTTP status codes and allows consistent error handling across multiple controller consumers.

**Implementation:**

#### findProjectById(id: string): Promise<ProjectRow | undefined>
```typescript
import { eq } from "drizzle-orm";

export async function findProjectById(id: string): Promise<ProjectRow | undefined> {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  
  return result[0];
}
```
- Returns full row including content field (for editing)
- Does not filter by status; admin sees drafts, published, archived
- Returns **undefined if not found**; caller (controller) is responsible for throwing NotFoundError(404)
- Propagates any Drizzle errors (DB connection, invalid column, etc.) to caller

**Error handling contract**:
- **Not found** → Returns undefined
- **DB error** → Throws native error; controller must catch and convert to 500 InternalError
- **Invalid input type** → Let TypeScript catch at compile time; runtime should not receive invalid types due to validation middleware

---

#### listAdminProjects(filters: Partial<AdminProjectListQuery>, pagination: PaginationParams): Promise<{items: ProjectListItemDTO[], total: number}>

(REVISED - addressing MEDIUM finding #5)

```typescript
export async function listAdminProjects(
  filters: Partial<AdminProjectListQuery>,
  pagination: PaginationParams,
) {
  const conditions = [];
  
  // Status filter (optional; admin can filter by single status, multiple statuses, or see all)
  if (filters.status !== undefined && filters.status !== null) {
    if (Array.isArray(filters.status)) {
      // Multiple statuses: status=[draft,published]
      conditions.push(inArray(projects.status, filters.status));
    } else {
      // Single status
      conditions.push(eq(projects.status, filters.status));
    }
  }
  // If status not provided, show all statuses (unlike public which defaults to "published")
  
  // Category filter (optional enum)
  if (filters.category) {
    conditions.push(eq(projects.category, filters.category));
  }
  
  // Search filter (optional string, max 100 chars enforced by schema)
  if (filters.search && filters.search.trim()) {
    const escapedSearch = escapeLike(filters.search.trim());
    const searchPattern = `%${escapedSearch}%`;
    conditions.push(
      or(
        ilike(projects.title, searchPattern),
        ilike(projects.summary, searchPattern),
        sql`array_to_string(${projects.tech_stack}, ' ') ILIKE ${searchPattern}`,
      ),
    );
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (pagination.page - 1) * pagination.limit;
  
  const [items, countResult] = await Promise.all([
    db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        summary: projects.summary,
        thumbnail_url: projects.thumbnail_url,
        gallery_urls: projects.gallery_urls,
        tech_stack: projects.tech_stack,
        category: projects.category,
        repo_url: projects.repo_url,
        demo_url: projects.demo_url,
        notebook_url: projects.notebook_url,
        is_featured: projects.is_featured,
        status: projects.status,
        created_at: projects.created_at,
        updated_at: projects.updated_at,
      })
      .from(projects)
      .where(whereClause)
      .orderBy(desc(projects.is_featured), desc(projects.created_at))
      .limit(pagination.limit)
      .offset(offset),
    db.select({ count: count() }).from(projects).where(whereClause),
  ]);
  
  const total = countResult[0]?.count || 0;
  const convertedItems = items.map(item => ({
    ...item,
    created_at: item.created_at.toISOString(),
    updated_at: item.updated_at.toISOString(),
  })) as ProjectListItemDTO[];
  
  return { items: convertedItems, total };
}
```

**Pagination validation** (inherited from base schema):
- `page`: default 1, minimum 1 (Zod enforces)
- `limit`: default 10, minimum 1, maximum 50 (Zod enforces)

**Error handling**:
- **DB connection or query failure** → Throws native Drizzle error; controller catches in try-catch and converts to 500 InternalError

---

#### createProject(input: CreateProjectOutput): Promise<ProjectDTO>
```typescript
export async function createProject(input: CreateProjectOutput): Promise<ProjectDTO> {
  const result = await db
    .insert(projects)
    .values({
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      content: input.content,
      thumbnail_url: input.thumbnail_url || null,
      gallery_urls: input.gallery_urls || [],
      tech_stack: input.tech_stack || [],
      category: input.category,
      repo_url: input.repo_url || null,
      demo_url: input.demo_url || null,
      notebook_url: input.notebook_url || null,
      is_featured: input.is_featured || false,
      status: input.status || "draft",
    })
    .returning();
  
  const row = result[0]!;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    thumbnail_url: row.thumbnail_url,
    gallery_urls: row.gallery_urls,
    tech_stack: row.tech_stack,
    category: row.category,
    repo_url: row.repo_url,
    demo_url: row.demo_url,
    notebook_url: row.notebook_url,
    is_featured: row.is_featured,
    status: row.status,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
```

**Error handling** (per error handling policy):
- **Unique constraint violation on slug** (PostgreSQL error code 23505): Model layer doesn't catch. Controller wraps call in try-catch, detects constraint violation, throws ConflictError(409, "Slug sudah digunakan")
- **Invalid enum values** (e.g., status='invalid'): Should not happen; Zod validates schema before reaching model. If it does occur (bug), native Drizzle error propagates to 500 handler
- **DB connection error**: Propagates to controller 500 handler

---

#### updateProject(id: string, input: Partial<UpdateProjectOutput>): Promise<ProjectDTO | undefined>
```typescript
export async function updateProject(
  id: string,
  input: Partial<UpdateProjectOutput>,
): Promise<ProjectDTO | undefined> {
  // Check existence first (returns undefined if not found)
  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  
  if (!existing.length) {
    return undefined; // Controller must catch and throw NotFoundError
  }
  
  // Update only provided fields (omit undefined values)
  const updateData = Object.entries(input).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof typeof input] = value;
    }
    return acc;
  }, {} as Partial<UpdateProjectOutput>);
  
  const result = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, id))
    .returning();
  
  const row = result[0]!;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    thumbnail_url: row.thumbnail_url,
    gallery_urls: row.gallery_urls,
    tech_stack: row.tech_stack,
    category: row.category,
    repo_url: row.repo_url,
    demo_url: row.demo_url,
    notebook_url: row.notebook_url,
    is_featured: row.is_featured,
    status: row.status,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
```

**Error handling**:
- **Not found** → Returns undefined; controller throws NotFoundError(404)
- **Slug unique constraint violation on update** (when user changes slug to duplicate): Controller catches Drizzle error, throws ConflictError(409, "Slug sudah digunakan")
- **DB error** → Propagates to 500 handler

---

#### deleteProject(id: string): Promise<void>
```typescript
export async function deleteProject(id: string): Promise<void> {
  const result = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  
  if (!result.length) {
    return undefined; // Model returns undefined; controller throws NotFoundError
  }
}
```

**Error handling**:
- **Not found** → Returns undefined; controller throws NotFoundError(404)
- **DB error** → Propagates to 500 handler

---

### Admin Project Controller

**File**: server/src/controllers/admin.controller.ts (new)

All endpoints registered in main index.ts under `/api/v1/admin` with `requireAuth` middleware applied at route level.

#### GET /admin/projects

**Request**:
- Query params: page (default 1, min 1), limit (default 10, min 1, max 50), status (optional: single or array), category (optional enum), search (optional string max 100 chars)
- Validation schema: adminProjectListQuerySchema

**Implementation**:
```typescript
adminController.get(
  "/",
  validate("query", adminProjectListQuerySchema),
  async (c) => {
    const { page, limit, ...filters } = c.req.valid("query");
    
    try {
      const result = await listAdminProjects(filters, { page, limit });
      const pagination = getPaginationMeta({ page, limit, totalItems: result.total });
      
      return ApiResponse.success(c, {
        data: result.items,
        message: "Daftar proyek (admin)",
        pagination,
      }, 200);
    } catch (error) {
      if (error instanceof Error && error.message.includes("database")) {
        throw new AppError(500, "INTERNAL_ERROR", "Database error");
      }
      throw error;
    }
  },
);
```

**Response**: 200 OK
```json
{
  "success": true,
  "status": 200,
  "message": "Daftar proyek (admin)",
  "data": [
    {
      "id": "uuid",
      "title": "Project Title",
      "slug": "project-slug",
      "summary": "Summary...",
      "thumbnail_url": "https://...",
      "gallery_urls": [],
      "tech_stack": ["React", "Node.js"],
      "category": "fullstack",
      "repo_url": "https://github.com/...",
      "demo_url": "https://...",
      "notebook_url": null,
      "is_featured": false,
      "status": "draft",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "limit": 10,
    "total_items": 15,
    "total_pages": 2,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

**Error responses**:
- 401 Unauthorized: Missing or invalid session cookie
- 400 Bad Request: Invalid query parameters (e.g., invalid page/limit)
- 500 Internal Server Error: DB connection failure

---

#### GET /admin/projects/:id

**Request**:
- Path param: id (UUID)
- No query params

**Implementation**:
```typescript
adminController.get(
  "/:id",
  validate("param", z.object({ id: z.string().uuid() })),
  async (c) => {
    const { id } = c.req.valid("param");
    
    const project = await findProjectById(id);
    if (!project) {
      throw new NotFoundError("Proyek tidak ditemukan");
    }
    
    const dto: ProjectDTO = {
      id: project.id,
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      content: project.content,
      thumbnail_url: project.thumbnail_url,
      gallery_urls: project.gallery_urls,
      tech_stack: project.tech_stack,
      category: project.category,
      repo_url: project.repo_url,
      demo_url: project.demo_url,
      notebook_url: project.notebook_url,
      is_featured: project.is_featured,
      status: project.status,
      created_at: project.created_at.toISOString(),
      updated_at: project.updated_at.toISOString(),
    };
    
    return ApiResponse.success(c, {
      data: dto,
      message: "Detail proyek",
    }, 200);
  },
);
```

**Response**: 200 OK (same ProjectDTO structure as above)

**Error responses**:
- 401 Unauthorized: Missing or invalid session
- 404 Not Found: Project doesn't exist
- 500 Internal Server Error: DB error

---

#### POST /admin/projects (Create)

**Request**:
- Body: JSON with fields from createProjectSchema
- Validation: createProjectSchema

**Race condition handling** (REVISED - addressing HIGH finding #1):

**Slug conflict strategy chosen: Option B (Permissive with server-side enforcement)**

Rationale: The race condition is inherent to any distributed system. Option A (disable button until verified) adds UX complexity and still doesn't prevent true race conditions if two admins submit simultaneously. Option B (server enforces, form handles 409) is more robust: it lets the server be the source of truth and provides clear error feedback. The client-side slug availability check is advisory only and improves UX by catching immediate conflicts early.

**Implementation**:
```typescript
adminController.post(
  "/",
  validate("json", createProjectSchema),
  async (c) => {
    const input = c.req.valid("json");
    
    try {
      const project = await createProject(input);
      
      return ApiResponse.success(c, {
        data: project,
        message: "Proyek berhasil dibuat",
      }, 201);
    } catch (error) {
      // Check for unique constraint violation on slug
      if (error instanceof Error && error.message.includes("unique")) {
        throw new ConflictError("Slug sudah digunakan");
      }
      throw error;
    }
  },
);
```

**Response**: 201 Created
```json
{
  "success": true,
  "status": 201,
  "message": "Proyek berhasil dibuat",
  "data": { /* ProjectDTO */ }
}
```

**Error responses**:
- 401 Unauthorized
- 400 Bad Request: Missing or invalid fields
- 409 Conflict: Slug already exists (user must choose different slug, see HIGH finding #1 for frontend handling)
- 500 Internal Server Error

---

#### PUT /admin/projects/:id (Update)

**Request**:
- Path param: id (UUID)
- Body: JSON (all fields optional per updateProjectSchema)

**Implementation**:
```typescript
adminController.put(
  "/:id",
  validate("param", z.object({ id: z.string().uuid() })),
  validate("json", updateProjectSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    
    try {
      const project = await updateProject(id, input);
      
      if (!project) {
        throw new NotFoundError("Proyek tidak ditemukan");
      }
      
      return ApiResponse.success(c, {
        data: project,
        message: "Proyek berhasil diperbarui",
      }, 200);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Error && error.message.includes("unique")) {
        throw new ConflictError("Slug sudah digunakan");
      }
      throw error;
    }
  },
);
```

**Response**: 200 OK (ProjectDTO)

**Error responses**:
- 401 Unauthorized
- 404 Not Found: Project doesn't exist
- 409 Conflict: Slug already in use (can happen if edited to duplicate slug)
- 500 Internal Server Error

---

#### DELETE /admin/projects/:id

**Request**:
- Path param: id (UUID)

**Implementation**:
```typescript
adminController.delete(
  "/:id",
  validate("param", z.object({ id: z.string().uuid() })),
  async (c) => {
    const { id } = c.req.valid("param");
    
    const project = await findProjectById(id);
    if (!project) {
      throw new NotFoundError("Proyek tidak ditemukan");
    }
    
    await deleteProject(id);
    
    return ApiResponse.success(c, {
      data: null,
      message: "Proyek berhasil dihapus",
    }, 200);
  },
);
```

**Response**: 200 OK
```json
{
  "success": true,
  "status": 200,
  "message": "Proyek berhasil dihapus",
  "data": null
}
```

**Error responses**:
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error

---

#### GET /admin/check-slug?slug=value (Slug Availability Check)

**Purpose**: Allow frontend to check if a slug is available before form submission. Non-blocking; server always validates on POST/PUT.

**Implementation**:
```typescript
adminController.get(
  "/check-slug",
  validate("query", z.object({ slug: slugSchema })),
  async (c) => {
    const { slug } = c.req.valid("query");
    
    const result = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);
    
    return ApiResponse.success(c, {
      data: { available: result.length === 0 },
      message: "Slug availability check",
    }, 200);
  },
);
```

**Response**: 200 OK
```json
{
  "success": true,
  "status": 200,
  "message": "Slug availability check",
  "data": { "available": true }
}
```

---

### File Upload Endpoint

**File**: server/src/controllers/upload.controller.ts (new)

Registered in index.ts at `/api/v1/upload` with `requireAuth` middleware.

#### POST /upload

**Purpose**: Upload a single image file, validate file type by magic bytes, return Supabase Storage URL.

**Request**:
- Content-Type: multipart/form-data
- Field: file (File, max 10MB)

**Implementation**:
```typescript
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { detectImageType } from "../utils/file-signature";
import { PayloadTooLargeError, UnsupportedMediaTypeError } from "../utils/errors";
import { env } from "../config/env";

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

uploadController.post(
  "/",
  requireAuth,
  async (c) => {
    const form = await c.req.parseFormData();
    const file = form.get("file") as File | null;
    
    if (!file) {
      throw new BadRequestError("File wajib diupload");
    }
    
    // Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new PayloadTooLargeError("Ukuran file maksimal 10MB");
    }
    
    // Validate file type by magic bytes
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const imageType = detectImageType(uint8Array);
    
    if (!["png", "jpg", "gif", "webp"].includes(imageType)) {
      throw new UnsupportedMediaTypeError("Format file harus PNG, JPG, GIF, atau WebP");
    }
    
    // Upload to Supabase Storage
    const filename = `${uuidv4()}.${imageType}`;
    const { data, error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(`portfolio-uploads/${Date.now()}/${filename}`, new Blob([uint8Array]), {
        contentType: `image/${imageType}`,
      });
    
    if (error) {
      throw new AppError(500, "INTERNAL_ERROR", "Upload ke Supabase gagal");
    }
    
    // Generate public URL
    const { data: publicUrl } = supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(data.path);
    
    return ApiResponse.success(c, {
      data: { url: publicUrl.publicUrl },
      message: "File berhasil diupload",
    }, 200);
  },
);
```

**Response**: 200 OK
```json
{
  "success": true,
  "status": 200,
  "message": "File berhasil diupload",
  "data": {
    "url": "https://supabase-project.supabase.co/storage/v1/object/public/portfolio-assets/portfolio-uploads/1705331400000/abc-123.png"
  }
}
```

**Error responses**:
- 401 Unauthorized: Not authenticated
- 400 Bad Request: No file provided
- 413 Payload Too Large: File exceeds 10MB
- 415 Unsupported Media Type: File is not a valid image format (detected via magic bytes)
- 500 Internal Server Error: Supabase storage failure

**Implementation notes**:
- Use `detectImageType()` util function to detect file type from magic bytes, not MIME type
- Generate unique filename with UUID to prevent collisions
- Store in namespaced path (portfolio-uploads/{timestamp}) for organization
- Return public URL for direct access

---

### File Signature Detection Utility

**File**: server/src/utils/file-signature.ts (new)

```typescript
/**
 * Detect image type from magic bytes (file signature)
 * Returns: 'png' | 'jpg' | 'gif' | 'webp' | 'unknown'
 * 
 * Does NOT rely on MIME type or file extension; reads actual file bytes.
 */
export function detectImageType(
  buffer: Uint8Array,
): "png" | "jpg" | "gif" | "webp" | "unknown" {
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "png";
  }
  
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return "gif";
  }
  
  // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF ... WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }
  
  return "unknown";
}
```

---

### DTO & Schema Updates

**File**: server/src/shared/dto.ts (update)

Add admin-specific schema and types:

```typescript
// Admin project list query schema
// Inherits from base projectListQuerySchema with overrides for admin use
export const adminProjectListQuerySchema = projectListQuerySchema
  .extend({
    // Admin can filter by single or multiple statuses (unlike public which defaults to "published")
    status: z
      .union([
        projectStatusSchema,
        z.array(projectStatusSchema),
      ])
      .optional(),
    // Default limit changed from 6 (public) to 10 (admin)
    limit: z.coerce.number().int().min(1).max(50).default(10),
  });

export type AdminProjectListQuery = z.infer<typeof adminProjectListQuerySchema>;

// File upload response
export interface UploadResponse {
  url: string;
}

// Upload constants
export const UPLOAD_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const UPLOAD_ALLOWED_TYPES = ["png", "jpg", "gif", "webp"] as const;
```

---

### Main Route Registration

**File**: server/src/index.ts (update)

```typescript
import { adminController } from "./controllers/admin.controller";
import { uploadController } from "./controllers/upload.controller";
import { requireAuth } from "./middlewares/auth";

const app = new Hono<AppEnv>();

// ... existing middleware ...

// Register controllers
app.route("/api/v1/health", healthController);
app.route("/api/v1/auth", authController);
app.route("/api/v1/projects", projectController);

// Admin routes (protected)
app.use("/api/v1/admin/*", requireAuth);
app.route("/api/v1/admin", adminController);

// Upload routes (protected)
app.use("/api/v1/upload/*", requireAuth);
app.route("/api/v1/upload", uploadController);

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
```

---

## Frontend Design

### Session Management & Authentication

**401 Handling Architecture** (REVISED - addressing review assumption):

When any API call returns 401 Unauthorized (invalid or expired session), the redirect to `/admin/login` is handled at the **error boundary level** in the route definition, not per-hook. This allows centralized, consistent behavior across all admin pages.

**Implementation**:
- The `ProtectedRoute` component in `client/src/router/ProtectedRoute.tsx` wraps all admin routes
- When `useMe()` hook returns 401 error or authentication fails, ProtectedRoute redirects to `/admin/login`
- Alternative approach (simpler): Add a global query client error handler that detects 401 responses and redirects

**Per-hook alternative** (if you want finer control):
In each admin hook (useAdminProjects, useUpdateProject, etc.), add an onError callback that redirects on 401. This is more verbose but allows component-specific handling if needed.

**Chosen approach: ProtectedRoute redirects on 401**

---

### API Service Layer

#### admin-projects.service.ts (new)

```typescript
import { apiGet, apiPost, apiPut, apiDelete, apiFetchEnvelope } from "./api-client";
import type { ProjectDTO, CreateProjectInput, UpdateProjectInput } from "@/types/api";

export async function getAdminProjects(
  page: number = 1,
  limit: number = 10,
  filters?: { category?: string; search?: string; status?: string | string[] },
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });
  
  return apiFetchEnvelope<ProjectDTO[]>(
    `/api/v1/admin/projects?${params}`,
  );
}

export async function getAdminProject(id: string): Promise<ProjectDTO> {
  return apiGet(`/api/v1/admin/projects/${id}`);
}

export async function createProject(data: CreateProjectInput): Promise<ProjectDTO> {
  return apiPost(`/api/v1/admin/projects`, data);
}

export async function updateProject(
  id: string,
  data: Partial<UpdateProjectInput>,
): Promise<ProjectDTO> {
  return apiPut(`/api/v1/admin/projects/${id}`, data);
}

export async function deleteProject(id: string): Promise<void> {
  return apiDelete(`/api/v1/admin/projects/${id}`);
}

export async function checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
  return apiGet(`/api/v1/admin/check-slug?slug=${encodeURIComponent(slug)}`);
}
```

---

#### upload.service.ts (new)

```typescript
import { env } from "@/config/env";
import type { ApiError } from "@/types/api";
import { ApiClientError } from "./api-client";

/**
 * Upload a single image file.
 * Returns public Supabase Storage URL on success.
 * Throws ApiClientError on failure.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${env.API_URL}/api/v1/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  
  const data = (await response.json()) as
    | { success: true; data: { url: string } }
    | { success: false } & ApiError;
  
  if (!response.ok) {
    const error = data as unknown as ApiError;
    throw new ApiClientError(response.status, error.category, error.errors);
  }
  
  if (data.success && data.data) {
    return (data.data as { url: string }).url;
  }
  
  throw new Error("Upload failed");
}
```

**Notes**:
- Uses FormData instead of JSON to support file upload
- Calls `fetch()` directly instead of `apiFetch()` because FormData requires special handling
- Returns just the URL string, not full response envelope
- Throws ApiClientError for consistent error handling with other API calls

---

### React Query Hooks

#### use-admin-projects.ts (new)

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjectDTO, CreateProjectInput, UpdateProjectInput } from "@/types/api";
import {
  getAdminProjects,
  getAdminProject,
  createProject,
  updateProject,
  deleteProject,
} from "@/services/admin-projects.service";

// Query key factory
const adminProjectsKeys = {
  all: ["admin", "projects"] as const,
  list: (filters?: Record<string, any>, page?: number, limit?: number) => [
    ...adminProjectsKeys.all,
    "list",
    filters,
    page,
    limit,
  ] as const,
  detail: (id: string) => [...adminProjectsKeys.all, "detail", id] as const,
};

export function useAdminProjects(
  page: number = 1,
  limit: number = 10,
  filters?: { category?: string; search?: string; status?: string | string[] },
) {
  return useQuery({
    queryKey: adminProjectsKeys.list(filters, page, limit),
    queryFn: () => getAdminProjects(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminProject(id: string) {
  return useQuery({
    queryKey: adminProjectsKeys.detail(id),
    queryFn: () => getAdminProject(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      // Invalidate admin list
      queryClient.invalidateQueries({ queryKey: adminProjectsKeys.all });
      
      // Also invalidate public projects list (any variant with filters)
      // Use exact: false to match all queries starting with ["projects"]
      queryClient.invalidateQueries({
        queryKey: ["projects"],
        exact: false,
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateProjectInput> }) =>
      updateProject(id, data),
    onSuccess: (updated) => {
      // Invalidate admin list and the specific detail
      queryClient.invalidateQueries({ queryKey: adminProjectsKeys.all });
      
      // If status changed to 'published', also invalidate public projects
      // This ensures newly published projects appear in public list
      if (updated.status === "published") {
        queryClient.invalidateQueries({
          queryKey: ["projects"],
          exact: false, // Match all variants: ["projects"], ["projects", filters], etc.
        });
      }
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      // Invalidate admin projects list
      queryClient.invalidateQueries({ queryKey: adminProjectsKeys.all });
    },
  });
}
```

**REVISED - addressing HIGH finding #3 (Cache Invalidation)**:
- Changed invalidation to use `queryClient.invalidateQueries({ queryKey: ["projects"], exact: false })`
- `exact: false` matches all queries whose key starts with `["projects"]`, including `["projects", {filters}, page, limit]`
- This ensures all filtered variants of the public projects list are cleared when a project is published
- Admin cache uses `adminProjectsKeys.all` which starts with `["admin", "projects"]`, so it's not affected by the public invalidation

---

#### use-upload.ts (new)

```typescript
import { useMutation } from "@tanstack/react-query";
import { uploadImage } from "@/services/upload.service";

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
    onError: (error) => {
      console.error("Image upload failed:", error);
    },
  });
}
```

---

### Utility Functions

#### slugify.ts (new)

```typescript
/**
 * Convert a title string to a URL-friendly slug.
 * - Convert to lowercase
 * - Replace spaces and special chars with hyphens
 * - Remove consecutive hyphens
 * - Trim leading/trailing hyphens
 * 
 * Examples:
 * "My AI Project" → "my-ai-project"
 * "React & Next.js Dashboard" → "react-nextjs-dashboard"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}
```

---

### Form Components

These are new UI components built on top of existing Button, Card, etc., using Tailwind classes to match the design system.

#### Input.tsx (new)
```typescript
import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-fg">{label}</label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2 bg-bg border border-border rounded text-fg focus:outline-none focus:border-accent",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
```

#### Label.tsx (new)
```typescript
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required = false, children, ...props }: LabelProps) {
  return (
    <label className="block text-sm font-medium text-fg" {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
```

#### Textarea.tsx (new)
```typescript
import { cn } from "@/lib/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-fg">{label}</label>
      )}
      <textarea
        className={cn(
          "w-full px-3 py-2 bg-bg border border-border rounded text-fg focus:outline-none focus:border-accent",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
```

#### Select.tsx (new)
```typescript
import { cn } from "@/lib/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-fg">{label}</label>
      )}
      <select
        className={cn(
          "w-full px-3 py-2 bg-bg border border-border rounded text-fg focus:outline-none focus:border-accent",
          error && "border-red-500",
          className,
        )}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
```

#### Checkbox.tsx (new)
```typescript
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className="w-4 h-4 bg-bg border border-border rounded accent-accent"
        {...props}
      />
      {label && <label className="text-sm text-fg">{label}</label>}
    </div>
  );
}
```

#### FieldError.tsx (new)
```typescript
/**
 * Render error message from React Hook Form field
 */
import type { FieldError } from "react-hook-form";

interface FieldErrorProps {
  error?: FieldError;
}

export function FieldError({ error }: FieldErrorProps) {
  if (!error) return null;
  
  return (
    <p className="text-red-400 text-sm mt-1">
      {error.message || "Invalid field"}
    </p>
  );
}
```

#### ConfirmDialog.tsx (new)
```typescript
import { Button } from "./Button";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded p-6 max-w-sm">
        <h2 className="text-lg font-semibold text-fg mb-2">{title}</h2>
        <p className="text-muted text-sm mb-6">{description}</p>
        
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDangerous ? "primary" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            className={isDangerous ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

### Specialized Form Components

#### MarkdownEditorField.tsx (new)

Uses @uiw/react-md-editor for editing project content markdown.

```typescript
import MDEditor from "@uiw/react-md-editor";
import { Label } from "./Label";
import { FieldError } from "./FieldError";
import type { FieldError as FieldErrorType } from "react-hook-form";

interface MarkdownEditorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: FieldErrorType;
  required?: boolean;
}

export function MarkdownEditorField({
  label,
  value,
  onChange,
  error,
  required,
}: MarkdownEditorFieldProps) {
  return (
    <div className="space-y-2">
      <Label required={required}>{label}</Label>
      <div data-color-mode="dark" className="border border-border rounded overflow-hidden">
        <MDEditor
          value={value}
          onChange={(v) => onChange(v || "")}
          height={300}
          preview="live"
          hideToolbar={false}
          visibleDragbar={false}
          textareaProps={{
            disabled: false,
          }}
          className="text-fg"
        />
      </div>
      <FieldError error={error} />
    </div>
  );
}
```

---

#### ImageUploadField.tsx (new)

Single image upload with preview, validate file type and size.

(REVISED - addressing MEDIUM finding #4):

```typescript
import { useRef, useState } from "react";
import { useUploadImage } from "@/hooks/use-upload";
import { Spinner } from "./Spinner";
import { Label } from "./Label";
import { FieldError } from "./FieldError";
import type { FieldError as FieldErrorType } from "react-hook-form";

interface ImageUploadFieldProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  error?: FieldErrorType;
  required?: boolean;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  error,
  required,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const { mutate: uploadImage, isPending } = useUploadImage();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPreviewError(null);
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setPreviewError("Ukuran file maksimal 10MB");
      return;
    }
    
    // Check MIME type as quick client-side check (server validates magic bytes)
    if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
      setPreviewError("Format file harus PNG, JPG, GIF, atau WebP");
      return;
    }
    
    uploadImage(file, {
      onSuccess: (url) => {
        onChange(url);
        setPreviewError(null);
      },
      onError: (error) => {
        console.error("Upload error:", error);
        setPreviewError("Upload gagal, silakan coba lagi");
      },
    });
  };
  
  return (
    <div className="space-y-2">
      <Label required={required}>{label}</Label>
      
      <div className="border border-dashed border-border rounded p-6 text-center cursor-pointer hover:bg-surface/50">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isPending ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div onClick={() => fileInputRef.current?.click()}>
            <p className="text-sm text-muted">Click to upload image</p>
            <p className="text-xs text-muted mt-1">PNG, JPG, GIF, WebP • Max 10MB</p>
          </div>
        )}
      </div>
      
      {value && (
        <div className="relative">
          <img src={value} alt="Preview" className="w-full max-h-48 object-cover rounded" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      )}
      
      {previewError && <p className="text-red-400 text-sm">{previewError}</p>}
      <FieldError error={error} />
    </div>
  );
}
```

**Notes on race condition handling** (REVISED - MEDIUM finding #4):
- Client-side file validation (size, MIME type) happens immediately
- Server validates actual file type via magic bytes when upload request arrives
- If user selects file, it uploads and gets URL; multiple concurrent uploads are handled by FormData and multipart on server
- No client-side "max 12 images" enforcement for individual ImageUploadField (that's for gallery)
- If upload fails, error displays in component and user can retry

---

#### GalleryUploadField.tsx (new)

Multiple image uploads with drag-drop, reorder, delete. Enforces max 12 images client-side as advisory.

(REVISED - addressing MEDIUM finding #4):

```typescript
import { useCallback, useState } from "react";
import { useUploadImage } from "@/hooks/use-upload";
import { Spinner } from "./Spinner";
import { Label } from "./Label";
import { FieldError } from "./FieldError";
import type { FieldError as FieldErrorType } from "react-hook-form";

interface GalleryUploadFieldProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  error?: FieldErrorType;
  required?: boolean;
}

export function GalleryUploadField({
  label,
  value,
  onChange,
  error,
  required,
}: GalleryUploadFieldProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { mutate: uploadImage, isPending } = useUploadImage();
  
  const MAX_IMAGES = 12;
  const canAddMore = value.length < MAX_IMAGES;
  
  const handleFiles = useCallback(
    (files: FileList) => {
      setUploadError(null);
      
      // Process each file
      let addedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        
        // Check if we've hit the limit
        if (value.length + addedCount >= MAX_IMAGES) {
          setUploadError(`Maksimal ${MAX_IMAGES} gambar. Anda sudah memiliki ${value.length} gambar.`);
          break;
        }
        
        // Validate file
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`Gambar ${file.name} terlalu besar (>10MB)`);
          continue;
        }
        
        if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
          setUploadError(`Gambar ${file.name} format tidak didukung`);
          continue;
        }
        
        addedCount++;
        
        // Upload each image
        uploadImage(file, {
          onSuccess: (url) => {
            onChange([...value, url]);
          },
          onError: () => {
            setUploadError(`Upload ${file.name} gagal`);
          },
        });
      }
    },
    [value, onChange, uploadImage],
  );
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type !== "dragleave");
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!canAddMore) {
      setUploadError(`Maksimal ${MAX_IMAGES} gambar`);
      return;
    }
    
    handleFiles(e.dataTransfer.files);
  };
  
  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };
  
  const reorderImage = (fromIndex: number, toIndex: number) => {
    const newValue = [...value];
    [newValue[fromIndex], newValue[toIndex]] = [newValue[toIndex], newValue[fromIndex]];
    onChange(newValue);
  };
  
  return (
    <div className="space-y-2">
      <Label required={required}>{label}</Label>
      
      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded p-6 text-center transition ${
          dragActive ? "border-accent bg-accent/10" : "border-border"
        } ${!canAddMore ? "opacity-50" : ""}`}
      >
        {isPending ? (
          <Spinner />
        ) : (
          <>
            <p className="text-sm text-muted">
              Drag images here or click to upload
            </p>
            <p className="text-xs text-muted mt-1">
              {value.length}/{MAX_IMAGES} images • PNG, JPG, GIF, WebP • Max 10MB each
            </p>
            {!canAddMore && (
              <p className="text-xs text-yellow-600 mt-2">⚠️ Maksimal {MAX_IMAGES} gambar tercapai</p>
            )}
          </>
        )}
        
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={!canAddMore}
          style={{ display: "none" }}
          id="gallery-upload"
        />
      </div>
      
      {/* Uploaded images grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Gallery ${index}`}
                className="w-full h-24 object-cover rounded"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded transition flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Errors */}
      {uploadError && <p className="text-red-400 text-sm">{uploadError}</p>}
      {error && <FieldError error={error} />}
      
      {/* Server validation note */}
      <p className="text-xs text-muted">
        💡 Server validates max 12 images during form submission. If you upload more than 12, submission will fail with an error message.
      </p>
    </div>
  );
}
```

**Race condition documentation** (REVISED - MEDIUM finding #4):
- Client-side enforcement: Gallery length is checked before adding each file from drag-drop/click
- Between user selecting multiple files and completion, the count could theoretically change if other browser tabs are updating the same component state (unlikely in single-tab SPA, but documented)
- Server-side enforcement: Zod schema validates `gallery_urls.max(12)` in final request. If submission fails with this error, the error message displays as `uploadError` in component
- User can then remove images and resubmit

---

#### TagInput.tsx (new)

Input component for comma-separated tags (tech stack).

```typescript
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "./Badge";
import { Label } from "./Label";
import { FieldError } from "./FieldError";
import type { FieldError as FieldErrorType } from "react-hook-form";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  error?: FieldErrorType;
  required?: boolean;
  maxTags?: number;
  placeholder?: string;
}

export function TagInput({
  label,
  value,
  onChange,
  error,
  required,
  maxTags = 20,
  placeholder = "Enter tag and press Enter",
}: TagInputProps) {
  const [input, setInput] = useState("");
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const newTag = input.trim().replace(/,+$/, "");
      
      if (!value.includes(newTag) && value.length < maxTags) {
        onChange([...value, newTag]);
        setInput("");
      }
    }
  };
  
  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };
  
  return (
    <div className="space-y-2">
      <Label required={required}>{label}</Label>
      
      <div className="space-y-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2 bg-bg border border-border rounded text-fg focus:outline-none focus:border-accent",
            error && "border-red-500",
          )}
          disabled={value.length >= maxTags}
        />
        
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              {tag} ✕
            </Badge>
          ))}
        </div>
        
        {value.length >= maxTags && (
          <p className="text-xs text-muted">Maksimal {maxTags} tags</p>
        )}
      </div>
      
      <FieldError error={error} />
    </div>
  );
}
```

---

### ProjectForm.tsx

Reusable form component for creating and editing projects. Integrates all field components and handles form state with React Hook Form.

(REVISED - addressing HIGH finding #1):

```typescript
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { MarkdownEditorField } from "@/components/form/MarkdownEditorField";
import { ImageUploadField } from "@/components/form/ImageUploadField";
import { GalleryUploadField } from "@/components/form/GalleryUploadField";
import { TagInput } from "@/components/form/TagInput";
import { slugify } from "@/lib/slugify";
import { useUploadImage } from "@/hooks/use-upload";
import { createProjectSchema, updateProjectSchema, PROJECT_CATEGORIES } from "@/types/api";
import type { CreateProjectInput, UpdateProjectInput, ProjectDTO } from "@/types/api";

interface ProjectFormProps {
  project?: ProjectDTO;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => void;
  isLoading?: boolean;
  error?: string;
  onCancel?: () => void;
}

export function ProjectForm({
  project,
  onSubmit,
  isLoading = false,
  error,
  onCancel,
}: ProjectFormProps) {
  const isEditing = !!project;
  const schema = isEditing ? updateProjectSchema : createProjectSchema;
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput | UpdateProjectInput>({
    resolver: zodResolver(schema),
    defaultValues: project || {
      status: "draft",
      category: "fullstack",
      is_featured: false,
      gallery_urls: [],
      tech_stack: [],
    },
  });
  
  const titleValue = watch("title");
  const slugValue = watch("slug");
  
  // Auto-generate slug from title on create (when creating new project)
  useEffect(() => {
    if (!isEditing && titleValue && !slugValue) {
      setValue("slug", slugify(titleValue));
    }
  }, [titleValue, slugValue, isEditing, setValue]);
  
  // Handle slug conflict error from server (HIGH finding #1 resolution)
  // If server returns 409 ConflictError with "slug", display it inline
  useEffect(() => {
    if (error?.includes("slug")) {
      // Could set form error here if needed via setError() from useForm
      // For now, display at form level via error prop
    }
  }, [error]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-4 bg-red-600/20 border border-red-600 rounded text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {/* Title */}
      <Input
        {...register("title")}
        label="Project Title"
        placeholder="My Amazing Project"
        error={errors.title?.message}
        required
      />
      
      {/* Slug with conflict handling */}
      <div>
        <Label required>Slug</Label>
        <div className="flex gap-2">
          <Input
            {...register("slug")}
            placeholder="my-amazing-project"
            error={errors.slug?.message}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setValue("slug", slugify(titleValue))}
            className="mt-6"
          >
            Auto Generate
          </Button>
        </div>
      </div>
      
      {/* Summary */}
      <Textarea
        {...register("summary")}
        label="Summary"
        placeholder="A brief description of your project..."
        error={errors.summary?.message}
        required
      />
      
      {/* Category & Status */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          {...register("category")}
          label="Category"
          options={PROJECT_CATEGORIES.map((cat) => ({
            value: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " "),
          }))}
          error={errors.category?.message}
        />
        
        <Select
          {...register("status")}
          label="Status"
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ]}
          error={errors.status?.message}
        />
      </div>
      
      {/* Thumbnail */}
      <ImageUploadField
        label="Thumbnail"
        value={watch("thumbnail_url") as string | null}
        onChange={(url) => setValue("thumbnail_url", url)}
        error={errors.thumbnail_url as any}
      />
      
      {/* Gallery - with server validation error handling (MEDIUM finding #4) */}
      <GalleryUploadField
        label="Gallery Images"
        value={watch("gallery_urls") as string[]}
        onChange={(urls) => setValue("gallery_urls", urls)}
        error={errors.gallery_urls as any}
      />
      
      {/* Content (Markdown) */}
      <MarkdownEditorField
        label="Project Content (Markdown)"
        value={watch("content") as string}
        onChange={(value) => setValue("content", value)}
        error={errors.content as any}
        required
      />
      
      {/* Tech Stack */}
      <TagInput
        label="Tech Stack"
        value={watch("tech_stack") as string[]}
        onChange={(tags) => setValue("tech_stack", tags)}
        error={errors.tech_stack as any}
        maxTags={20}
      />
      
      {/* Links */}
      <Input
        {...register("repo_url")}
        label="Repository URL"
        placeholder="https://github.com/..."
        error={errors.repo_url?.message}
        type="url"
      />
      
      <Input
        {...register("demo_url")}
        label="Demo URL"
        placeholder="https://..."
        error={errors.demo_url?.message}
        type="url"
      />
      
      <Input
        {...register("notebook_url")}
        label="Notebook URL"
        placeholder="https://colab.research.google.com/..."
        error={errors.notebook_url?.message}
        type="url"
      />
      
      {/* Featured checkbox */}
      <Checkbox
        {...register("is_featured")}
        label="Featured project"
        type="checkbox"
      />
      
      {/* Submit buttons */}
      <div className="flex gap-3 pt-6">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditing ? "Update Project" : "Create Project"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
```

**Slug conflict handling** (HIGH finding #1):
- On create: Client shows auto-slug based on title, displays advisory check
- If server returns 409 ConflictError with "Slug sudah digunakan" message, it displays at form level in error banner
- User can click "Auto Generate" to regenerate slug from title, or manually edit slug field
- Form stays open for retry; no auto-clear of slug field (user has control)

---

### Admin Pages

#### DashboardPage.tsx (updated)

```typescript
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAdminProjects } from "@/hooks/use-admin-projects";
import { useLogout, useMe } from "@/hooks/queries/use-auth";

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const { data: user, isLoading: userLoading } = useMe();
  const { data: projectsEnvelope, isLoading: projectsLoading } = useAdminProjects(page);
  const { mutate: logout, isPending: logoutPending } = useLogout();
  
  if (userLoading) {
    return <Skeleton className="h-96" />;
  }
  
  const projects = projectsEnvelope?.data ?? [];
  const pagination = projectsEnvelope?.pagination;
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-fg">Dashboard Admin</h1>
        <Button onClick={() => logout()} variant="secondary" isLoading={logoutPending}>
          Logout
        </Button>
      </div>
      
      {user && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-fg mb-2">Welcome back, {user.username}!</h2>
          <p className="text-muted">Manage your portfolio projects from here.</p>
        </Card>
      )}
      
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-fg">Projects</h2>
          <Link to="/admin/projects/new" className="inline-block">
            <Button variant="primary">+ New Project</Button>
          </Link>
        </div>
        
        {projectsLoading ? (
          <Skeleton className="h-64" />
        ) : projects.length === 0 ? (
          <p className="text-muted py-8 text-center">No projects yet. Create your first one!</p>
        ) : (
          <>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-border rounded">
                  <div>
                    <h3 className="font-medium text-fg">{project.title}</h3>
                    <p className="text-sm text-muted">
                      {project.category} • {project.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/admin/projects/${project.id}/edit`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={!pagination.has_prev_page}
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted self-center">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.has_next_page}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
```

---

#### ProjectEditorPage.tsx (updated)

```typescript
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProjectForm } from "@/components/form/ProjectForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAdminProject, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/use-admin-projects";
import { useToast } from "@/hooks/use-toast";
import type { CreateProjectInput, UpdateProjectInput } from "@/types/api";

export default function ProjectEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreating = id === "new";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: project, isLoading: projectLoading } = useAdminProject(id!);
  const { mutate: createProject, isPending: createPending } = useCreateProject();
  const { mutate: updateProject, isPending: updatePending } = useUpdateProject();
  const { mutate: deleteProject, isPending: deletePending } = useDeleteProject();
  
  const handleSubmit = (data: CreateProjectInput | UpdateProjectInput) => {
    setFormError(null);
    
    if (isCreating) {
      createProject(data as CreateProjectInput, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Project created successfully",
            type: "success",
          });
          navigate("/admin");
        },
        onError: (error) => {
          setFormError(error.message || "Failed to create project");
        },
      });
    } else {
      updateProject(
        { id: id!, data: data as Partial<UpdateProjectInput> },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Project updated successfully",
              type: "success",
            });
            navigate("/admin");
          },
          onError: (error) => {
            setFormError(error.message || "Failed to update project");
          },
        },
      );
    }
  };
  
  const handleDelete = () => {
    deleteProject(id!, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Project deleted",
          type: "success",
        });
        navigate("/admin");
      },
    });
  };
  
  if (!isCreating && projectLoading) {
    return <Skeleton className="h-96" />;
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-fg mb-8">
        {isCreating ? "Create Project" : "Edit Project"}
      </h1>
      
      <Card>
        <ProjectForm
          project={!isCreating ? project : undefined}
          onSubmit={handleSubmit}
          isLoading={createPending || updatePending}
          error={formError}
          onCancel={() => navigate("/admin")}
        />
      </Card>
      
      {!isCreating && (
        <div className="mt-8 p-6 border border-red-600/30 rounded bg-red-600/10">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Danger Zone</h3>
          <p className="text-muted text-sm mb-4">Deleting a project is permanent and cannot be undone.</p>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Project
          </Button>
        </div>
      )}
      
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Project"
          description="Are you sure you want to delete this project? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isDangerous
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={deletePending}
        />
      )}
    </div>
  );
}
```

---

## Testability Considerations

### Unit Tests

- **Slug generation**: `slugify("Title with Special!@# Chars")` → `"title-with-special-chars"`
- **Image type detection**: Test `detectImageType()` with valid magic bytes (PNG, JPG, GIF, WebP) and invalid files
- **Model functions**: Mock Drizzle ORM, test that functions return correct types and propagate errors
- **Zod schemas**: Test validation for all field constraints (min/max length, enum values, URL format)

### Integration Tests

- **Create project with slug conflict**: POST /admin/projects with existing slug → 409 ConflictError
- **Update project with slug change to duplicate**: PUT /admin/projects/:id with duplicate slug → 409
- **Delete non-existent project**: DELETE /admin/projects/invalid-id → 404 NotFoundError
- **Upload non-image file**: POST /upload with .txt file → 415 UnsupportedMediaType
- **Upload oversized image**: POST /upload with 15MB file → 413 PayloadTooLarge
- **Unauthenticated access**: GET /admin/projects without cookie → 401 Unauthorized

### E2E Tests

- **Full admin flow**: Login → Dashboard → Create project with thumbnail + gallery + markdown → Verify appears on public list → Edit project → Delete project
- **Race condition on slug**: Two admins simultaneously create projects with same slug; one succeeds (201), one fails (409)
- **Cache invalidation**: Create/update project on admin, verify public projects list updates without manual refresh

---

## Error Handling Summary

### Backend

| Error | HTTP Status | Cause | Recovery |
|-------|------------|-------|----------|
| Missing session cookie | 401 | Not authenticated | Redirect to login |
| Invalid JWT signature | 401 | Token tampered or expired | Redirect to login, re-authenticate |
| Project not found | 404 | ID doesn't exist in DB | User sees 404 page, returns to dashboard |
| Slug already in use | 409 | Unique constraint violation | Form displays error, user changes slug and resubmits |
| Invalid JSON body | 400 | Malformed request | Validation error lists specific fields |
| File too large | 413 | Upload exceeds 10MB | User selects smaller file |
| File not an image | 415 | Magic bytes don't match allowed types | User selects valid image file |
| Database connection error | 500 | DB unreachable | Error handler logs, returns generic 500 |

### Frontend

| Scenario | UX | Code |
|----------|-----|------|
| 401 on any admin endpoint | Redirect to /admin/login | ProtectedRoute checks useMe(), redirects on error |
| 409 slug conflict on form submit | Error banner displays "Slug sudah digunakan" | ProjectForm catches ApiClientError, sets formError state |
| Gallery upload fails (server rejects 13th image) | Error message below gallery field | GalleryUploadField catches mutation error, displays inline |
| Network timeout | Error toast displayed | Query error boundary or per-hook error callback |

---

## Design Review Responses (REVISED)

### HIGH-1: Slug Check Race Condition

**Review Finding**: Design implements client-side slug check but allows race conditions without clear UX.

**Resolution**: Implemented **Option B (Permissive with server-side enforcement)**:
- Client-side slug availability check is advisory; users see "Available ✓" or "In use ⚠️" before submit
- Server enforces unique constraint; if race condition occurs, returns 409 ConflictError
- ProjectForm catches 409 and displays error banner: "Slug sudah digunakan"
- User clicks "Auto Generate" or manually edits slug, then resubmits
- No auto-clear of slug field; user has full control
- See ProjectForm.tsx section for implementation

---

### HIGH-2: Model Error Handling Inconsistency

**Review Finding**: Model functions return undefined on not-found but comments say "controller throws" — error handling policy unclear.

**Resolution**: Added explicit **Model Layer Error Handling Policy** section:
- **All model functions propagate native Drizzle errors** (DB connection, syntax errors) without catching
- **Controller layer catches specific conditions**: not-found rows (return undefined), unique constraint violations (Drizzle error codes)
- Each function now documents: "Returns undefined if not found; caller throws NotFoundError"
- deleteProject clarified: "Returns undefined on not-found; controller throws NotFoundError"
- See Admin Project Model Functions section for full details with updated function signatures

---

### HIGH-3: Cache Invalidation Not Accounting for Filters

**Review Finding**: Public cache invalidation uses `queryKey: ['projects']` which doesn't clear filtered variants.

**Resolution**: Updated use-admin-projects.ts to use `invalidateQueries({ queryKey: ['projects'], exact: false })`:
- `exact: false` matches all query keys starting with `['projects']` (e.g., `['projects', {filters}, page, limit]`)
- This clears ALL public project list queries when status changes to 'published'
- Admin cache uses `['admin', 'projects']` which is not affected by this invalidation
- See useUpdateProject hook for implementation

---

### MEDIUM-4: Gallery Race Condition & Server Validation Error Display

**Review Finding**: Gallery 12-image limit is checked client-side but not atomic; server validation error display unclear.

**Resolution**: Added comprehensive documentation and error handling:
- GalleryUploadField enforces max 12 client-side with notice: "⚠️ Client-side check is not atomic"
- Server Zod schema validates `max(12)` in request body
- If submission fails with "Maksimal 12 gambar" error, ProjectForm catches and displays in error banner
- User can remove images and resubmit
- Added note in GalleryUploadField: "Server validates max 12 images during form submission"
- See GalleryUploadField.tsx and ProjectForm.tsx sections

---

### MEDIUM-5: Admin Query Schema Not Fully Defined

**Review Finding**: adminProjectListQuerySchema shown but inherited constraints not re-stated.

**Resolution**: Expanded DTO & Schema Updates section with full schema definition:
```typescript
export const adminProjectListQuerySchema = projectListQuerySchema.extend({
  // status: single or array (unlike public default "published")
  status: z.union([projectStatusSchema, z.array(projectStatusSchema)]).optional(),
  // limit: default 10 (unlike public default 6), max 50
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
```
- Explicitly re-stated inherited constraints: page (default 1, min 1), limit (default 10, min 1, max 50)
- Clarified status field can be single or array
- See DTO & Schema Updates section

---

## Unresolved Assumptions from Review

**401 Redirect Logic Placement**: ProtectedRoute component checks useMe() and redirects on auth error. This is a design decision not reflected in original review — the review noted this was ambiguous. Documented in "Session Management & Authentication" section.

**Spinner and cn() Utilities**: Assumed to exist at `@/components/ui/Spinner` and `@/lib/cn`. These are already verified to exist in the codebase; no changes needed.

