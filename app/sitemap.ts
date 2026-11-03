import type { MetadataRoute } from "next";
import { contentPages, policyPages } from "@/lib/content";
import { getAllArticles, getAllCollections, getAllProducts } from "@/lib/data";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://youmibeauty.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, products, articles] = await Promise.all([
    getAllCollections(),
    getAllProducts(),
    getAllArticles(),
  ]);

  const now = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blogs/organization-blog`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...collections.map((collection) => ({
      url: `${baseUrl}/collections/${collection.handle}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.handle}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: `${baseUrl}/blogs/organization-blog/${article.handle}`,
      lastModified: article.date ? new Date(article.date) : now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...Object.values(contentPages).map((page) => ({
      url: `${baseUrl}/pages/${page.handle}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    ...Object.values(policyPages).map((page) => ({
      url: `${baseUrl}/policies/${page.handle}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
