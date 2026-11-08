import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllArticles } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "The Journal",
  description:
    "Styling notes, extension care and lens guides from the Roman Beauty team in Dubai.",
  alternates: { canonical: "/blogs/organization-blog" },
};

export default async function BlogIndexPage() {
  const articles = await getAllArticles();

  return (
    <div className="sidebar-space">
      <div className="blog-page template-page">
        <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Journal" },
          ]}
        />

        <div className="hero-info">
          <span className="eyebrow">The Roman Beauty Journal</span>
          <h1 className="h2">Notes on hair, lenses and rituals</h1>
          <p>
            Practical guides from our Dubai studio — how to choose extensions, care for coloured
            lenses and build a routine that fits real life.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="collection-empty">
            <p>New stories are on their way. Check back soon.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {articles.map((article) => (
              <article className="article-card" key={article.handle}>
                <div className="article-card__media">
                  <Link href={`/blogs/organization-blog/${article.handle}`} aria-label={article.title}>
                    <img src={article.image} alt={article.title} loading="lazy" />
                  </Link>
                </div>
                <div className="article-card__content">
                  <div className="article-card__meta">
                    <span>{formatDate(article.date)}</span>
                    <span aria-hidden>·</span>
                    <span>{article.author}</span>
                  </div>
                  <h2 className="article-card__title">
                    <Link href={`/blogs/organization-blog/${article.handle}`}>{article.title}</Link>
                  </h2>
                  <p className="article-card__excerpt">{article.excerpt}</p>
                  <div className="article-card__footer">
                    <Link
                      href={`/blogs/organization-blog/${article.handle}`}
                      className="article-card__link"
                    >
                      Read the story
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
