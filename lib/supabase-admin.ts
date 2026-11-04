import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSupabaseConfig } from "./supabase-env";

const supabaseConfig = readSupabaseConfig();

let cachedAdmin: SupabaseClient | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(supabaseConfig?.serviceRoleKey);
}

/**
 * Server-only Supabase client. Uses the service-role key so it can write
 * orders and newsletter subscribers while RLS stays locked down.
 * Returns null when the environment is not configured, which lets the
 * storefront run in demo mode with the local catalog.
 */
export function getAdminClient(): SupabaseClient | null {
  if (!supabaseConfig?.serviceRoleKey) return null;
  if (!cachedAdmin) {
    cachedAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAdmin;
}
