"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível entrar.");
      router.replace("/admin");
      router.refresh();
    } catch (submitError) {
      setError((submitError as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <p className="admin-alert is-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-field">
        <label htmlFor="admin-password">Senha do painel</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={disabled || loading}
        />
      </div>

      <button type="submit" className="admin-btn" disabled={disabled || loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
