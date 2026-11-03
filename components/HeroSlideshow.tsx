"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowRight } from "./icons";

const slides = [
  {
    image: "/images/ICONIC_HAIR_DRYER.jpg",
    alt: "Youmi Beauty GlamDry hair dryer",
    background: "#f3e3d3",
    heading: "YB GlamDry",
    href: "/products/youmi-beauty-glamdry",
    cta: "SHOP NOW",
  },
  {
    image: "/images/youmi_beauty_clip_in_hair_extensions_best_in_Dubai.jpg",
    alt: "Youmi Beauty clip-in hair extensions",
    background: "#ece2d8",
    heading: "Clip in. Go longer.",
    href: "/collections/hair-clip-in-extensions",
    cta: "SHOP CLIP-INS",
  },
  {
    image: "/images/BodyScrubYoumiBeauty.png",
    alt: "Youmi Beauty body care ritual",
    background: "#efe4db",
    heading: "Body Rituals",
    href: "/collections/body-care",
    cta: "SHOP BODY CARE",
  },
];

export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  const go = useCallback((direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timer.current = window.setInterval(() => go(1), 6000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [go, paused]);

  return (
    <section className="hero-slideshow" aria-label="Featured collections">
      <header
        className="sidebar-slideshow js-animate-on-load"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="sidebar-image">
          <div className="sidebar-image-wrapper">
            <img
              src="/images/Youmi_beauty_Body_care_Bundle.png"
              alt="Youmi Beauty body care"
              width={928}
              height={1152}
            />
          </div>
        </div>

        <div className="swiper-container-hero">
          <div className="hero-track">
            {slides.map((slide, index) => (
              <div
                key={slide.heading}
                className={`hero-slide ${index === active ? "is-active" : ""}`}
                style={{ backgroundColor: slide.background }}
                aria-hidden={index !== active}
              >
                <div className="media-wrapper">
                  <img src={slide.image} alt={slide.alt} loading={index === 0 ? "eager" : "lazy"} />
                </div>
                <span className="overlay-bg" />
                <div className="text-content text-content--bottom-left">
                  <div className="inner-content">
                    <h2 className="hero-slideshow-heading hd-2">{slide.heading}</h2>
                    <Link href={slide.href} className="btn btn-arrow">
                      <span>{slide.cta}</span>
                      <span className="icon">
                        <IconArrowRight />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="swiper-nav-wrapper">
          <button type="button" className="swiper-prev-text" aria-label="Previous slide" onClick={() => go(-1)}>
            <span className="inner-text h5">Previous</span>
          </button>
          <button type="button" className="swiper-next-text" aria-label="Next slide" onClick={() => go(1)}>
            <span className="line" />
            <span className="inner-text h5">Next</span>
          </button>
        </div>

        <div className="hero-dots" aria-hidden>
          {slides.map((slide, index) => (
            <button
              key={slide.heading}
              type="button"
              className={index === active ? "is-active" : ""}
              onClick={() => setActive(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </header>
    </section>
  );
}
