import { OrderStatus } from "@/components/admin/OrderStatus";
import { getAdminOrders } from "@/lib/admin-db";
import { formatDate, money } from "@/lib/format";

export const metadata = { title: "Pedidos" };

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders(100);

  return (
    <>
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Vendas</span>
          <h1>Pedidos</h1>
          <p>
            {orders.length} pedido{orders.length === 1 ? "" : "s"}. Atualize o status conforme o
            pagamento e o envio.
          </p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <strong>Nenhum pedido ainda.</strong>
            Finalize um checkout na loja para ver o pedido aqui.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {orders.map((order) => (
            <div className="admin-card" key={order.id}>
              <div className="admin-card__head">
                <div>
                  <h2>{order.order_number}</h2>
                  <p className="admin-card__hint">
                    {formatDate(order.created_at)} · {order.full_name} · {order.email}
                    {order.phone ? ` · ${order.phone}` : ""}
                  </p>
                </div>
                <div className="admin-actions">
                  <span className="admin-badge admin-badge--gold">{money(order.total)}</span>
                  <OrderStatus id={order.id} status={order.status} />
                </div>
              </div>

              <div className="admin-split">
                <div>
                  <ul className="admin-order-items">
                    {order.items.length === 0 ? (
                      <li className="admin-muted">Sem itens registrados.</li>
                    ) : (
                      order.items.map((item) => (
                        <li key={item.id}>
                          <span>
                            <strong>{item.quantity}×</strong> {item.title}
                            {item.variant ? ` · ${item.variant}` : ""}
                          </span>
                          <span className="admin-table__money">
                            {money(item.unit_price * item.quantity)}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>

                  <ul className="admin-order-items" style={{ marginTop: "0.7rem" }}>
                    <li>
                      <span>Subtotal</span>
                      <span className="admin-table__money">{money(order.subtotal)}</span>
                    </li>
                    <li>
                      <span>Envio</span>
                      <span className="admin-table__money">
                        {order.shipping === 0 ? "Grátis" : money(order.shipping)}
                      </span>
                    </li>
                    <li>
                      <span>
                        <strong>Total</strong>
                      </span>
                      <span className="admin-table__money">
                        <strong>{money(order.total)}</strong>
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <span className="admin-eyebrow">Entrega</span>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
                    {[order.address.line1, order.address.line2, order.address.city, order.address.postalCode, order.address.country]
                      .filter(Boolean)
                      .join(", ") || "Endereço não informado."}
                  </p>
                  {order.notes && (
                    <>
                      <span className="admin-eyebrow" style={{ marginTop: "0.8rem" }}>
                        Observações
                      </span>
                      <p style={{ fontSize: "0.85rem" }}>{order.notes}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
