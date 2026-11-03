import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllArticles, getArticleByHandle } from "@/lib/data";
import { formatDate } from "@/lib/format";

type PageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ handle: article.handle }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const article = await getArticleByHandle(handle);

  if (!article) return { title: "Article not found" };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blogs/organization-blog/${article.handle}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.image ? [article.image] : undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { handle } = await params;
  const article = await getArticleByHandle(handle);

  if (!article) notFound();

  return (
    <div className="sidebar-space">
      <div className="main-article template-page">
        <article>
        <header className="article-header">
          <div className="article-image">
            <img src={article.image} alt={article.title} />
          </div>
          <div className="article-info">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Journal", href: "/blogs/organization-blog" },
                { label: article.title },
              ]}
            />
            <div className="article-meta">
              <span>{formatDate(article.date)}</span>
              <span aria-hidden>·</span>
              <span>{article.author}</span>
            </div>
            <h1 className="h2">{article.title}</h1>
            {article.excerpt && <p className="article-excerpt">{article.excerpt}</p>}
          </div>
        </header>

        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

        <div className="article-back">
          <Link href="/blogs/organization-blog">All journal stories</Link>
        </div>
      </article>
      </div>
    </div>
  );
}
