"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { IconMinus, IconPlus, IconWishlist } from "./icons";
import { useStore } from "./providers";

export function ProductPurchase({ product }: { product: Product }) {
  const router = useRouter();
  const { addLine, toggleWishlist, isWished, closeDrawer } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    (product.options ?? []).forEach((option) => {
      initial[option.name] = option.values[0] ?? "";
    });
    return initial;
  });

  const wished = isWished(product.handle);
  const image = product.images[0]?.src ?? "/images/POST4.png";
  const chosenValues = useMemo(
    () =>
      (product.options ?? [])
        .map((option) => selections[option.name])
        .filter((value): value is string => Boolean(value)),
    [product.options, selections],
  );
  const variant = chosenValues.length ? chosenValues.join(" · ") : undefined;

  function addToBag(redirectToCheckout = false) {
    if (product.soldOut) return;
    addLine({
      handle: product.handle,
      title: product.title,
      price: product.price,
      image,
      quantity,
      variant,
    });
    if (redirectToCheckout) {
      closeDrawer();
      router.push("/checkout");
    }
  }

  function toggleWishlistItem() {
    toggleWishlist({
      handle: product.handle,
      title: product.title,
      price: product.price,
      image,
    });
  }

  return (
    <div className="product-form">
      {(product.options ?? []).length > 0 && (
        <div className="main-product-variant-selector">
          {product.options.map((option) => (
            <fieldset className="variant-group" key={option.name}>
              <legend>
                <span>{option.name}</span>
                <span className="selected-value">{selections[option.name]}</span>
              </legend>
              <div className="variant-buttons">
                {option.values.map((value) => (
                  <label className="variant-btn" key={value}>
                    <input
                      type="radio"
                      name={`option-${option.name}`}
                      value={value}
                      checked={selections[option.name] === value}
                      onChange={() =>
                        setSelections((current) => ({ ...current, [option.name]: value }))
                      }
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      <div className="qty-cart-btn-wrap">
        <div className="quantity-buttons">
          <button
            type="button"
            className="qty-btn"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
          >
            <IconMinus />
          </button>
          <input
            className="qty-input"
            type="number"
            min={1}
            max={20}
            value={quantity}
            readOnly
            aria-label="Quantity"
          />
          <button
            type="button"
            className="qty-btn"
            onClick={() => setQuantity((current) => Math.min(20, current + 1))}
            aria-label="Increase quantity"
          >
            <IconPlus />
          </button>
        </div>

        <button
          type="button"
          className="btn-add-to-cart"
          onClick={() => addToBag(false)}
          disabled={product.soldOut}
        >
          {product.soldOut ? "Sold out" : "Add to bag"}
        </button>
      </div>

      {!product.soldOut ? (
        <button type="button" className="btn-buy-now" onClick={() => addToBag(true)}>
          Buy it now
        </button>
      ) : (
        <p className="product-form-note">
          This piece is being restocked. Message us on WhatsApp and we will let you know as soon as it
          returns.
        </p>
      )}

      <button
        type="button"
        className={`product-wishlist-link ${wished ? "is-active" : ""}`}
        onClick={toggleWishlistItem}
        aria-pressed={wished}
      >
        <IconWishlist />
        <span>{wished ? "Saved to wishlist" : "Save to wishlist"}</span>
      </button>

      <p className="product-form-note">
        Complimentary shipping over Dhs. 300 · Dispatched from Dubai · Duties calculated at checkout.
      </p>
    </div>
  );
}
