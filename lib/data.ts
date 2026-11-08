import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import {
  articles as fallbackArticles,
  catalogProductsByCollection,
  collections as fallbackCollections,
  getCatalogArticle,
  getCatalogCollection,
  getCatalogProduct,
  products as fallbackProducts,
  searchCatalog,
} from "./catalog";
import { readSupabaseConfig } from "./supabase-env";
import type { Article, Collection, Product } from "./types";

const supabaseConfig = readSupabaseConfig();

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseConfig?.anonKey);
}

let cachedClient: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!supabaseConfig?.anonKey) return null;
  if (!cachedClient) {
    cachedClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}

type Row = Record<string, any>;

function mapProduct(row: Row): Product {
  const imageRows: Row[] = Array.isArray(row.product_images) ? row.product_images : [];
  const collectionRows: Row[] = Array.isArray(row.product_collections) ? row.product_collections : [];

  return {
    handle: row.handle,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    price: Number(row.price ?? 0),
    compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    category: row.category ?? "",
    badge: row.badge ?? null,
    soldOut: Boolean(row.sold_out),
    featured: Boolean(row.featured),
    images: imageRows
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((image) => ({ src: image.src, alt: image.alt ?? row.title }))
      .filter((image) => Boolean(image.src)),
    collections: collectionRows
      .map((pc) => {
        const relation = pc.collections;
        if (Array.isArray(relation)) return relation[0]?.handle;
        return relation?.handle;
      })
      .filter(Boolean) as string[],
    options: Array.isArray(row.options) ? row.options : [],
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    description: row.description ?? "",
    details: Array.isArray(row.details) ? row.details : [],
    position: row.position ?? 0,
  };
}

function mapCollection(row: Row): Collection {
  return {
    handle: row.handle,
    title: row.title,
    description: row.description ?? "",
    image: row.image ?? null,
    position: row.position ?? 0,
  };
}

function mapArticle(row: Row): Article {
  return {
    handle: row.handle,
    title: row.title,
    excerpt: row.excerpt ?? "",
    image: row.image ?? "",
    date: row.date ?? row.created_at ?? "",
    author: row.author ?? "Roman Beauty",
    content: row.content ?? "",
  };
}

export const getAllProducts = cache(async (): Promise<Product[]> => {
  const supabase = getClient();
  if (!supabase) return fallbackProducts;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(src,alt,position), product_collections(collections(handle))")
      .order("position", { ascending: true });

    if (error || !data?.length) {
      if (error) console.warn("[supabase] products fallback:", error.message);
      return fallbackProducts;
    }
    return (data as Row[]).map(mapProduct);
  } catch (error) {
    console.warn("[supabase] products fallback:", error);
    return fallbackProducts;
  }
});

export const getAllCollections = cache(async (): Promise<Collection[]> => {
  const supabase = getClient();
  if (!supabase) return fallbackCollections;

  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("position", { ascending: true });

    if (error || !data?.length) {
      if (error) console.warn("[supabase] collections fallback:", error.message);
      return fallbackCollections;
    }
    return (data as Row[]).map(mapCollection);
  } catch (error) {
    console.warn("[supabase] collections fallback:", error);
    return fallbackCollections;
  }
});

export const getProductByHandle = cache(async (handle: string): Promise<Product | undefined> => {
  const all = await getAllProducts();
  return all.find((product) => product.handle === handle) ?? getCatalogProduct(handle);
});

export const getCollectionByHandle = cache(async (handle: string): Promise<Collection | undefined> => {
  const all = await getAllCollections();
  return all.find((collection) => collection.handle === handle) ?? getCatalogCollection(handle);
});

export const getCollectionProducts = cache(async (handle: string): Promise<Product[]> => {
  const all = await getAllProducts();
  const fromSupabase = all.filter((product) => product.collections.includes(handle));
  if (fromSupabase.length) return fromSupabase;
  return catalogProductsByCollection(handle);
});

export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  const all = await getAllProducts();
  return all.filter((product) => product.featured);
});

export const getAllArticles = cache(async (): Promise<Article[]> => {
  const supabase = getClient();
  if (!supabase) return fallbackArticles;

  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("date", { ascending: false });

    if (error || !data?.length) {
      if (error) console.warn("[supabase] articles fallback:", error.message);
      return fallbackArticles;
    }
    return (data as Row[]).map(mapArticle);
  } catch (error) {
    console.warn("[supabase] articles fallback:", error);
    return fallbackArticles;
  }
});

export const getArticleByHandle = cache(async (handle: string): Promise<Article | undefined> => {
  const all = await getAllArticles();
  return all.find((article) => article.handle === handle) ?? getCatalogArticle(handle);
});

export const searchProducts = cache(async (query: string): Promise<Product[]> => {
  const all = await getAllProducts();
  const term = query.trim().toLowerCase();
  if (!term) return [];
  const words = term.split(/\s+/);
  const results = all.filter((product) => {
    const haystack = [
      product.title,
      product.subtitle,
      product.category,
      ...product.collections,
      ...product.images.map((image) => image.alt),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
  return results.length || isSupabaseConfigured() ? results : searchCatalog(query);
});
