// File: /server/src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().int().positive().default(3000),
	DATABASE_URL: z
		.string()
		.url()
		.refine(
			(v) => new URL(v).port === "6543",
			"DATABASE_URL harus memakai Supavisor transaction pooler port 6543",
		),
	DIRECT_URL: z.string().url().optional(),
	JWT_SECRET: z.string().min(32, "JWT_SECRET minimal 32 karakter"),
	JWT_EXPIRES_IN: z
		.string()
		.regex(/^\d+[smhd]$/, "JWT_EXPIRES_IN format: <number><s|m|h|d>")
		.default("7d"),
	COOKIE_NAME: z.string().min(1).default("portfolio_session"),
	CORS_ORIGINS: z
		.string()
		.min(1)
		.default("http://localhost:5173")
		.transform((v) =>
			v
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		),
	PUBLIC_SITE_URL: z.string().url(),
	SUPABASE_URL: z.string().url(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
	SUPABASE_STORAGE_BUCKET: z.string().min(1).default("portfolio-assets"),
});

type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error("❌ Environment validation error:");
		const { fieldErrors } = z.flattenError(result.error);
		Object.entries(fieldErrors).forEach(([key, messages]) => {
			if (messages) {
				console.error(`  ${key}: ${messages.join(", ")}`);
			}
		});
		process.exit(1);
	}

	return result.data;
}

export const env = parseEnv();
export const isProduction = env.NODE_ENV === "production";
