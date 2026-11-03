"use client";

import Link from "next/link";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";
import { IconWishlist } from "./icons";
import { useStore } from "./providers";

export function ProductCard({ product, className = "" }: { product: Product; className?: string }) {
  const { addLine, toggleWishlist, isWished } = useStore();
  const wished = isWished(product.handle);
  const primary = product.images[0];
  const hover = product.images[1];
  const hasOptions = (product.options?.length ?? 0) > 0;

  function addToBag() {
    if (!primary) return;
    addLine({
      handle: product.handle,
      title: product.title,
      price: product.price,
      image: primary.src,
      quantity: 1,
    });
  }

  return (
    <article className={`product-card ${className}`}>
      <div className="image-wrap">
        {(product.badge || product.soldOut) && (
          <div className="product-badges-wrapper">
            <span className="badge">{product.badge ?? "Sold Out"}</span>
          </div>
        )}

        <button
          type="button"
          className={`product-card__wishlist-btn ${wished ? "is-active" : ""}`}
          aria-label={`${wished ? "Remove" : "Add"} ${product.title} ${wished ? "from" : "to"} wishlist`}
          aria-pressed={wished}
          onClick={() =>
            primary &&
            toggleWishlist({
              handle: product.handle,
              title: product.title,
              price: product.price,
              image: primary.src,
            })
          }
        >
          <IconWishlist />
        </button>

        <Link href={`/products/${product.handle}`} aria-label={product.title}>
          <div className="cropped-image-wrapper cropped-image--portrait is-hover-zoom-out">
            {primary && <img src={primary.src} alt={primary.alt} className="product-card__image" loading="lazy" />}
            {hover && <img src={hover.src} alt={hover.alt} className="hover-img" loading="lazy" />}
          </div>
        </Link>

        <div className="cart-button-wrapper">
          {product.soldOut ? (
            <button type="button" className="add-to-cart-btn" disabled>
              Out of stock
            </button>
          ) : hasOptions ? (
            <Link href={`/products/${product.handle}`} className="add-to-cart-btn">
              Make Selection
            </Link>
          ) : (
            <button type="button" className="add-to-cart-btn" onClick={addToBag}>
              Add to Bag
            </button>
          )}
        </div>
      </div>

      <div className="product-card-info">
        <div className="split-aligner">
          <span className="title">
            <Link href={`/products/${product.handle}`}>{product.title}</Link>
          </span>
          <div className="product-card-price-wrap">
            <div className="product-card-price-group">
              <span className="price price--main">{money(product.price)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
