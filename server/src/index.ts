// File: /server/src/index.ts
// Bun automatically serves the default export as a web server on the port from env.PORT
// Vercel also detects Hono apps from default export for serverless deployment
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import { env } from "./config/env";
import { healthController } from "./controllers/health.controller";
import { authController } from "./controllers/auth.controller";
import { projectController } from "./controllers/project.controller";
import { adminController } from "./controllers/admin.controller";
import { uploadController } from "./controllers/upload.controller";
import { requireAuth } from "./middlewares/auth";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import type { AppEnv } from "./types/app-env";

const app = new Hono<AppEnv>();

// Security middleware
app.use("*", secureHeaders());

// CORS middleware for API routes
app.use(
	"/api/*",
	cors({
		origin: env.CORS_ORIGINS,
		credentials: true,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type"],
		maxAge: 600,
	}),
);

// Fail hung requests (e.g. a stuck DB call) with a JSON 504 from the error
// handler instead of a dropped socket. Must stay below idleTimeout below.
app.use(
	"/api/*",
	timeout(
		20_000,
		() => new HTTPException(504, { message: "Server terlalu lama merespons" }),
	),
);

// Register routes
app.route("/api/v1/health", healthController);
app.route("/api/v1/auth", authController);
app.route("/api/v1/projects", projectController);

// Admin routes (protected) - HIGH-2: Correct middleware pattern
app.use("/api/v1/admin*", requireAuth);
app.route("/api/v1/admin", adminController);

// Upload routes (protected) - HIGH-2: Correct middleware pattern
app.use("/api/v1/upload*", requireAuth);
app.route("/api/v1/upload", uploadController);

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

// Bun reads serve options from the default export. Its default idleTimeout (10s)
// cut slow-but-legitimate requests when the DB pooler was slow, so raise it above
// the request timeout (20s) so the JSON 504 is always sent first. The Hono
// instance itself stays the default export so Vercel's Hono detection still works.
export default Object.assign(app, { idleTimeout: 30 });
