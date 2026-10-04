// File: /server/src/index.ts
// Bun automatically serves the default export as a web server on the port from env.PORT
// Vercel also detects Hono apps from default export for serverless deployment
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { env } from "./config/env";
import { healthController } from "./controllers/health.controller";
import { authController } from "./controllers/auth.controller";
import { projectController } from "./controllers/project.controller";
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

// Register routes
app.route("/api/v1/health", healthController);
app.route("/api/v1/auth", authController);
app.route("/api/v1/projects", projectController);

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
