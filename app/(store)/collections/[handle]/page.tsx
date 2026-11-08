import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CollectionGrid } from "@/components/CollectionGrid";
import {
  getAllCollections,
  getCollectionByHandle,
  getCollectionProducts,
} from "@/lib/data";

export const revalidate = 30;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateStaticParams() {
  const collections = await getAllCollections();
  return collections.map((collection) => ({ handle: collection.handle }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) return { title: "Collection not found" };

  return {
    title: collection.title,
    description:
      collection.description ||
      `Shop ${collection.title} at Roman Beauty — dispatched from Dubai.`,
    alternates: { canonical: `/collections/${collection.handle}` },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) notFound();

  const products = await getCollectionProducts(collection.handle);

  return (
    <div className="collection-page template-page sidebar-space">
      <header className="collection-hero">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections/best-sellers" },
            { label: collection.title },
          ]}
        />
        <div className="collection-hero__top">
          <h1 className="h1">{collection.title}</h1>
        </div>
        {collection.description && (
          <p className="collection-hero__description">{collection.description}</p>
        )}
      </header>

      <CollectionGrid products={products} />
    </div>
  );
}
