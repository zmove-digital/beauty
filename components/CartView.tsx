"use client";

import Link from "next/link";
import { money } from "@/lib/format";
import { IconMinus, IconPlus } from "./icons";
import { useStore } from "./providers";

const FREE_SHIPPING_THRESHOLD = 300;
const SHIPPING_FEE = 25;

export function CartView() {
  const { hydrated, cart, subtotal, updateQuantity, removeLine } = useStore();

  if (!hydrated) {
    return (
      <div className="cart-page">
        <div className="cart-template__inner">
          <p className="cart-empty-message">Loading your bag…</p>
        </div>
      </div>
    );
  }

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="cart-page">
      <div className="cart-template__inner cart-template">
        <div className="cart-template-left">
          <h1 className="h2">Your bag</h1>

          {cart.length === 0 ? (
            <>
              <p className="cart-empty-message">Your bag is empty — for now.</p>
              <Link href="/collections/best-sellers" className="continue-shopping">
                Shop best sellers
              </Link>
            </>
          ) : (
            <>
              <div className="cart-shipping-wrapper">
                {remaining > 0 ? (
                  <p>
                    You are {money(remaining)} away from complimentary shipping.
                  </p>
                ) : (
                  <p>Complimentary shipping unlocked.</p>
                )}
                <div className="shipping-progress">
                  <div className="shipping-progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="cart-items">
                {cart.map((line) => (
                  <div className="cart-item" key={line.key}>
                    <div className="cart-item-image">
                      <Link href={`/products/${line.handle}`}>
                        <img src={line.image} alt={line.title} />
                      </Link>
                    </div>
                    <div className="cart-item-info">
                      <div className="info-left">
                        <Link href={`/products/${line.handle}`}>{line.title}</Link>
                        {line.variant && <p>{line.variant}</p>}
                        <div className="cart-item-qty">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(line.key, line.quantity - 1)}
                            aria-label={`Decrease quantity of ${line.title}`}
                          >
                            <IconMinus />
                          </button>
                          <input
                            type="text"
                            value={line.quantity}
                            readOnly
                            aria-label={`Quantity of ${line.title}`}
                          />
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(line.key, line.quantity + 1)}
                            aria-label={`Increase quantity of ${line.title}`}
                          >
                            <IconPlus />
                          </button>
                        </div>
                      </div>
                      <div className="info-right">
                        <span className="cart-item-price">{money(line.price * line.quantity)}</span>
                        <button
                          type="button"
                          className="cart-item-remove"
                          onClick={() => removeLine(line.key)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/collections/best-sellers" className="continue-shopping">
                Continue shopping
              </Link>
            </>
          )}
        </div>

        <aside className="cart-template-right">
          <h4>Order summary</h4>
          <div className="cart-summary-row">
            <h5 className="sub-total">Subtotal</h5>
            <span>{money(subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Complimentary" : money(shipping)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
          <Link href="/checkout" className="cart-checkout-btn" aria-disabled={cart.length === 0}>
            Checkout
          </Link>
          <p className="cart-note">
            Taxes and duties calculated at checkout. Need help? Message us on WhatsApp and our Dubai
            team will assist.
          </p>
        </aside>
      </div>
    </div>
  );
}
