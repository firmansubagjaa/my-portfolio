// File: /server/src/db/index.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env, isProduction } from "../config/env";

type PgClient = ReturnType<typeof postgres>;

function createClient(): PgClient {
	return postgres(env.DATABASE_URL, {
		// Small pool on serverless; a few connections in dev so one slow or
		// stuck query no longer blocks every other request.
		max: isProduction ? 3 : 5,
		// Required for Supabase transaction pooler (no prepared statements)
		prepare: false,
		idle_timeout: 20,
		connect_timeout: 10,
		// Recycle connections after 5 minutes so long-lived ones are dropped
		max_lifetime: 60 * 5,
		// Note: a statement_timeout startup parameter is ignored by the Supavisor
		// transaction pooler, so hung requests are cut by the timeout middleware
		// in src/index.ts instead.
	});
}

// Reuse the client across `bun --hot` reloads in development; otherwise every
// reload would open a new pool and leak the previous one.
const globalForDb = globalThis as typeof globalThis & { __pgClient?: PgClient };

const client = (!isProduction && globalForDb.__pgClient) || createClient();
if (!isProduction) {
	globalForDb.__pgClient = client;
}

// Create drizzle instance
export const db = drizzle({ client, schema });

// Export client for seed.ts to close connection
export const sqlClient = client;

export type Database = typeof db;
