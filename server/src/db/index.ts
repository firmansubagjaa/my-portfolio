// File: /server/src/db/index.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "../config/env";

// Create postgres client connection
const client = postgres(env.DATABASE_URL, {
	max: 1,
	prepare: false,
	idle_timeout: 20,
	connect_timeout: 10,
});

// Reuse connection in development to avoid reconnecting on hot reload
if (env.NODE_ENV !== "production") {
	const globalForDb = global as unknown as { db?: typeof client };
	globalForDb.db = client;
}

// Create drizzle instance
export const db = drizzle({ client, schema });

// Export client for seed.ts to close connection
export const sqlClient = client;

export type Database = typeof db;
