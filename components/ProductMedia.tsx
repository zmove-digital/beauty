"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconClose } from "./icons";
import type { ProductImage } from "@/lib/types";

export function ProductMedia({ images, title }: { images: ProductImage[]; title: string }) {
  const gallery = images.length ? images : [{ src: "/images/POST4.png", alt: title }];
  const [mobileIndex, setMobileIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const open = useCallback((index: number) => setLightboxIndex(index), []);
  const close = useCallback(() => setLightboxIndex(null), []);

  const step = useCallback(
    (direction: number) => {
      setLightboxIndex((current) => {
        if (current === null) return current;
        return (current + direction + gallery.length) % gallery.length;
      });
    },
    [gallery.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, close, step]);

  function onTrackScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    setMobileIndex(Math.min(gallery.length - 1, Math.max(0, index)));
  }

  return (
    <div className="product-media">
      <div className="product-media__desktop">
        {gallery.map((image, index) => (
          <div className="gallery-slide" key={`${image.src}-${index}`}>
            <button
              type="button"
              className="image-zoom-wrap"
              onClick={() => open(index)}
              aria-label={`Open ${title} image ${index + 1}`}
            >
              <img src={image.src} alt={image.alt || title} loading={index === 0 ? "eager" : "lazy"} />
            </button>
          </div>
        ))}
      </div>

      <div className="product-media__mobile">
        <div className="gallery-track" ref={trackRef} onScroll={onTrackScroll}>
          {gallery.map((image, index) => (
            <div className="gallery-slide" key={`${image.src}-${index}`}>
              <img src={image.src} alt={image.alt || title} loading={index === 0 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>
        <span className="gallery-count">
          {String(mobileIndex + 1).padStart(2, "0")}
          <span className="total">/ {String(gallery.length).padStart(2, "0")}</span>
        </span>
        <button
          type="button"
          className="gallery-open"
          onClick={() => open(mobileIndex)}
          aria-label="Open image gallery"
        >
          <IconSparkleGlyph />
        </button>
      </div>

      <div
        className={`media-lightbox ${lightboxIndex !== null ? "is-open" : ""}`}
        aria-hidden={lightboxIndex === null}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} image gallery`}
      >
        <button type="button" className="media-lightbox__overlay" onClick={close} aria-label="Close gallery" />
        <div className="media-lightbox__content">
          <button type="button" className="media-lightbox__close" onClick={close} aria-label="Close gallery">
            <IconClose />
          </button>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                className="media-lightbox__nav media-lightbox__nav--prev"
                onClick={() => step(-1)}
                aria-label="Previous image"
              >
                <IconChevronLeft />
              </button>
              <button
                type="button"
                className="media-lightbox__nav media-lightbox__nav--next"
                onClick={() => step(1)}
                aria-label="Next image"
              >
                <IconChevronRight />
              </button>
            </>
          )}
          {lightboxIndex !== null && (
            <>
              <img
                src={gallery[lightboxIndex].src}
                alt={gallery[lightboxIndex].alt || title}
              />
              <span className="media-lightbox__pagination">
                {lightboxIndex + 1} / {gallery.length}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function IconSparkleGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
