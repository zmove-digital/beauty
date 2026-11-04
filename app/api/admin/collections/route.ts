import { NextResponse } from "next/server";
import { asNumber, asString, guardAdmin, readBody, slugifyHandle } from "@/lib/admin-api";
import { revalidateStorefront } from "@/lib/admin-revalidate";
import { getAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const admin = getAdminClient()!;
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const title = asString(body.title);
  const handle = slugifyHandle(asString(body.handle) || title);
  if (!title) return NextResponse.json({ error: "Informe o nome da coleção." }, { status: 400 });
  if (!handle) return NextResponse.json({ error: "Informe um handle válido." }, { status: 400 });

  const { error } = await admin.from("collections").upsert(
    {
      handle,
      title,
      description: typeof body.description === "string" ? body.description : "",
      image: asString(body.image) || null,
      position: Math.trunc(asNumber(body.position, 0)),
    },
    { onConflict: "handle" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateStorefront({ collections: [handle] });
  return NextResponse.json({ ok: true, handle });
}

export async function DELETE(request: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const admin = getAdminClient()!;
  const handle = new URL(request.url).searchParams.get("handle")?.trim();
  if (!handle) return NextResponse.json({ error: "Handle não informado." }, { status: 400 });

  const { error } = await admin.from("collections").delete().eq("handle", handle);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateStorefront({ collections: [handle] });
  return NextResponse.json({ ok: true });
}
