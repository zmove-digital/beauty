const FALLBACK_SITE_URL = "https://youmibeauty.com";

/**
 * Normalises NEXT_PUBLIC_SITE_URL for metadata, the sitemap and robots.txt.
 * Empty values and values without a scheme would otherwise make `new URL()`
 * throw during the Vercel build.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(withScheme).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}
