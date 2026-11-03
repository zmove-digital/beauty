"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { IconArrowRight, IconChevronLeft, IconChevronRight } from "./icons";
import { ProductCard } from "./ProductCard";

export type CarouselCollection = {
  handle: string;
  title: string;
  products: Product[];
};

export function ProductTabsCarousel({
  collections,
  className = "",
  tabLabel,
}: {
  collections: CarouselCollection[];
  className?: string;
  tabLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const current = collections[active] ?? collections[0];
  const products = useMemo(() => current?.products ?? [], [current]);

  function scroll(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    const step = Math.max(320, track.clientWidth * 0.55);
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  if (!current) return null;

  return (
    <section className={`product-tabs-carousel section-light ${className}`.trim()}>
      <div className="product-carousel">
        <h2 className="container hide-desktop hide-large-screens h3 section-mobile-title">
          <Link className="h3" href={`/collections/${current.handle}`}>
            {current.title}
          </Link>
        </h2>

        <div className="swiper-container-filter">
          <div className="swiper-wrapper">
            {collections.map((collection, index) => (
              <div
                key={collection.handle}
                className={`related-product-caps swiper-slide ${index === active ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="js-slider-filter"
                  data-filter={collection.handle}
                  onClick={() => setActive(index)}
                >
                  {tabLabel && index === 0 ? tabLabel : collection.title}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="swiper-container-product">
          <div className="carousel-lead" aria-hidden={false}>
            <div className="collection-lead-info">
              <h2 className="h3">
                <Link className="h3" href={`/collections/${current.handle}`}>
                  <span className="info-title">{current.title}</span>
                </Link>
              </h2>
              <Link href={`/collections/${current.handle}`} className="btn btn-arrow">
                SHOP NOW
                <span className="icon">
                  <IconArrowRight />
                </span>
              </Link>
            </div>
          </div>

          <div className="product-slider" ref={trackRef}>
            {products.map((product) => (
              <div className="product-slide" key={`${current.handle}-${product.handle}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="carousel-controls">
            <button type="button" onClick={() => scroll(-1)} aria-label="Scroll products left">
              <IconChevronLeft />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label="Scroll products right">
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
