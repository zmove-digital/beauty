import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminCollections, getAdminProduct } from "@/lib/admin-db";

type PageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const product = await getAdminProduct(handle);
  return { title: product ? `Editar · ${product.title}` : "Produto" };
}

export default async function AdminEditProductPage({ params }: PageProps) {
  const { handle } = await params;
  const [product, collections] = await Promise.all([
    getAdminProduct(handle),
    getAdminCollections(),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      product={product}
      collections={collections.map((collection) => ({
        handle: collection.handle,
        title: collection.title,
      }))}
    />
  );
}
