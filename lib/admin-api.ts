import { NextResponse } from "next/server";
import { hasAdminSession } from "./admin-auth";
import { getAdminClient } from "./supabase-admin";

/**
 * Shared guard for every /api/admin route: a valid session cookie and a
 * configured Supabase service-role client are both required.
 */
export async function guardAdmin(): Promise<NextResponse | null> {
  if (!(await hasAdminSession())) {
    return NextResponse.json(
      { error: "Sessão expirada. Entre novamente em /admin/login." },
      { status: 401 },
    );
  }

  if (!getAdminClient()) {
    return NextResponse.json(
      {
        error:
          "Supabase não configurado. Adicione NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY ao .env.local e reinicie o servidor.",
      },
      { status: 503 },
    );
  }

  return null;
}

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function slugifyHandle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
