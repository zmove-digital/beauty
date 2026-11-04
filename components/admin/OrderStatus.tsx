"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
  { value: "fulfilled", label: "Enviado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "refunded", label: "Reembolsado" },
];

export function OrderStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onChange(next: string) {
    const previous = value;
    setValue(next);
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível atualizar.");
      router.refresh();
    } catch (updateError) {
      setValue(previous);
      setError((updateError as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: "0.2rem" }}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={saving}
        aria-label="Status do pedido"
        style={{
          border: "1px solid #e2ddd5",
          borderRadius: 3,
          padding: "0.3rem 0.4rem",
          fontSize: "0.78rem",
          background: "#fff",
          color: "#1d1b19",
        }}
      >
        {STATUSES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span style={{ color: "#a52f22", fontSize: "0.68rem" }}>{error}</span>}
    </span>
  );
}
