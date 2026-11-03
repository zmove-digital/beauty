"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate, money } from "@/lib/format";

type SavedOrder = {
  orderNumber: string;
  email: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt?: string;
  status?: string;
  persisted?: boolean;
};

const ORDERS_KEY = "youmi.orders.v1";

export function AccountPanel({ mode = "login" }: { mode?: "login" | "register" }) {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      setOrders(raw ? (JSON.parse(raw) as SavedOrder[]) : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-hero">
          <span className="eyebrow">{mode === "register" ? "Join Youmi" : "Welcome back"}</span>
          <h1 className="h2">{mode === "register" ? "Create your account" : "Your account"}</h1>
          <p style={{ maxWidth: "38rem", lineHeight: 1.6, opacity: 0.75 }}>
            Sign in to follow your orders, save your favourite pieces and check out faster.
          </p>
        </div>

        <div className="account-layout">
          <div className="account-card">
            <h2>{mode === "register" ? "Create an account" : "Sign in"}</h2>
            <p>
              {mode === "register"
                ? "Create a Youmi account to keep your details and order history together."
                : "Use the email you ordered with to see your order history on this device."}
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              {mode === "register" && (
                <>
                  <div className="field">
                    <label htmlFor="account-name">Full name</label>
                    <input id="account-name" name="name" type="text" autoComplete="name" required />
                  </div>
                  <div className="field">
                    <label htmlFor="account-phone">Phone / WhatsApp</label>
                    <input id="account-phone" name="phone" type="tel" autoComplete="tel" />
                  </div>
                </>
              )}
              <div className="field">
                <label htmlFor="account-email">Email address</label>
                <input id="account-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="field">
                <label htmlFor="account-password">Password</label>
                <input
                  id="account-password"
                  name="password"
                  type="password"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  required
                />
              </div>
              <button type="submit" className="btn btn--primary">
                {mode === "register" ? "Create account" : "Sign in"}
              </button>
            </form>

            {submitted && (
              <p className="form-message" role="status">
                Accounts are not connected in this preview. Your orders placed on this device appear
                below. Need help? Message us on WhatsApp and our team will find your order.
              </p>
            )}

            <ul className="account-links">
              <li>
                {mode === "register" ? (
                  <Link href="/account">Already have an account? Sign in</Link>
                ) : (
                  <Link href="/account?mode=register">New to Youmi? Create an account</Link>
                )}
              </li>
              <li>
                <a href="https://wa.me/+971522888834" target="_blank" rel="noopener noreferrer">
                  Track an order on WhatsApp
                </a>
              </li>
              <li>
                <Link href="/wishlist">View your wishlist</Link>
              </li>
            </ul>
          </div>

          <div className="account-card" id="orders">
            <h2>Order history</h2>
            <p>
              Orders placed in this browser are listed here. For orders placed on another device,
              contact our team with your order number.
            </p>

            {loading ? (
              <p>Loading orders…</p>
            ) : orders.length === 0 ? (
              <p>No orders yet. When you place an order it will appear here.</p>
            ) : (
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderNumber}>
                      <td>{order.orderNumber}</td>
                      <td>{order.createdAt ? formatDate(order.createdAt) : "—"}</td>
                      <td>{money(order.total)}</td>
                      <td>
                        <span className="order-status">{order.status ?? "pending"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
