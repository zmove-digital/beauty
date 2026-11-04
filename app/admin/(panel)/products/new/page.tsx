import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminCollections } from "@/lib/admin-db";

export const metadata = { title: "Novo produto" };

export default async function AdminNewProductPage() {
  const collections = await getAdminCollections();

  return (
    <ProductForm
      collections={collections.map((collection) => ({
        handle: collection.handle,
        title: collection.title,
      }))}
    />
  );
}
