// Helpers for the client-side cart, wishlist and order history.
// The storage keys and product handles were renamed from the Youmi Beauty
// era to Roman Beauty; these helpers keep existing visitors' data working.

const LEGACY_HANDLE_PREFIX = "youmi-beauty-";
const HANDLE_PREFIX = "roman-beauty-";

const LEGACY_COLLECTIONS: Record<string, string> = {
  "yb-technique": "rb-technique",
};

export function migrateHandle(handle: string): string {
  if (handle.startsWith(LEGACY_HANDLE_PREFIX)) {
    return HANDLE_PREFIX + handle.slice(LEGACY_HANDLE_PREFIX.length);
  }
  return LEGACY_COLLECTIONS[handle] ?? handle;
}

export function migrateKey(key: string): string {
  const [handle, ...rest] = key.split("::");
  const migrated = migrateHandle(handle);
  return migrated === handle ? key : [migrated, ...rest].join("::");
}

/** Reads the current key, falling back to the legacy one and copying it over. */
export function readStorageMigrated(key: string, legacyKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const current = window.localStorage.getItem(key);
    if (current !== null) return current;

    const legacy = window.localStorage.getItem(legacyKey);
    if (legacy === null) return null;

    window.localStorage.setItem(key, legacy);
    window.localStorage.removeItem(legacyKey);
    return legacy;
  } catch {
    return null;
  }
}
