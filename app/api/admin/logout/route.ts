import { NextResponse } from "next/server";
import { ADMIN_COOKIE, LEGACY_ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  const secure = isSecureRequest(request);

  for (const name of [ADMIN_COOKIE, LEGACY_ADMIN_COOKIE]) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

/** Behind a proxy the request URL is often http, so trust x-forwarded-proto. */
function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return new URL(request.url).protocol === "https:";
}
