import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  IconShield,
  IconSparkle,
  IconTruck,
} from "@/components/icons";
import { ProductAccordion } from "@/components/ProductAccordion";
import { ProductMedia } from "@/components/ProductMedia";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductTabsCarousel } from "@/components/ProductTabsCarousel";
import { getAllProducts, getCollectionByHandle, getCollectionProducts, getProductByHandle } from "@/lib/data";
import { money } from "@/lib/format";

type PageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) return { title: "Product not found" };

  return {
    title: product.title,
    description:
      product.subtitle ||
      `${product.title} by Youmi Beauty — salon-grade beauty essentials dispatched from Dubai.`,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      title: product.title,
      description: product.subtitle,
      images: product.images.map((image) => image.src),
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  const primaryCollection = product.collections.find((entry) => entry !== "best-sellers") ?? product.collections[0];
  const collection = primaryCollection ? await getCollectionByHandle(primaryCollection) : undefined;
  const related = primaryCollection
    ? (await getCollectionProducts(primaryCollection)).filter((entry) => entry.handle !== product.handle)
    : [];

  const accordionSections = [
    {
      title: "Description",
      content: product.description || `<p>${product.subtitle ?? product.title}</p>`,
    },
    ...product.details,
    {
      title: "Shipping & Returns",
      content:
        "<p>Complimentary shipping on orders over Dhs. 300. UAE delivery in 1–3 working days, GCC in 3–5 working days and worldwide in 5–9 working days. Unused, unopened items can be returned within 14 days — see our <a href=\"/policies/refund-policy\">Refund Policy</a> for details.</p>",
    },
  ];

  const metadataEntries = Object.entries(product.metadata ?? {});

  return (
    <>
      <div className="main-product template-page sidebar-space">
        <div className="product-layout">
          <ProductMedia images={product.images} title={product.title} />

          <div className="product-info">
            <Breadcrumbs
              className="product-breadcrumb"
              items={[
                { label: "Home", href: "/" },
                collection
                  ? { label: collection.title, href: `/collections/${collection.handle}` }
                  : { label: "Shop" },
                { label: product.title },
              ]}
            />

            <div className="product-title-price">
              <h1 className="product-title h3">{product.title}</h1>
              {product.subtitle && <p className="product-subtitle">{product.subtitle}</p>}
              <div className="product-price">
                <span className={product.compareAtPrice ? "price--sale" : "price--regular"}>
                  {money(product.price)}
                </span>
                {product.compareAtPrice ? (
                  <span className="price--compare">{money(product.compareAtPrice)}</span>
                ) : null}
              </div>
            </div>

            <div className="product-reviews">
              <span className="stars" aria-hidden>
                ★★★★★
              </span>
              <span>Loved by our community · Colour matching on WhatsApp</span>
            </div>

            <ProductPurchase product={product} />

            <div className="icon-list-item">
              <ul>
                <li>
                  <IconTruck />
                  <span>Complimentary shipping on orders over Dhs. 300</span>
                </li>
                <li>
                  <IconShield />
                  <span>Secure checkout · VAT included where applicable</span>
                </li>
                <li>
                  <IconSparkle />
                  <span>Colour matching and styling advice from our Dubai studio</span>
                </li>
              </ul>
            </div>

            {metadataEntries.length > 0 && (
              <div className="product-metadata">
                <ul>
                  {metadataEntries.map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong>
                      <span>{value}</span>
                    </li>
                  ))}
                  <li>
                    <strong>Support:</strong>
                    <a href="https://wa.me/+971522888834" target="_blank" rel="noopener noreferrer">
                      WhatsApp our team
                    </a>
                  </li>
                </ul>
              </div>
            )}

            <ProductAccordion sections={accordionSections} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="sidebar-space">
          <ProductTabsCarousel
            collections={[
              {
                handle: primaryCollection ?? "best-sellers",
                title: collection?.title ?? "You may also like",
                products: related.slice(0, 12),
              },
            ]}
            className="carousel--lenses"
          />
        </div>
      )}
    </>
  );
}
