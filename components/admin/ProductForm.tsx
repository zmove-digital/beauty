"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminProduct } from "@/lib/admin-db";
import { slugify } from "@/lib/format";

export type CollectionOption = { handle: string; title: string };

type ImageRow = { src: string; alt: string };
type OptionRow = { name: string; values: string };
type DetailRow = { title: string; content: string };
type MetaRow = { key: string; value: string };

type FormState = {
  handle: string;
  title: string;
  subtitle: string;
  price: string;
  compareAtPrice: string;
  category: string;
  badge: string;
  soldOut: boolean;
  featured: boolean;
  position: string;
  description: string;
  images: ImageRow[];
  options: OptionRow[];
  details: DetailRow[];
  metadata: MetaRow[];
  collections: string[];
};

function toFormState(product?: AdminProduct): FormState {
  return {
    handle: product?.handle ?? "",
    title: product?.title ?? "",
    subtitle: product?.subtitle ?? "",
    price: product ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice) : "",
    category: product?.category ?? "",
    badge: product?.badge ?? "",
    soldOut: product?.soldOut ?? false,
    featured: product?.featured ?? false,
    position: String(product?.position ?? 0),
    description: product?.description ?? "",
    images: product?.images.length ? product.images : [{ src: "", alt: "" }],
    options: (product?.options ?? []).map((option) => ({
      name: option.name,
      values: option.values.join(", "),
    })),
    details: product?.details ?? [],
    metadata: Object.entries(product?.metadata ?? {}).map(([key, value]) => ({ key, value })),
    collections: product?.collections ?? [],
  };
}

