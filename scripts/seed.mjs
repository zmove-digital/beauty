// Seeds Supabase from data/catalog.json.
// Usage:  node scripts/seed.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
// (or in the environment). Never run this in the browser.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  } catch {
    // .env.local is optional when the variables are already exported.
  }
}

loadEnvFile();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "\nMissing Supabase credentials.\n" +
      "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local first.\n"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const catalog = JSON.parse(readFileSync(resolve(process.cwd(), "data/catalog.json"), "utf8"));

async function seedCollections() {
  console.log(`→ collections (${catalog.collections.length})`);
  for (const [index, collection] of catalog.collections.entries()) {
    const { error } = await supabase.from("collections").upsert(
      {
        handle: collection.handle,
        title: collection.title,
        description: collection.description ?? "",
        image: collection.image ?? null,
        position: collection.position ?? index,
      },
      { onConflict: "handle" }
    );
    if (error) throw new Error(`collection ${collection.handle}: ${error.message}`);
  }

  const { data, error } = await supabase.from("collections").select("id,handle");
  if (error) throw error;
  return new Map(data.map((row) => [row.handle, row.id]));
}

async function seedProducts(collectionIds) {
  console.log(`→ products (${catalog.products.length})`);

  for (const [index, product] of catalog.products.entries()) {
    const { data, error } = await supabase
      .from("products")
      .upsert(
        {
          handle: product.handle,
          title: product.title,
          subtitle: product.subtitle ?? null,
          price: product.price,
          compare_at_price: product.compareAtPrice ?? null,
          category: product.category ?? "",
          badge: product.badge ?? null,
          sold_out: Boolean(product.soldOut),
          featured: Boolean(product.featured),
          description: product.description ?? "",
          options: product.options ?? [],
          details: product.details ?? [],
          metadata: product.metadata ?? {},
          position: product.position ?? index,
        },
        { onConflict: "handle" }
      )
      .select("id")
      .single();

    if (error) throw new Error(`product ${product.handle}: ${error.message}`);
    const productId = data.id;

    const { error: imageDeleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);
    if (imageDeleteError) throw imageDeleteError;

    if (product.images?.length) {
      const { error: imageError } = await supabase.from("product_images").insert(
        product.images.map((image, imageIndex) => ({
          product_id: productId,
          src: image.src,
          alt: image.alt ?? product.title,
          position: imageIndex,
        }))
      );
      if (imageError) throw imageError;
    }

    const { error: linkDeleteError } = await supabase
      .from("product_collections")
      .delete()
      .eq("product_id", productId);
    if (linkDeleteError) throw linkDeleteError;

    const links = (product.collections ?? [])
      .map((handle) => collectionIds.get(handle))
      .filter(Boolean)
      .map((collectionId) => ({ product_id: productId, collection_id: collectionId }));

    if (links.length) {
      const { error: linkError } = await supabase.from("product_collections").insert(links);
      if (linkError) throw linkError;
    }

    const { error: variantDeleteError } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId);
    if (variantDeleteError) throw variantDeleteError;

    const variants = [];
    for (const option of product.options ?? []) {
      for (const value of option.values ?? []) {
        variants.push({
          product_id: productId,
          title: value,
          options: { [option.name]: value },
          price: product.price,
          available: !product.soldOut,
        });
      }
    }
    if (variants.length) {
      const { error: variantError } = await supabase.from("product_variants").insert(variants);
      if (variantError) throw variantError;
    }
  }
}

async function seedArticles() {
  console.log(`→ articles (${catalog.articles.length})`);
  for (const article of catalog.articles) {
    const { error } = await supabase.from("articles").upsert(
      {
        handle: article.handle,
        title: article.title,
        excerpt: article.excerpt ?? "",
        image: article.image ?? "",
        date: article.date ?? null,
        author: article.author ?? "Roman Beauty",
        content: article.content ?? "",
      },
      { onConflict: "handle" }
    );
    if (error) throw new Error(`article ${article.handle}: ${error.message}`);
  }
}

async function main() {
  console.log(`\nSeeding ${url}\n`);
  const collectionIds = await seedCollections();
  await seedProducts(collectionIds);
  await seedArticles();
  console.log("\nDone. Refreshing the storefront will now read from Supabase.\n");
}

main().catch((error) => {
  console.error("\nSeed failed:", error.message, "\n");
  process.exit(1);
});
