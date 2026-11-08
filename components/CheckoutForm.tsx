"use client";

import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/format";
import { readStorageMigrated } from "@/lib/browser-storage";
import { useStore } from "./providers";

type CheckoutResult = {
  orderNumber: string;
  subtotal: number;
  shipping: number;
  total: number;
  persisted: boolean;
};

type SavedOrder = CheckoutResult & {
  email: string;
  createdAt: string;
  status: string;
};

const ORDERS_KEY = "roman.orders.v1";
const LEGACY_ORDERS_KEY = "youmi.orders.v1";
const FREE_SHIPPING_THRESHOLD = 300;
const SHIPPING_FEE = 25;

const initialForm = {
  email: "",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  country: "United Arab Emirates",
  postalCode: "",
  notes: "",
};

export function CheckoutForm() {
  const { hydrated, cart, subtotal, clearCart } = useStore();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<CheckoutResult | null>(null);

  if (!hydrated) {
    return (
      <div className="checkout-page">
        <div className="checkout-layout">
          <p>Preparing checkout…</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="checkout-success">
        <span className="eyebrow">Order confirmed</span>
        <h1 className="h2">Thank you, {form.fullName.split(" ")[0] || "beautiful"}.</h1>
        <p>
          {result.persisted
            ? "We have received your order and sent a confirmation to your inbox."
            : "This is a preview checkout, so no payment was taken and no order was stored in a database."}
        </p>
        <span className="order-number">{result.orderNumber}</span>
        <p>
          Total: <strong>{money(result.total)}</strong> · Shipping:{" "}
          {result.shipping === 0 ? "Complimentary" : money(result.shipping)}
        </p>
        <p>
          A member of our Dubai team will confirm availability and payment details within one business
          day.
        </p>
        <Link href="/collections/best-sellers" className="btn btn--primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h1 className="h2">Your bag is empty</h1>
          <p>Add a piece to your bag before checking out.</p>
          <Link href="/collections/best-sellers" className="btn btn--primary">
            Shop best sellers
          </Link>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  function update(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          address: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            country: form.country,
            postalCode: form.postalCode,
          },
          items: cart.map((line) => ({
            handle: line.handle,
            quantity: line.quantity,
            variant: line.variant ?? null,
          })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "We could not place your order.");

      const saved: SavedOrder = {
        orderNumber: payload.orderNumber,
        subtotal: payload.subtotal,
        shipping: payload.shipping,
        total: payload.total,
        persisted: Boolean(payload.persisted),
        email: form.email,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      try {
        const stored = readStorageMigrated(ORDERS_KEY, LEGACY_ORDERS_KEY);
        const orders = stored ? (JSON.parse(stored) as SavedOrder[]) : [];
        window.localStorage.setItem(ORDERS_KEY, JSON.stringify([saved, ...orders].slice(0, 20)));
      } catch {
        // Order history is a convenience; checkout still succeeds.
      }

      clearCart();
      setResult({
        orderNumber: payload.orderNumber,
        subtotal: payload.subtotal,
        shipping: payload.shipping,
        total: payload.total,
        persisted: Boolean(payload.persisted),
      });
    } catch (error) {
      setStatus("error");
      setMessage((error as Error).message);
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={onSubmit}>
          <div className="checkout-block">
            <h2>Contact</h2>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="checkout-email">Email address</label>
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="checkout-phone">Phone / WhatsApp</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="checkout-block">
            <h2>Delivery</h2>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="checkout-name">Full name</label>
                <input
                  id="checkout-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.fullName}
                  onChange={(event) => update("fullName", event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="checkout-line1">Address</label>
                <input
                  id="checkout-line1"
                  type="text"
                  autoComplete="address-line1"
                  required
                  value={form.line1}
                  onChange={(event) => update("line1", event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="checkout-line2">Apartment, suite (optional)</label>
                <input
                  id="checkout-line2"
                  type="text"
                  autoComplete="address-line2"
                  value={form.line2}
                  onChange={(event) => update("line2", event.target.value)}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="checkout-city">City</label>
                  <input
                    id="checkout-city"
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="checkout-postal">Postal code (optional)</label>
                  <input
                    id="checkout-postal"
                    type="text"
                    autoComplete="postal-code"
                    value={form.postalCode}
                    onChange={(event) => update("postalCode", event.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="checkout-country">Country</label>
                <select
                  id="checkout-country"
                  autoComplete="country-name"
                  value={form.country}
                  onChange={(event) => update("country", event.target.value)}
                >
                  <option>United Arab Emirates</option>
                  <option>Saudi Arabia</option>
                  <option>Kuwait</option>
                  <option>Qatar</option>
                  <option>Bahrain</option>
                  <option>Oman</option>
                  <option>United Kingdom</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="checkout-notes">Order notes (optional)</label>
                <textarea
                  id="checkout-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                />
              </div>
            </div>
          </div>

          <p className="checkout-note">
            By placing your order you agree to our{" "}
            <Link href="/policies/refund-policy">Refund Policy</Link> and{" "}
            <Link href="/policies/shipping-policy">Shipping Policy</Link>. Payment is confirmed by our
            team after the order is reviewed.
          </p>

          {message && (
            <p className="form-message is-error" role="alert">
              {message}
            </p>
          )}

          <button type="submit" className="checkout-pay" disabled={status === "loading"}>
            {status === "loading" ? "Placing order…" : "Place order"}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Your order</h2>
          {cart.map((line) => (
            <div className="checkout-line" key={line.key}>
              <img src={line.image} alt={line.title} />
              <div className="checkout-line__info">
                <div className="checkout-line__title">{line.title}</div>
                <div className="checkout-line__meta">
                  {line.variant ? `${line.variant} · ` : ""}Qty {line.quantity}
                </div>
              </div>
              <span>{money(line.price * line.quantity)}</span>
            </div>
          ))}
          <div className="checkout-total-row">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="checkout-total-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Complimentary" : money(shipping)}</span>
          </div>
          <div className="checkout-total-row grand">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
          <p className="checkout-note">
            All prices are in UAE Dirham (AED). Duties outside the UAE may be charged on delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}
