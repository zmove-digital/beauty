import { ExportSubscribers } from "@/components/admin/ExportSubscribers";
import { getAdminSubscribers } from "@/lib/admin-db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Newsletter" };

export default async function AdminSubscribersPage() {
  const subscribers = await getAdminSubscribers();

  return (
    <>
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Marketing</span>
          <h1>Newsletter</h1>
          <p>
            {subscribers.length} inscrito{subscribers.length === 1 ? "" : "s"}. Exporte a lista em CSV
            para importar na sua plataforma de e-mail.
          </p>
        </div>
        <div className="admin-actions">
          <ExportSubscribers subscribers={subscribers} />
        </div>
      </header>

      {subscribers.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <strong>Nenhum inscrito ainda.</strong>
            O formulário no rodapé da loja grava aqui automaticamente quando o banco está conectado.
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Consentimento</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td>{subscriber.email}</td>
                  <td>
                    {subscriber.consent ? (
                      <span className="admin-badge admin-badge--on">Sim</span>
                    ) : (
                      <span className="admin-badge admin-badge--off">Não</span>
                    )}
                  </td>
                  <td className="admin-muted">{formatDate(subscriber.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
