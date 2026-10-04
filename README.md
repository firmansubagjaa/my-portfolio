# My Portfolio

Aplikasi portfolio personal dengan teknologi modern: React + Vite (frontend), Hono.js + Bun (backend), Drizzle ORM, Supabase, dan TypeScript.

## Struktur Proyek

```
portfolio/
├── client/                    Frontend (React + Vite)
├── server/                    Backend (Hono.js + Bun)
└── README.md
```

Setiap folder adalah project terpisah dengan `package.json` dan `bun.lock` sendiri, dapat di-deploy secara independen ke Vercel.

## Setup Lokal

### Prasyarat

- [Bun](https://bun.sh/) v1.0+
- [Git](https://git-scm.com/)
- Akun Supabase dengan database PostgreSQL

### Konfigurasi Supabase

1. Buat akun [Supabase](https://supabase.com/)
2. Buat project baru dan database PostgreSQL
3. Copy credentials:
   - **Project URL**: `https://<project-ref>.supabase.co`
   - **Service Role Key**: Settings → API → Service Role Key (dari Supabase Dashboard)
   - **Transaction Pooler Connection String**: Settings → Database → Connection Pooling
     - Port: `6543` (bukan 5432)
     - Format: `postgres://postgres.<project-ref>:<password>@<host>.pooler.supabase.com:6543/postgres`

### Setup Server

```bash
cd server

# 1. Setup environment
cp .env.example .env

# Edit .env dengan credentials Supabase Anda
# - DATABASE_URL: transaction pooler (port 6543)
# - DIRECT_URL: direct connection (port 5432)
# - JWT_SECRET: bun -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
# - SEED_ADMIN_PASSWORD: password minimal 12 karakter

# 2. Install dependencies
bun install

# 3. Generate & migrate database
bun run db:generate
bun run db:migrate

# 4. Seed data (admin user + 2 example projects)
bun run db:seed

# 5. Start development server
bun run dev
# Server jalan di http://localhost:3000
```

### Setup Client

```bash
cd client

# 1. Install dependencies (sudah terinstall dari bun create vite)
bun install

# 2. Start development server (dengan proxy ke backend di port 3000)
bun run dev
# Client jalan di http://localhost:5173
```

### Scripts

**Server:**

```bash
bun run dev          # Development server dengan hot reload
bun run start        # Production server
bun run typecheck    # TypeScript type checking
bun run lint         # Biome linting
bun run format       # Biome format
bun run test         # Run tests
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Apply migrations
bun run db:push      # Push schema changes (alternatif migrate)
bun run db:studio    # Drizzle Studio UI
bun run db:seed      # Run seed script
```

**Client:**

```bash
bun run dev          # Development server
bun run build        # Production build
bun run preview      # Preview production build
bun run typecheck    # TypeScript type checking
bun run lint         # Biome linting
bun run format       # Biome format
```

## API Endpoints

### Health

- `GET /api/v1/health` - Check server & database status

### Authentication

- `POST /api/v1/auth/login` - Login admin
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user (protected)

### Admin Projects (protected)

- `GET /api/v1/admin/projects` - List all projects (draft, published, archived)
- `GET /api/v1/admin/projects/:id` - Get project by ID

### Public Projects

- `GET /api/v1/projects` - List published projects
- `GET /api/v1/projects/:slug` - Get project by slug

## Database Schema

### Table: `users`

- `id` (UUID, PK)
- `username` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)

### Table: `projects`

- `id` (UUID, PK)
- `title` (VARCHAR)
- `slug` (VARCHAR, UNIQUE)
- `summary` (TEXT)
- `content` (TEXT, Markdown)
- `thumbnail_url` (VARCHAR, nullable)
- `gallery_urls` (VARCHAR[], default [])
- `tech_stack` (VARCHAR[], default [])
- `category` (ENUM: fullstack, ai_ml, frontend, backend, experiment)
- `repo_url` (VARCHAR, nullable)
- `demo_url` (VARCHAR, nullable)
- `notebook_url` (VARCHAR, nullable)
- `is_featured` (BOOLEAN, default false)
- `status` (ENUM: draft, published, archived)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Response Format

### Success (2xx)

```json
{
  "success": true,
  "status": 200,
  "category": "SUCCESS",
  "message": "Pesan sukses",
  "data": { ... },
  "pagination": { "current_page": 1, "limit": 6, "total_items": 12, "total_pages": 2, "has_next_page": true, "has_prev_page": false },
  "timestamp": "2026-10-04T17:10:55Z"
}
```

### Error (4xx/5xx)

```json
{
  "success": false,
  "status": 400,
  "category": "VALIDATION_ERROR",
  "message": "Pesan error umum",
  "errors": { "field_name": ["Detail error"] },
  "timestamp": "2026-10-04T17:10:55Z"
}
```

## Deployment

### Server (Vercel)

1. Buat project Vercel baru, select repo GitHub
2. Settings → Root Directory: `server`
3. Environment Variables: copy semua key dari `server/.env` (bukan `.env.example`)
4. Deploy

**Vercel Config** (`server/vercel.json`):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "bunVersion": "1.x"
}
```

### Client (Vercel)

1. Buat project Vercel baru, select repo GitHub
2. Settings → Root Directory: `client`
3. Settings → Include files outside of root directory: **ON**
   (dibutuhkan untuk import shared types dari `server/src/shared`)
4. Environment Variables:
   - `VITE_SITE_URL`: domain client production (e.g., `https://portfolio.vercel.app`)
5. Deploy

## Milestone Progress

- [x] #2 Backend Core Setup
- [ ] #3 Frontend Core Setup
- [ ] #4 Public Showcase (Bento Grid)
- [ ] #5 Admin CMS
- [ ] #6 SEO & Web Vitals

## License

MIT
