import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-api";
import { getAdminClient } from "@/lib/supabase-admin";

const BUCKET = "product-images";
const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

function safeName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "image"
  );
}

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^(jpe?g|png|webp|avif|gif)$/.test(fromName)) return fromName === "jpeg" ? "jpg" : fromName;
  return file.type.split("/").pop() ?? "jpg";
}

export async function POST(request: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const admin = getAdminClient()!;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo recebido." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "A imagem deve ter no máximo 6 MB." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato não suportado. Use JPG, PNG, WebP, AVIF ou GIF." },
      { status: 400 },
    );
  }

  const path = `products/${Date.now()}-${safeName(file.name)}.${extensionFor(file)}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) {
    const hint = /bucket/i.test(error.message)
      ? " O bucket 'product-images' não existe: rode o supabase/schema.sql atualizado."
      : "";
    return NextResponse.json({ error: `${error.message}.${hint}` }, { status: 500 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
