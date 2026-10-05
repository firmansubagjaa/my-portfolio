// File: /server/src/utils/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

/**
 * Create Supabase client for storage operations
 * Uses service role key for admin access to storage bucket
 */
export function createSupabaseClient() {
	return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}
