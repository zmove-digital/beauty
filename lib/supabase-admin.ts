import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedAdmin: SupabaseClient | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey);
}

/**
 * Server-only Supabase client. Uses the service-role key so it can write
 * orders and newsletter subscribers while RLS stays locked down.
 * Returns null when the environment is not configured, which lets the
 * storefront run in demo mode with the local catalog.
 */
export function getAdminClient(): SupabaseClient | null {
  if (!supabaseUrl || !serviceRoleKey) return null;
  if (!cachedAdmin) {
    cachedAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAdmin;
}
