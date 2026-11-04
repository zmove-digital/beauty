"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminCollection } from "@/lib/admin-db";
import { slugify } from "@/lib/format";

type Draft = {
  handle: string;
  title: string;
  description: string;
  image: string;
  position: string;
};

const EMPTY: Draft = { handle: "", title: "", description: "", image: "", position: "0" };

function toDraft(collection?: AdminCollection): Draft {
  if (!collection) return { ...EMPTY };
  return {
    handle: collection.handle,
    title: collection.title,
    description: collection.description,
    image: collection.image,
    position: String(collection.position),
  };
}

export function CollectionsManager({ collections }: { collections: AdminCollection[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function startNew() {
    setEditing("new");
    setDraft({ ...EMPTY });
    setMessage(null);
  }

  function startEdit(collection: AdminCollection) {
    setEditing(collection.handle);
    setDraft(toDraft(collection));
    setMessage(null);
  }

  function cancel() {
    setEditing(null);
    setDraft(EMPTY);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setMessage({ type: "error", text: "Informe o nome da coleção." });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: draft.handle || slugify(draft.title),
          title: draft.title,
          description: draft.description,
          image: draft.image,
          position: draft.position,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível salvar.");
      setMessage({ type: "ok", text: "Coleção salva. A loja já está atualizada." });
      setEditing(null);
      setDraft(EMPTY);
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(collection: AdminCollection) {
    if (!window.confirm(`Excluir a coleção “${collection.title}”? Os produtos não são apagados.`)) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/admin/collections?handle=${encodeURIComponent(collection.handle)}`,
        { method: "DELETE" },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível excluir.");
      setMessage({ type: "ok", text: "Coleção excluída." });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!editing && (
        <div className="admin-actions" style={{ marginBottom: "1rem" }}>
          <button type="button" className="admin-btn" onClick={startNew}>
            Nova coleção
          </button>
        </div>
      )}

      {message && (
        <p className={`admin-alert ${message.type === "ok" ? "is-ok" : "is-error"}`} role="status">
          {message.text}
        </p>
      )}

      {editing && (
        <form className="admin-card" onSubmit={onSubmit} style={{ marginBottom: "1.2rem" }}>
          <div className="admin-card__head">
            <h2>{editing === "new" ? "Nova coleção" : "Editar coleção"}</h2>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--small" onClick={cancel}>
              Cancelar
            </button>
          </div>

          <div className="admin-row">
            <div className="admin-field">
              <label htmlFor="collection-title">Nome *</label>
              <input
                id="collection-title"
                type="text"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </div>
            <div className="admin-field">
              <label htmlFor="collection-handle">Handle (URL)</label>
              <input
                id="collection-handle"
                type="text"
                value={draft.handle}
                readOnly={editing !== "new"}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, handle: slugify(event.target.value) }))
                }
              />
              <span className="admin-field__hint">/collections/{draft.handle || "…"}</span>
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="collection-image">Imagem</label>
            <input
              id="collection-image"
              type="text"
              value={draft.image}
              placeholder="/images/arquivo.jpg ou https://…"
              onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="collection-description">Descrição</label>
            <textarea
              id="collection-description"
              rows={3}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>

          <div className="admin-field" style={{ maxWidth: 180 }}>
            <label htmlFor="collection-position">Ordem</label>
            <input
              id="collection-position"
              type="number"
              value={draft.position}
              onChange={(event) => setDraft((current) => ({ ...current, position: event.target.value }))}
            />
            <span className="admin-field__hint">Menor número aparece primeiro.</span>
          </div>

          <button type="submit" className="admin-btn" disabled={busy}>
            {busy ? "Salvando…" : "Salvar coleção"}
          </button>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Coleção</th>
              <th>Descrição</th>
              <th>Ordem</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {collections.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="admin-empty">
                    <strong>Nenhuma coleção ainda.</strong>
                    Crie a primeira para agrupar produtos na loja.
                  </div>
                </td>
              </tr>
            ) : (
              collections.map((collection) => (
                <tr key={collection.id}>
                  <td>
                    <div className="admin-table__product">
                      {collection.image ? (
                        <img className="admin-table__thumb" src={collection.image} alt="" />
                      ) : (
                        <span className="admin-table__thumb" />
                      )}
                      <div>
                        <strong>{collection.title}</strong>
                        <small>/collections/{collection.handle}</small>
                      </div>
                    </div>
                  </td>
                  <td className="admin-muted">
                    {collection.description ? collection.description.slice(0, 90) : "—"}
                  </td>
                  <td className="admin-table__money">{collection.position}</td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--small"
                      onClick={() => startEdit(collection)}
                    >
                      Editar
                    </button>{" "}
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--small"
                      onClick={() => onDelete(collection)}
                      disabled={busy}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

