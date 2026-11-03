import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { searchProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Youmi Beauty for hair tools, extensions, coloured lenses and body rituals.",
};

const popular = ["GlamDry", "Clip-in", "La Capri", "Bath salts", "Lens solution", "Tape-in"];

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="sidebar-space">
      <div className="search-page">
        <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Search" },
          ]}
        />

        <span className="eyebrow">Find your next essential</span>
        <h1 className="h2">Search</h1>

        <div className="search-form">
          <form action="/search" method="get" role="search">
            <label className="visually-hidden" htmlFor="site-search">
              Search products
            </label>
            <input
              id="site-search"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search products, collections…"
              autoFocus
            />
            <button type="submit">Search</button>
          </form>
        </div>

        <div className="popular-searches">
          <span>Popular</span>
          {popular.map((term) => (
            <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="chip">
              {term}
            </Link>
          ))}
        </div>

        {query ? (
          <>
            <p className="search-summary">
              {products.length} {products.length === 1 ? "result" : "results"} for “{query}”
            </p>
            {products.length > 0 ? (
              <div className="collection-grid collection-grid--three">
                {products.map((product) => (
                  <ProductCard key={product.handle} product={product} />
                ))}
              </div>
            ) : (
              <div className="collection-empty">
                <p>
                  We could not find a match for “{query}”. Try a category such as “lenses”, “clip-in”
                  or “hair dryer”.
                </p>
                <Link href="/collections/best-sellers" className="btn btn--primary">
                  Browse best sellers
                </Link>
              </div>
            )}
          </>
        ) : (
          <p className="search-summary">
            Search the full Youmi collection — or start with one of the popular searches above.
          </p>
        )}
        </div>
      </div>
    </div>
  );
}
