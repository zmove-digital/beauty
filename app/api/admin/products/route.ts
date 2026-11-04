import { NextResponse } from "next/server";
import {
  asNumber,
  asString,
  guardAdmin,
  readBody,
  slugifyHandle,
} from "@/lib/admin-api";
import { revalidateStorefront } from "@/lib/admin-revalidate";
import { getAdminClient } from "@/lib/supabase-admin";

type OptionInput = { name: string; values: string[] };
type DetailInput = { title: string; content: string };
type ImageInput = { src: string; alt: string };

function parseOptions(value: unknown): OptionInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const name = asString(record.name);
      const values = Array.isArray(record.values)
        ? record.values.map((item) => asString(item)).filter(Boolean)
        : [];
      if (!name || !values.length) return null;
      return { name, values };
    })
    .filter((entry): entry is OptionInput => Boolean(entry));
}

function parseDetails(value: unknown): DetailInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const title = asString(record.title);
      const content = typeof record.content === "string" ? record.content : "";
      if (!title && !content.trim()) return null;
      return { title: title || "Detalhes", content };
    })
    .filter((entry): entry is DetailInput => Boolean(entry));
}

function parseMetadata(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const name = key.trim();
    if (!name) continue;
    result[name] = asString(raw);
  }
  return result;
}

function parseImages(value: unknown): ImageInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const src = asString(record.src);
      if (!src) return null;
      return { src, alt: asString(record.alt) };
    })
    .filter((entry): entry is ImageInput => Boolean(entry));
}

export async function POST(request: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const admin = getAdminClient()!;
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const title = asString(body.title);
  const handle = slugifyHandle(asString(body.handle) || title);
  const price = asNumber(body.price, -1);
  const compareAtPrice = body.compareAtPrice === null || body.compareAtPrice === "" ? null : asNumber(body.compareAtPrice, 0);

  if (!title) return NextResponse.json({ error: "Informe o nome do produto." }, { status: 400 });
  if (!handle) return NextResponse.json({ error: "Informe um handle válido (letras, números e hífens)." }, { status: 400 });
  if (price < 0) return NextResponse.json({ error: "Informe um preço válido." }, { status: 400 });

  const images = parseImages(body.images);
  if (!images.length) {
    return NextResponse.json({ error: "Adicione pelo menos uma imagem." }, { status: 400 });
  }

  const options = parseOptions(body.options);
  const details = parseDetails(body.details);
  const metadata = parseMetadata(body.metadata);
  const collections = Array.isArray(body.collections)
    ? body.collections.map((entry) => asString(entry)).filter(Boolean)
    : [];
  const soldOut = Boolean(body.soldOut);
  const featured = Boolean(body.featured);

  const { data: product, error } = await admin
    .from("products")
    .upsert(
      {
        handle,
        title,
        subtitle: asString(body.subtitle) || null,
        price,
        compare_at_price: compareAtPrice && compareAtPrice > 0 ? compareAtPrice : null,
        category: asString(body.category),
        badge: asString(body.badge) || null,
        sold_out: soldOut,
        featured,
        description: typeof body.description === "string" ? body.description : "",
        options,
        details,
        metadata,
        position: Math.trunc(asNumber(body.position, 0)),
      },
      { onConflict: "handle" },
    )
    .select("id")
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: `Não foi possível salvar o produto: ${error?.message ?? "erro desconhecido"}` },
      { status: 500 },
    );
  }

  const productId = product.id as string;

  const { error: imageDeleteError } = await admin
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (imageDeleteError) {
    return NextResponse.json({ error: `Imagens: ${imageDeleteError.message}` }, { status: 500 });
  }

  const { error: imageError } = await admin.from("product_images").insert(
    images.map((image, index) => ({
      product_id: productId,
      src: image.src,
      alt: image.alt || title,
      position: index,
    })),
  );
  if (imageError) return NextResponse.json({ error: `Imagens: ${imageError.message}` }, { status: 500 });

  const { error: linkDeleteError } = await admin
    .from("product_collections")
    .delete()
    .eq("product_id", productId);
  if (linkDeleteError) {
    return NextResponse.json({ error: `Coleções: ${linkDeleteError.message}` }, { status: 500 });
  }

  if (collections.length) {
    const { data: collectionRows, error: collectionError } = await admin
      .from("collections")
      .select("id,handle")
      .in("handle", collections);
    if (collectionError) {
      return NextResponse.json({ error: `Coleções: ${collectionError.message}` }, { status: 500 });
    }
    const links = (collectionRows ?? []).map((row) => ({
      product_id: productId,
      collection_id: row.id as string,
    }));
    if (links.length) {
      const { error: linkError } = await admin.from("product_collections").insert(links);
      if (linkError) return NextResponse.json({ error: `Coleções: ${linkError.message}` }, { status: 500 });
    }
  }

  // Keep the variants table aligned with the options shown on the storefront.
  const { error: variantDeleteError } = await admin
    .from("product_variants")
    .delete()
    .eq("product_id", productId);
  if (variantDeleteError) {
    return NextResponse.json({ error: `Variações: ${variantDeleteError.message}` }, { status: 500 });
  }

  const variants = options.flatMap((option) =>
    option.values.map((value) => ({
      product_id: productId,
      title: value,
      options: { [option.name]: value },
      price,
      available: !soldOut,
    })),
  );
  if (variants.length) {
    const { error: variantError } = await admin.from("product_variants").insert(variants);
    if (variantError) return NextResponse.json({ error: `Variações: ${variantError.message}` }, { status: 500 });
  }

  revalidateStorefront({ products: [handle], collections });

  return NextResponse.json({ ok: true, handle });
}

export async function DELETE(request: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const admin = getAdminClient()!;
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle")?.trim();

  if (!handle) return NextResponse.json({ error: "Handle não informado." }, { status: 400 });

  const { data: product } = await admin
    .from("products")
    .select("id, product_collections(collections(handle))")
    .eq("handle", handle)
    .maybeSingle();

  if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });

  const collections = (product.product_collections ?? [])
    .map((link: Record<string, any>) => (Array.isArray(link.collections) ? link.collections[0]?.handle : link.collections?.handle))
    .filter(Boolean) as string[];

  const { error } = await admin.from("products").delete().eq("id", product.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateStorefront({ products: [handle], collections });
  return NextResponse.json({ ok: true });
}
