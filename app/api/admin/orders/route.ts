import { NextResponse } from "next/server";
import { asString, guardAdmin, readBody } from "@/lib/admin-api";
import { getAdminClient } from "@/lib/supabase-admin";

const ALLOWED_STATUSES = ["pending", "paid", "fulfilled", "cancelled", "refunded"];

export async function PATCH(request: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const admin = getAdminClient()!;
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const id = asString(body.id);
  const status = asString(body.status).toLowerCase();

  if (!id) return NextResponse.json({ error: "Pedido não informado." }, { status: 400 });
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const { error } = await admin.from("orders").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status });
}
