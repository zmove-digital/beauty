import { CollectionsManager } from "@/components/admin/CollectionsManager";
import { getAdminCollections } from "@/lib/admin-db";

export const metadata = { title: "Coleções" };

export default async function AdminCollectionsPage() {
  const collections = await getAdminCollections();

  return (
    <>
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Catálogo</span>
          <h1>Coleções</h1>
          <p>
            Agrupam produtos nas listas da loja. Excluir uma coleção não apaga os produtos, apenas o
            vínculo.
          </p>
        </div>
      </header>

      <CollectionsManager collections={collections} />
    </>
  );
}
