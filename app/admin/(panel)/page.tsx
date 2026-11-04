import Link from "next/link";
import { getAdminCounts, getAdminOrders } from "@/lib/admin-db";
import { formatDate, money } from "@/lib/format";
import { isDatabaseConfigured } from "@/lib/supabase-admin";

export const metadata = { title: "Visão geral" };

export default async function AdminDashboardPage() {
  const [counts, orders] = await Promise.all([getAdminCounts(), getAdminOrders(6)]);
  const configured = isDatabaseConfigured();

  return (
    <>
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Painel</span>
          <h1>Visão geral</h1>
          <p>
            Tudo o que aparece na loja vem deste banco. Edite produtos, coleções e artigos aqui e a
            loja atualiza em segundos.
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/products/new" className="admin-btn">
            Novo produto
          </Link>
          <Link href="/" className="admin-btn admin-btn--ghost" target="_blank" rel="noopener noreferrer">
            Ver loja
          </Link>
        </div>
      </header>

      {!configured ? (
        <div className="admin-card">
          <h2>Conectar o Supabase</h2>
          <p className="admin-card__hint">
            Siga estes passos uma única vez. Depois o painel passa a gravar direto no banco.
          </p>
          <ol style={{ marginTop: "1rem", paddingLeft: "1.2rem", display: "grid", gap: "0.6rem" }}>
            <li>
              No Supabase → <strong>SQL Editor</strong>, rode o arquivo{" "}
              <code>supabase/schema.sql</code> deste projeto.
            </li>
            <li>
              Copie <code>.env.example</code> para <code>.env.local</code> e preencha{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> e <code>ADMIN_PASSWORD</code>.
            </li>
            <li>
              Rode <code>npm run seed</code> para importar o catálogo atual (17 coleções, 20
              produtos, 2 artigos).
            </li>
            <li>Reinicie o servidor.</li>
          </ol>
        </div>
      ) : (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <span>Produtos</span>
              <strong>
                <Link href="/admin/products">{counts.products}</Link>
              </strong>
            </div>
            <div className="admin-stat">
              <span>Coleções</span>
              <strong>
                <Link href="/admin/collections">{counts.collections}</Link>
              </strong>
            </div>
            <div className="admin-stat">
              <span>Artigos</span>
              <strong>
                <Link href="/admin/articles">{counts.articles}</Link>
              </strong>
            </div>
            <div className="admin-stat">
              <span>Pedidos</span>
              <strong>
                <Link href="/admin/orders">{counts.orders}</Link>
              </strong>
            </div>
            <div className="admin-stat">
              <span>Newsletter</span>
              <strong>
                <Link href="/admin/subscribers">{counts.subscribers}</Link>
              </strong>
            </div>
          </div>

          <div className="admin-split">
            <div className="admin-card">
              <div className="admin-card__head">
                <h2>Pedidos recentes</h2>
                <Link href="/admin/orders" className="admin-link">
                  Ver todos
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="admin-empty">
                  <strong>Nenhum pedido ainda.</strong>
                  Finalize um checkout na loja para ver o pedido aqui.
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table" style={{ minWidth: 0 }}>
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Data</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.order_number}</td>
                          <td>{order.full_name}</td>
                          <td className="admin-table__money">{money(order.total)}</td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            <span className="admin-badge admin-badge--gold">{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-card">
              <h2>Checklist do catálogo</h2>
              <p className="admin-card__hint">
                O que cada produto precisa para aparecer bonito na loja.
              </p>
              <ul style={{ marginTop: "0.9rem", paddingLeft: "1.1rem", display: "grid", gap: "0.45rem", fontSize: "0.87rem" }}>
                <li>Pelo menos 1 imagem (a primeira vira a capa).</li>
                <li>Uma coleção marcada, para aparecer nas listas.</li>
                <li>Preço em AED — a loja formata como “Dhs. 462.00”.</li>
                <li>Descrição em HTML simples (parágrafos, negrito, links).</li>
                <li>Opções como “Length” criam as variações automaticamente.</li>
                <li>“Esgotado” desativa a compra sem remover o produto.</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
