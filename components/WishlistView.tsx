"use client";

import Link from "next/link";
import { money } from "@/lib/format";
import { IconClose } from "./icons";
import { useStore } from "./providers";

export function WishlistView() {
  const { hydrated, wishlist, toggleWishlist } = useStore();

  if (!hydrated) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <p>Loading your wishlist…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <span className="eyebrow">Saved for later</span>
        <h1 className="h2">Your wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <p>
              Nothing saved yet. Tap the heart on any product to keep it here while you decide — your
              list stays on this device.
            </p>
            <Link href="/collections/best-sellers" className="btn btn--primary">
              Browse best sellers
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <article className="product-card" key={item.handle}>
                <div className="image-wrap">
                  <button
                    type="button"
                    className="product-card__wishlist-btn is-active"
                    onClick={() => toggleWishlist(item)}
                    aria-label={`Remove ${item.title} from wishlist`}
                  >
                    <IconClose />
                  </button>
                  <Link href={`/products/${item.handle}`} aria-label={item.title}>
                    <div className="cropped-image-wrapper cropped-image--portrait is-hover-zoom-out">
                      <img src={item.image} alt={item.title} className="product-card__image" loading="lazy" />
                    </div>
                  </Link>
                  <div className="cart-button-wrapper">
                    <Link href={`/products/${item.handle}`} className="add-to-cart-btn">
                      View product
                    </Link>
                  </div>
                </div>
                <div className="product-card-info">
                  <div className="split-aligner">
                    <span className="title">
                      <Link href={`/products/${item.handle}`}>{item.title}</Link>
                    </span>
                    <span className="price price--main">{money(item.price)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
