import Link from "next/link";
import { getAdminCollections, getAdminProducts } from "@/lib/admin-db";
import { money } from "@/lib/format";

export const metadata = { title: "Produtos" };

export default async function AdminProductsPage() {
  const [products, collections] = await Promise.all([getAdminProducts(), getAdminCollections()]);
  const collectionTitles = new Map(collections.map((collection) => [collection.handle, collection.title]));

  return (
    <>
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Catálogo</span>
          <h1>Produtos</h1>
          <p>
            {products.length} produto{products.length === 1 ? "" : "s"} no banco. Edite qualquer campo
            e a loja atualiza em segundos.
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/products/new" className="admin-btn">
            Novo produto
          </Link>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <strong>Nenhum produto encontrado.</strong>
            Se o banco já foi configurado, rode <code>npm run seed</code> para importar o catálogo atual
            ou crie o primeiro produto manualmente.
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Coleções</th>
                <th>Preço</th>
                <th>Estado</th>
                <th>Ordem</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-table__product">
                      {product.images[0]?.src ? (
                        <img className="admin-table__thumb" src={product.images[0].src} alt="" />
                      ) : (
                        <span className="admin-table__thumb" />
                      )}
                      <div>
                        <strong>{product.title}</strong>
                        <small>/products/{product.handle}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {product.collections.length === 0 ? (
                      <span className="admin-muted">—</span>
                    ) : (
                      product.collections
                        .map((handle) => collectionTitles.get(handle) ?? handle)
                        .join(", ")
                    )}
                  </td>
                  <td className="admin-table__money">
                    {money(product.price)}
                    {product.compareAtPrice ? (
                      <small className="admin-muted"> · {money(product.compareAtPrice)}</small>
                    ) : null}
                  </td>
                  <td>
                    {product.soldOut ? (
                      <span className="admin-badge admin-badge--off">Esgotado</span>
                    ) : (
                      <span className="admin-badge admin-badge--on">Ativo</span>
                    )}
                    {product.featured && (
                      <>
                        {" "}
                        <span className="admin-badge admin-badge--gold">Destaque</span>
                      </>
                    )}
                  </td>
                  <td className="admin-table__money">{product.position}</td>
                  <td className="admin-table__actions">
                    <Link href={`/admin/products/${product.handle}`} className="admin-btn admin-btn--ghost admin-btn--small">
                      Editar
                    </Link>{" "}
                    <Link
                      href={`/products/${product.handle}`}
                      className="admin-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