function Section({
  title,
  hint,
  children,
  action,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="admin-card">
      <div className="admin-card__head">
        <div>
          <h2>{title}</h2>
          {hint && <p className="admin-card__hint">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProductForm({
  product,
  collections,
}: {
  product?: AdminProduct;
  collections: CollectionOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [handleLocked, setHandleLocked] = useState(isEdit);
  const [status, setStatus] = useState<"idle" | "saving" | "uploading" | "deleting">("idle");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      handle: handleLocked ? current.handle : slugify(title),
    }));
  }

  function updateImage(index: number, patch: Partial<ImageRow>) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, position) =>
        position === index ? { ...image, ...patch } : image,
      ),
    }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.images.length) return current;
      const images = current.images.slice();
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });
  }

  async function uploadFile(file: File): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error ?? "Falha no upload.");
    return payload.url as string;
  }

  async function onUpload(index: number, file: File | undefined) {
    if (!file) return;
    setUploadingIndex(index);
    setMessage(null);
    try {
      const url = await uploadFile(file);
      updateImage(index, { src: url });
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setUploadingIndex(null);
    }
  }

  function addImageByUrl() {
    const url = imageUrl.trim();
    if (!url) return;
    setForm((current) => ({
      ...current,
      images: [...current.images.filter((image) => image.src), { src: url, alt: "" }],
    }));
    setImageUrl("");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const images = form.images.filter((image) => image.src.trim());
    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Informe o nome do produto." });
      return;
    }
    if (!images.length) {
      setMessage({ type: "error", text: "Adicione pelo menos uma imagem." });
      return;
    }

    setStatus("saving");

    const payload = {
      handle: form.handle || slugify(form.title),
      title: form.title,
      subtitle: form.subtitle,
      price: form.price,
      compareAtPrice: form.compareAtPrice === "" ? null : form.compareAtPrice,
      category: form.category,
      badge: form.badge,
      soldOut: form.soldOut,
      featured: form.featured,
      position: form.position,
      description: form.description,
      images: images.map((image) => ({ src: image.src.trim(), alt: image.alt.trim() })),
      options: form.options
        .map((option) => ({
          name: option.name.trim(),
          values: option.values
            .split(/[,\n]/)
            .map((value) => value.trim())
            .filter(Boolean),
        }))
        .filter((option) => option.name && option.values.length),
      details: form.details
        .map((detail) => ({ title: detail.title.trim(), content: detail.content }))
        .filter((detail) => detail.title || detail.content.trim()),
      metadata: Object.fromEntries(
        form.metadata
          .map((entry) => [entry.key.trim(), entry.value.trim()] as const)
          .filter(([key]) => Boolean(key)),
      ),
      collections: form.collections,
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Não foi possível salvar.");

      setMessage({ type: "ok", text: "Produto salvo. A loja já está atualizada." });
      if (!isEdit) {
        router.replace(`/admin/products/${result.handle}`);
      }
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setStatus("idle");
    }
  }

  async function onDelete() {
    if (!product) return;
    if (!window.confirm(`Excluir “${product.title}”? Essa ação não pode ser desfeita.`)) return;

    setStatus("deleting");
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/products?handle=${encodeURIComponent(product.handle)}`, {
        method: "DELETE",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Não foi possível excluir.");
      router.replace("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
      setStatus("idle");
    }
  }

  const busy = status !== "idle";

  return (
    <>
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">
            <Link href="/admin/products" className="admin-link">
              Produtos
            </Link>{" "}
            / {isEdit ? "editar" : "novo"}
          </span>
          <h1>{isEdit ? product?.title : "Novo produto"}</h1>
          {isEdit && (
            <p>
              <Link href={`/products/${product?.handle}`} target="_blank" rel="noopener noreferrer">
                Ver na loja ↗
              </Link>
            </p>
          )}
        </div>
        <div className="admin-actions">
          {isEdit && (
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={onDelete}
              disabled={busy}
            >
              {status === "deleting" ? "Excluindo…" : "Excluir"}
            </button>
          )}
          <button type="submit" form="product-form" className="admin-btn" disabled={busy}>
            {status === "saving" ? "Salvando…" : "Salvar produto"}
          </button>
        </div>
      </header>

      {message && (
        <p className={`admin-alert ${message.type === "ok" ? "is-ok" : "is-error"}`} role="status">
          {message.text}
        </p>
      )}

      <form id="product-form" onSubmit={onSubmit} className="admin-form-grid">
        <div className="admin-form-col">
          <Section title="Informações" hint="Como o produto aparece na loja.">
            <div className="admin-field">
              <label htmlFor="product-title">Nome do produto *</label>
              <input
                id="product-title"
                type="text"
                value={form.title}
                onChange={(event) => updateTitle(event.target.value)}
                required
              />
            </div>

            <div className="admin-row">
              <div className="admin-field">
                <label htmlFor="product-handle">Handle (URL)</label>
                <input
                  id="product-handle"
                  type="text"
                  value={form.handle}
                  readOnly={handleLocked}
                  onChange={(event) => {
                    setHandleLocked(true);
                    update("handle", slugify(event.target.value));
                  }}
                />
                <span className="admin-field__hint">
                  {handleLocked
                    ? isEdit
                      ? "O handle não muda depois de criado."
                      : "Definido a partir do nome — você pode ajustar."
                    : "/products/" + (form.handle || "…")}
                </span>
              </div>

              <div className="admin-field">
                <label htmlFor="product-subtitle">Subtítulo</label>
                <input
                  id="product-subtitle"
                  type="text"
                  value={form.subtitle}
                  onChange={(event) => update("subtitle", event.target.value)}
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="product-description">Descrição (HTML)</label>
              <textarea
                id="product-description"
                className="code"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="<p>Seu texto aqui…</p>"
              />
              <span className="admin-field__hint">
                Aceita HTML simples: <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>,{" "}
                <code>&lt;em&gt;</code>, <code>&lt;ul&gt;</code>, <code>&lt;a&gt;</code>.
              </span>
            </div>
          </Section>

          <Section
            title="Imagens"
            hint="A primeira imagem é a capa. Você pode enviar arquivos (6 MB, JPG/PNG/WebP) ou usar um caminho já existente."
            action={
              <span className="admin-badge">{form.images.filter((image) => image.src).length} imagens</span>
            }
          >
            <div className="admin-thumbs">
              {form.images.map((image, index) => (
                <div className="admin-thumb" key={index}>
                  {image.src ? (
                    <img src={image.src} alt="" />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        background: "#f0ece6",
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        fontSize: "0.65rem",
                        color: "#8a8279",
                      }}
                    >
                      vazio
                    </div>
                  )}

                  <div className="admin-thumb__fields">
                    <input
                      type="text"
                      value={image.src}
                      placeholder="/images/arquivo.jpg ou https://…"
                      onChange={(event) => updateImage(index, { src: event.target.value })}
                      aria-label={`Caminho da imagem ${index + 1}`}
                    />
                    <input
                      type="text"
                      value={image.alt}
                      placeholder="Texto alternativo (SEO)"
                      onChange={(event) => updateImage(index, { alt: event.target.value })}
                      aria-label={`Texto alternativo da imagem ${index + 1}`}
                    />
                    <label className="admin-link" style={{ cursor: "pointer" }}>
                      {uploadingIndex === index ? "Enviando…" : "Enviar arquivo"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          void onUpload(index, file);
                        }}
                      />
                    </label>
                  </div>

                  <div className="admin-repeat-row__tools">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() => moveImage(index, -1)}
                      aria-label="Mover para cima"
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() => moveImage(index, 1)}
                      aria-label="Mover para baixo"
                      disabled={index === form.images.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          images:
                            current.images.length > 1
                              ? current.images.filter((_, position) => position !== index)
                              : [{ src: "", alt: "" }],
                        }))
                      }
                      aria-label="Remover imagem"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--small"
              style={{ marginTop: "0.7rem" }}
              onClick={() =>
                setForm((current) => ({ ...current, images: [...current.images, { src: "", alt: "" }] }))
              }
            >
              + Adicionar imagem
            </button>

            <div className="admin-row" style={{ marginTop: "1rem" }}>
              <div className="admin-field">
                <label htmlFor="image-url">Adicionar imagem por URL</label>
                <input
                  id="image-url"
                  type="text"
                  value={imageUrl}
                  placeholder="https://…"
                  onChange={(event) => setImageUrl(event.target.value)}
                />
              </div>
              <div className="admin-field" style={{ alignSelf: "end" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={addImageByUrl}
                  disabled={!imageUrl.trim()}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </Section>

          <Section
            title="Opções"
            hint="Cada opção vira um seletor na página do produto (ex.: Length). Separe os valores por vírgula."
            action={
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--small"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    options: [...current.options, { name: "", values: "" }],
                  }))
                }
              >
                + Opção
              </button>
            }
          >
            {form.options.length === 0 ? (
              <p className="admin-muted" style={{ fontSize: "0.85rem" }}>
                Sem opções — o produto é vendido em versão única.
              </p>
            ) : (
              form.options.map((option, index) => (
                <div className="admin-repeat-row" key={index}>
                  <div className="admin-field" style={{ marginBottom: 0 }}>
                    <input
                      type="text"
                      value={option.name}
                      placeholder="Nome (ex.: Length)"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          options: current.options.map((item, position) =>
                            position === index ? { ...item, name: event.target.value } : item,
                          ),
                        }))
                      }
                      aria-label={`Nome da opção ${index + 1}`}
                    />
                    <input
                      type="text"
                      value={option.values}
                      placeholder="Valores separados por vírgula"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          options: current.options.map((item, position) =>
                            position === index ? { ...item, values: event.target.value } : item,
                          ),
                        }))
                      }
                      aria-label={`Valores da opção ${index + 1}`}
                    />
                  </div>
                  <div className="admin-repeat-row__tools">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          options: current.options.filter((_, position) => position !== index),
                        }))
                      }
                      aria-label="Remover opção"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </Section>

          <Section
            title="Detalhes"
            hint="Acordeões abaixo da descrição (envio, cuidados, garantia)."
            action={
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--small"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    details: [...current.details, { title: "", content: "" }],
                  }))
                }
              >
                + Detalhe
              </button>
            }
          >
            {form.details.length === 0 ? (
              <p className="admin-muted" style={{ fontSize: "0.85rem" }}>
                Nenhum detalhe extra. A loja já mostra “Envio e devoluções” automaticamente.
              </p>
            ) : (
              form.details.map((detail, index) => (
                <div className="admin-repeat-row admin-repeat-row--details" key={index}>
                  <div className="admin-field" style={{ marginBottom: 0 }}>
                    <input
                      type="text"
                      value={detail.title}
                      placeholder="Título (ex.: Cuidados)"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          details: current.details.map((item, position) =>
                            position === index ? { ...item, title: event.target.value } : item,
                          ),
                        }))
                      }
                      aria-label={`Título do detalhe ${index + 1}`}
                    />
                    <textarea
                      value={detail.content}
                      rows={3}
                      placeholder="Conteúdo (aceita HTML)"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          details: current.details.map((item, position) =>
                            position === index ? { ...item, content: event.target.value } : item,
                          ),
                        }))
                      }
                      aria-label={`Conteúdo do detalhe ${index + 1}`}
                    />
                  </div>
                  <div className="admin-repeat-row__tools">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          details: current.details.filter((_, position) => position !== index),
                        }))
                      }
                      aria-label="Remover detalhe"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </Section>

          <Section
            title="Ficha técnica"
            hint="Pares chave/valor exibidos na página do produto (SKU, Vendor, Disponibilidade…)."
            action={
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--small"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    metadata: [...current.metadata, { key: "", value: "" }],
                  }))
                }
              >
                + Campo
              </button>
            }
          >
            {form.metadata.length === 0 ? (
              <p className="admin-muted" style={{ fontSize: "0.85rem" }}>
                Nenhum campo extra.
              </p>
            ) : (
              form.metadata.map((entry, index) => (
                <div className="admin-repeat-row" key={index}>
                  <div className="admin-row" style={{ gap: "0.5rem" }}>
                    <input
                      type="text"
                      value={entry.key}
                      placeholder="Chave"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          metadata: current.metadata.map((item, position) =>
                            position === index ? { ...item, key: event.target.value } : item,
                          ),
                        }))
                      }
                      aria-label={`Chave ${index + 1}`}
                      style={{ border: "1px solid #e2ddd5", borderRadius: 3, padding: "0.5rem 0.6rem" }}
                    />
                    <input
                      type="text"
                      value={entry.value}
                      placeholder="Valor"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          metadata: current.metadata.map((item, position) =>
                            position === index ? { ...item, value: event.target.value } : item,
                          ),
                        }))
                      }
                      aria-label={`Valor ${index + 1}`}
                      style={{ border: "1px solid #e2ddd5", borderRadius: 3, padding: "0.5rem 0.6rem" }}
                    />
                  </div>
                  <div className="admin-repeat-row__tools">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          metadata: current.metadata.filter((_, position) => position !== index),
                        }))
                      }
                      aria-label="Remover campo"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </Section>
        </div>

        <aside className="admin-form-col">
          <Section title="Publicação">
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.soldOut}
                onChange={(event) => update("soldOut", event.target.checked)}
              />
              Esgotado (bloqueia a compra)
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update("featured", event.target.checked)}
              />
              Destaque
            </label>

            <div className="admin-field" style={{ marginTop: "0.8rem" }}>
              <label htmlFor="product-badge">Selo (badge)</label>
              <input
                id="product-badge"
                type="text"
                value={form.badge}
                placeholder="Ex.: Novo"
                onChange={(event) => update("badge", event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="product-category">Categoria</label>
              <input
                id="product-category"
                type="text"
                value={form.category}
                placeholder="Ex.: Hair Tools"
                onChange={(event) => update("category", event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="product-position">Ordem</label>
              <input
                id="product-position"
                type="number"
                value={form.position}
                onChange={(event) => update("position", event.target.value)}
              />
              <span className="admin-field__hint">Menor número aparece primeiro.</span>
            </div>
          </Section>

          <Section title="Preço">
            <div className="admin-field">
              <label htmlFor="product-price">Preço (AED) *</label>
              <input
                id="product-price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                required
              />
              <span className="admin-field__hint">Exibido como “Dhs. 462.00”.</span>
            </div>

            <div className="admin-field">
              <label htmlFor="product-compare">Preço comparativo</label>
              <input
                id="product-compare"
                type="number"
                min={0}
                step="0.01"
                value={form.compareAtPrice}
                onChange={(event) => update("compareAtPrice", event.target.value)}
              />
              <span className="admin-field__hint">Opcional — mostra o valor riscado.</span>
            </div>
          </Section>

          <Section title="Coleções" hint="Aparece em todas as coleções marcadas.">
            {collections.length === 0 ? (
              <p className="admin-muted" style={{ fontSize: "0.85rem" }}>
                Nenhuma coleção cadastrada ainda.{" "}
                <Link href="/admin/collections" className="admin-link">
                  Criar coleção
                </Link>
              </p>
            ) : (
              <div className="admin-check-list">
                {collections.map((collection) => (
                  <label className="admin-check" key={collection.handle}>
                    <input
                      type="checkbox"
                      checked={form.collections.includes(collection.handle)}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          collections: event.target.checked
                            ? [...current.collections, collection.handle]
                            : current.collections.filter((handle) => handle !== collection.handle),
                        }))
                      }
                    />
                    {collection.title}
                  </label>
                ))}
              </div>
            )}
          </Section>

          <button type="submit" className="admin-btn" disabled={busy} style={{ width: "100%" }}>
            {status === "saving" ? "Salvando…" : "Salvar produto"}
          </button>
        </aside>
      </form>
    </>
  );
}
