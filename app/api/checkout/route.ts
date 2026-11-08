import { NextResponse } from "next/server";
import { getProductByHandle } from "@/lib/data";
import { getAdminClient } from "@/lib/supabase-admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHIPPING_THRESHOLD = 300;
const SHIPPING_FEE = 25;

type CheckoutItem = {
  handle?: unknown;
  quantity?: unknown;
  variant?: unknown;
};

type CheckoutPayload = {
  email?: unknown;
  fullName?: unknown;
  phone?: unknown;
  address?: {
    line1?: unknown;
    line2?: unknown;
    city?: unknown;
    country?: unknown;
    postalCode?: unknown;
  };
  notes?: unknown;
  items?: unknown;
};

function makeOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `RB-${stamp}-${random}`;
}

export async function POST(request: Request) {
  let payload: CheckoutPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const notes = typeof payload.notes === "string" ? payload.notes.trim() : "";
  const address = payload.address ?? {};
  const line1 = typeof address.line1 === "string" ? address.line1.trim() : "";
  const line2 = typeof address.line2 === "string" ? address.line2.trim() : "";
  const city = typeof address.city === "string" ? address.city.trim() : "";
  const country = typeof address.country === "string" ? address.country.trim() : "";
  const postalCode = typeof address.postalCode === "string" ? address.postalCode.trim() : "";

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (fullName.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 6) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }
  if (!line1 || !city || !country) {
    return NextResponse.json({ error: "Please complete the delivery address." }, { status: 400 });
  }

  const rawItems = Array.isArray(payload.items) ? (payload.items as CheckoutItem[]) : [];
  if (!rawItems.length) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }

  const lines: {
    handle: string;
    title: string;
    variant: string | null;
    unitPrice: number;
    quantity: number;
    image: string | null;
  }[] = [];

  for (const rawItem of rawItems) {
    const handle = typeof rawItem.handle === "string" ? rawItem.handle : "";
    const quantity = Number(rawItem.quantity);
    const variant = typeof rawItem.variant === "string" ? rawItem.variant : null;

    if (!handle || !Number.isFinite(quantity)) {
      return NextResponse.json({ error: "One of the items in your bag is invalid." }, { status: 400 });
    }

    const safeQuantity = Math.min(20, Math.max(1, Math.trunc(quantity)));
    const product = await getProductByHandle(handle);

    if (!product) {
      return NextResponse.json(
        { error: `We could not find “${handle}” in the current collection.` },
        { status: 400 },
      );
    }

    lines.push({
      handle: product.handle,
      title: product.title,
      variant,
      unitPrice: product.price,
      quantity: safeQuantity,
      image: product.images[0]?.src ?? null,
    });
  }

  const subtotal = lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const orderNumber = makeOrderNumber();

  const admin = getAdminClient();
  let persisted = false;

  if (admin) {
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        email,
        full_name: fullName,
        phone,
        address: { line1, line2, city, country, postalCode },
        subtotal,
        shipping,
        total,
        currency: "AED",
        status: "pending",
        notes,
      })
      .select("id")
      .single();

    if (orderError) {
      console.warn("[api/checkout] Supabase order insert failed:", orderError.message);
    } else {
      const { error: itemsError } = await admin.from("order_items").insert(
        lines.map((line) => ({
          order_id: order.id,
          handle: line.handle,
          title: line.title,
          variant: line.variant,
          unit_price: line.unitPrice,
          quantity: line.quantity,
          image: line.image,
        })),
      );

      if (itemsError) {
        console.warn("[api/checkout] Supabase order items insert failed:", itemsError.message);
      } else {
        persisted = true;
      }
    }
  }

  return NextResponse.json({
    orderNumber,
    subtotal,
    shipping,
    total,
    currency: "AED",
    persisted,
  });
}
