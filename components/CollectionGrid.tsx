"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

type SortKey = "featured" | "price-asc" | "price-desc" | "title";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title", label: "Alphabetical" },
];

const PAGE_SIZE = 12;

export function CollectionGrid({
  products,
  emptyMessage = "This collection is being restocked. Please check back soon.",
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const sorted = useMemo(() => {
    const copy = products.slice();
    switch (sort) {
      case "price-asc":
        return copy.sort((a, b) => a.price - b.price);
      case "price-desc":
        return copy.sort((a, b) => b.price - a.price);
      case "title":
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case "featured":
      default:
        return copy.sort((a, b) => {
          const featured = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
          if (featured !== 0) return featured;
          return (a.position ?? 0) - (b.position ?? 0);
        });
    }
  }, [products, sort]);

  const shown = sorted.slice(0, visible);

  return (
    <>
      <div className="collection-toolbar container">
        <span className="collection-count">
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
        <div className="collection-toolbar__actions">
          <label className="visually-hidden" htmlFor="collection-sort">
            Sort products
          </label>
          <select
            id="collection-sort"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as SortKey);
              setVisible(PAGE_SIZE);
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="collection-empty container">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="collection-grid">
          {shown.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      )}

      {visible < sorted.length && (
        <div className="collection-load-more">
          <button type="button" className="btn" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
            Load more
          </button>
          <span className="collection-load-more__count">
            Showing {shown.length} of {sorted.length}
          </span>
        </div>
      )}
    </>
  );
}
