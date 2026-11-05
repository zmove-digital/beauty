/**
 * Best-effort brute-force protection for the admin login.
 *
 * Vercel runs route handlers in short-lived serverless instances, so this
 * counter lives in memory and is not shared across instances. It stops
 * scripted attacks that hammer one instance; for multi-instance guarantees,
 * put a shared store (Upstash/Redis) behind the same interface.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_TRACKED_IPS = 5000;

type Entry = { failures: number; resetAt: number };

const attempts = new Map<string, Entry>();

function prune(now: number): void {
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key);
  }
  while (attempts.size > MAX_TRACKED_IPS) {
    const oldest = attempts.keys().next().value;
    if (oldest === undefined) break;
    attempts.delete(oldest);
  }
}

/** Client address as seen by the proxy in front of the app. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export type RateLimitState = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

export function checkLoginRateLimit(ip: string): RateLimitState {
  const now = Date.now();
  prune(now);

  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    return { allowed: true, retryAfterSeconds: 0, remaining: MAX_FAILURES };
  }
  if (entry.failures < MAX_FAILURES) {
    return { allowed: true, retryAfterSeconds: 0, remaining: MAX_FAILURES - entry.failures };
  }
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    remaining: 0,
  };
}

export function recordLoginFailure(ip: string): RateLimitState {
  const now = Date.now();
  prune(now);

  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { failures: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0, remaining: MAX_FAILURES - 1 };
  }

  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      remaining: 0,
    };
  }
  return { allowed: true, retryAfterSeconds: 0, remaining: MAX_FAILURES - entry.failures };
}

export function resetLoginFailures(ip: string): void {
  attempts.delete(ip);
}

export const LOGIN_RATE_LIMIT = { windowMs: WINDOW_MS, maxFailures: MAX_FAILURES };
