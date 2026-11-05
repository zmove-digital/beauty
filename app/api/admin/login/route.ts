import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  checkPassword,
  createSessionToken,
  isAdminConfigured,
} from "@/lib/admin-auth";
import {
  checkLoginRateLimit,
  clientIp,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/rate-limit";

/** Slows down scripted guessing without affecting a normal login. */
const FAILURE_DELAY_MS = 400;

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD não está definido no .env.local." },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  const limit = checkLoginRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!checkPassword(password)) {
    const state = recordLoginFailure(ip);
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    return NextResponse.json(
      {
        error: "Senha incorreta.",
        remainingAttempts: state.remaining,
      },
      { status: 401 },
    );
  }

  resetLoginFailures(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: createSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

/** Behind a proxy the request URL is often http, so trust x-forwarded-proto. */
function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return new URL(request.url).protocol === "https:";
}
