"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminArticle } from "@/lib/admin-db";
import { formatDate, slugify } from "@/lib/format";

type Draft = {
  handle: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  content: string;
};

const EMPTY: Draft = {
  handle: "",
  title: "",
  excerpt: "",
  image: "",
  date: new Date().toISOString().slice(0, 10),
  author: "Roman Beauty",
  content: "",
};

function toDraft(article?: AdminArticle): Draft {
  if (!article) return { ...EMPTY };
  return {
    handle: article.handle,
    title: article.title,
    excerpt: article.excerpt,
    image: article.image,
    date: article.date ? article.date.slice(0, 10) : "",
    author: article.author,
    content: article.content,
  };
}

export function ArticlesManager({ articles }: { articles: AdminArticle[] }) {
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

  function startEdit(article: AdminArticle) {
    setEditing(article.handle);
    setDraft(toDraft(article));
    setMessage(null);
  }

  function cancel() {
    setEditing(null);
    setDraft(EMPTY);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setMessage({ type: "error", text: "Informe o título do artigo." });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: draft.handle || slugify(draft.title),
          title: draft.title,
          excerpt: draft.excerpt,
          image: draft.image,
          date: draft.date,
          author: draft.author,
          content: draft.content,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível salvar.");
      setMessage({ type: "ok", text: "Artigo salvo. A loja já está atualizada." });
      setEditing(null);
      setDraft(EMPTY);
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(article: AdminArticle) {
    if (!window.confirm(`Excluir o artigo “${article.title}”?`)) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/articles?handle=${encodeURIComponent(article.handle)}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível excluir.");
      setMessage({ type: "ok", text: "Artigo excluído." });
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
            Novo artigo
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
            <h2>{editing === "new" ? "Novo artigo" : "Editar artigo"}</h2>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--small" onClick={cancel}>
              Cancelar
            </button>
          </div>

          <div className="admin-row">
            <div className="admin-field">
              <label htmlFor="article-title">Título *</label>
              <input
                id="article-title"
                type="text"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </div>
            <div className="admin-field">
              <label htmlFor="article-handle">Handle (URL)</label>
              <input
                id="article-handle"
                type="text"
                value={draft.handle}
                readOnly={editing !== "new"}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, handle: slugify(event.target.value) }))
                }
              />
              <span className="admin-field__hint">
                /blogs/organization-blog/{draft.handle || "…"}
              </span>
            </div>
          </div>

          <div className="admin-row">
            <div className="admin-field">
              <label htmlFor="article-date">Data</label>
              <input
                id="article-date"
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="article-author">Autor</label>
              <input
                id="article-author"
                type="text"
                value={draft.author}
                onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))}
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="article-image">Imagem de capa</label>
            <input
              id="article-image"
              type="text"
              value={draft.image}
              placeholder="/images/arquivo.jpg ou https://…"
              onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="article-excerpt">Resumo</label>
            <textarea
              id="article-excerpt"
              rows={2}
              value={draft.excerpt}
              onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="article-content">Conteúdo (HTML)</label>
            <textarea
              id="article-content"
              className="code"
              value={draft.content}
              onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
              placeholder="<p>Seu texto aqui…</p>"
            />
          </div>

          <button type="submit" className="admin-btn" disabled={busy}>
            {busy ? "Salvando…" : "Salvar artigo"}
          </button>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Artigo</th>
              <th>Data</th>
              <th>Autor</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="admin-empty">
                    <strong>Nenhum artigo ainda.</strong>
                    Crie o primeiro post do blog.
                  </div>
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <div className="admin-table__product">
                      {article.image ? (
                        <img className="admin-table__thumb" src={article.image} alt="" />
                      ) : (
                        <span className="admin-table__thumb" />
                      )}
                      <div>
                        <strong>{article.title}</strong>
                        <small>{article.excerpt ? article.excerpt.slice(0, 70) : article.handle}</small>
                      </div>
                    </div>
                  </td>
                  <td className="admin-muted">{article.date ? formatDate(article.date) : "—"}</td>
                  <td className="admin-muted">{article.author || "—"}</td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--small"
                      onClick={() => startEdit(article)}
                    >
                      Editar
                    </button>{" "}
                    <Link
                      href={`/blogs/organization-blog/${article.handle}`}
                      className="admin-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver ↗
                    </Link>{" "}
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--small"
                      onClick={() => onDelete(article)}
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
