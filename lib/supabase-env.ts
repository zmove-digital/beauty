/**
 * Reads and validates the Supabase environment.
 *
 * Values copied from dashboards or `.env` files often arrive wrapped in quotes,
 * with the scheme missing, or blank. Passing those straight to `createClient`
 * throws while Next.js prerenders pages, which breaks the whole build (as seen
 * on Vercel). Invalid values are treated as "not configured" so the storefront
 * can fall back to the local catalog instead of failing the deployment.
 */

function clean(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/^["']|["']$/g, "").trim();
}

export function normalizeSupabaseUrl(raw: string | undefined): string | null {
  const value = clean(raw);
  if (!value) return null;

  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(withScheme);
    if (!url.hostname) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function normalizeKey(raw: string | undefined): string | null {
  const value = clean(raw);
  return value ? value : null;
}

export type SupabaseConfig = {
  url: string;
  anonKey: string | null;
  serviceRoleKey: string | null;
};

export function readSupabaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): SupabaseConfig | null {
  const url = normalizeSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  if (!url) return null;

  return {
    url,
    anonKey: normalizeKey(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: normalizeKey(env.SUPABASE_SERVICE_ROLE_KEY),
  };
}
