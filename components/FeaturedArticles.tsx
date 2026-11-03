"use client";

import Link from "next/link";
import { useState } from "react";
import type { Article } from "@/lib/types";

export function FeaturedArticles({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState(0);
  if (!articles.length) return null;

  return (
    <section className="featured-posts section-x-padding section-light">
      <h1 className="container sidebar-space h2 featured-posts__title">Featured Articles</h1>

      <div className="articles-wrapper sidebar-space">
        <div className="article-track">
          {articles.map((article, index) => (
            <article
              className={`article-slide ${index === active ? "is-active" : ""}`}
              data-slide={index}
              key={article.handle}
              aria-hidden={index !== active}
            >
              <div className="article-pin-card">
                <div className="image-wrap">
                  <Link
                    href={`/blogs/organization-blog/${article.handle}`}
                    className="image-item"
                    tabIndex={index === active ? 0 : -1}
                  >
                    <div className="cropped-image-wrapper cropped-image--square">
                      <img src={article.image} alt={article.title} loading="lazy" />
                    </div>
                  </Link>
                </div>

                <div className="text-wrap">
                  <div className="featured-post-count">
                    {articles.map((item, counterIndex) => (
                      <button
                        type="button"
                        key={item.handle}
                        className={`counter-item ${counterIndex === active ? "active-counter" : ""}`}
                        data-index={counterIndex}
                        onClick={() => setActive(counterIndex)}
                        aria-label={`Show article ${counterIndex + 1}: ${item.title}`}
                      >
                        {String(counterIndex + 1).padStart(2, "0")}
                      </button>
                    ))}
                  </div>

                  <Link
                    href={`/blogs/organization-blog/${article.handle}`}
                    className="text-item"
                    tabIndex={index === active ? 0 : -1}
                  >
                    <h2 className="article-title h3">{article.title}</h2>
                    <span className="hide-tablet hide-mobile hide-tablet-landscape">
                      <span className="article-excerpt">{article.excerpt}</span>
                    </span>
                    <span className="btn-wrapper">
                      <span className="btn--animation hover-underline">Explore</span>
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="container sidebar-space end-link">
        <Link className="btn--animation hover-underline" href="/blogs/organization-blog">
          All Features
        </Link>
      </div>
    </section>
  );
}
