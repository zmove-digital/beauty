import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "roman_admin";
export const LEGACY_ADMIN_COOKIE = "youmi_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

/** The admin area needs ADMIN_PASSWORD in the environment to be usable. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "roman-admin-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature || !/^\d+$/.test(issuedAt)) return false;
  if (!safeEqual(signature, sign(issuedAt))) return false;
  const age = Date.now() - Number(issuedAt);
  return age >= 0 && age < SESSION_TTL_MS;
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

export const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);

/** Reads the session cookie inside server components and route handlers. */
export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  if (verifySessionToken(store.get(ADMIN_COOKIE)?.value)) return true;
  // Sessions issued before the rebrand used the legacy cookie name.
  return verifySessionToken(store.get(LEGACY_ADMIN_COOKIE)?.value);
}
