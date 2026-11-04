import { getAdminClient } from "./supabase-admin";

type Row = Record<string, any>;

export type AdminImage = { src: string; alt: string };
export type AdminOption = { name: string; values: string[] };
export type AdminDetail = { title: string; content: string };

export type AdminProduct = {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  badge: string;
  soldOut: boolean;
  featured: boolean;
  description: string;
  options: AdminOption[];
  details: AdminDetail[];
  metadata: Record<string, string>;
  position: number;
  images: AdminImage[];
  collections: string[];
};

export type AdminCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: string;
  position: number;
};

export type AdminArticle = {
  id: string;
  handle: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  content: string;
};

export type AdminOrderItem = {
  id: number;
  order_id: string;
  handle: string;
  title: string;
  variant: string | null;
  unit_price: number;
  quantity: number;
  image: string | null;
};

export type AdminOrder = {
  id: string;
  order_number: string;
  email: string;
  full_name: string;
  phone: string | null;
  address: Record<string, string>;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: string;
  notes: string | null;
  created_at: string;
  items: AdminOrderItem[];
};

export type AdminSubscriber = {
  id: number;
  email: string;
  consent: boolean;
  created_at: string;
};

function mapProduct(row: Row): AdminProduct {
  const images: Row[] = Array.isArray(row.product_images) ? row.product_images : [];
  const links: Row[] = Array.isArray(row.product_collections) ? row.product_collections : [];

  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    subtitle: row.subtitle ?? "",
    price: Number(row.price ?? 0),
    compareAtPrice: row.compare_at_price === null || row.compare_at_price === undefined ? null : Number(row.compare_at_price),
    category: row.category ?? "",
    badge: row.badge ?? "",
    soldOut: Boolean(row.sold_out),
    featured: Boolean(row.featured),
    description: row.description ?? "",
    options: Array.isArray(row.options) ? (row.options as AdminOption[]) : [],
    details: Array.isArray(row.details) ? (row.details as AdminDetail[]) : [],
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, string>)
        : {},
    position: Number(row.position ?? 0),
    images: images
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((image) => ({ src: image.src, alt: image.alt ?? "" })),
    collections: links
      .map((link) => {
        const relation = link.collections;
        if (Array.isArray(relation)) return relation[0]?.handle;
        return relation?.handle;
      })
      .filter(Boolean) as string[],
  };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("products")
    .select("*, product_images(src,alt,position), product_collections(collections(handle))")
    .order("position", { ascending: true });

  if (error) {
    console.warn("[admin] products:", error.message);
    return [];
  }
  return (data as Row[]).map(mapProduct);
}

export async function getAdminProduct(handle: string): Promise<AdminProduct | null> {
  const admin = getAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("products")
    .select("*, product_images(src,alt,position), product_collections(collections(handle))")
    .eq("handle", handle)
    .maybeSingle();

  if (error) {
    console.warn("[admin] product:", error.message);
    return null;
  }
  return data ? mapProduct(data as Row) : null;
}

export async function getAdminCollections(): Promise<AdminCollection[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const { data, error } = await admin.from("collections").select("*").order("position", { ascending: true });
  if (error) {
    console.warn("[admin] collections:", error.message);
    return [];
  }
  return (data as Row[]).map((row) => ({
    id: row.id,
    handle: row.handle,
    title: row.title,
    description: row.description ?? "",
    image: row.image ?? "",
    position: Number(row.position ?? 0),
  }));
}

export async function getAdminArticles(): Promise<AdminArticle[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const { data, error } = await admin.from("articles").select("*").order("date", { ascending: false });
  if (error) {
    console.warn("[admin] articles:", error.message);
    return [];
  }
  return (data as Row[]).map((row) => ({
    id: row.id,
    handle: row.handle,
    title: row.title,
    excerpt: row.excerpt ?? "",
    image: row.image ?? "",
    date: row.date ?? "",
    author: row.author ?? "",
    content: row.content ?? "",
  }));
}

export async function getAdminOrders(limit = 50): Promise<AdminOrder[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[admin] orders:", error.message);
    return [];
  }

  const orders = (data as Row[]).map((row) => ({
    id: row.id,
    order_number: row.order_number,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone ?? null,
    address: (row.address ?? {}) as Record<string, string>,
    subtotal: Number(row.subtotal ?? 0),
    shipping: Number(row.shipping ?? 0),
    total: Number(row.total ?? 0),
    currency: row.currency ?? "AED",
    status: row.status ?? "pending",
    notes: row.notes ?? null,
    created_at: row.created_at,
    items: [] as AdminOrderItem[],
  }));

  if (!orders.length) return orders;

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("*")
    .in(
      "order_id",
      orders.map((order) => order.id),
    );

  if (itemsError) {
    console.warn("[admin] order items:", itemsError.message);
    return orders;
  }

  const byOrder = new Map<string, AdminOrderItem[]>();
  for (const item of items as Row[]) {
    const list = byOrder.get(item.order_id) ?? [];
    list.push({
      id: item.id,
      order_id: item.order_id,
      handle: item.handle,
      title: item.title,
      variant: item.variant ?? null,
      unit_price: Number(item.unit_price ?? 0),
      quantity: Number(item.quantity ?? 1),
      image: item.image ?? null,
    });
    byOrder.set(item.order_id, list);
  }

  return orders.map((order) => ({ ...order, items: byOrder.get(order.id) ?? [] }));
}

export async function getAdminSubscribers(): Promise<AdminSubscriber[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.warn("[admin] subscribers:", error.message);
    return [];
  }
  return (data as Row[]).map((row) => ({
    id: row.id,
    email: row.email,
    consent: Boolean(row.consent),
    created_at: row.created_at,
  }));
}

export async function getAdminCounts() {
  const admin = getAdminClient();
  if (!admin) {
    return { products: 0, collections: 0, articles: 0, orders: 0, subscribers: 0 };
  }

  const count = async (table: string) => {
    const { count: total, error } = await admin.from(table).select("id", { count: "exact", head: true });
    if (error) {
      console.warn(`[admin] count ${table}:`, error.message);
      return 0;
    }
    return total ?? 0;
  };

  const [products, collections, articles, orders, subscribers] = await Promise.all([
    count("products"),
    count("collections"),
    count("articles"),
    count("orders"),
    count("newsletter_subscribers"),
  ]);

  return { products, collections, articles, orders, subscribers };
}
