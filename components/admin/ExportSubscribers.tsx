"use client";

import type { AdminSubscriber } from "@/lib/admin-db";

function escapeCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function ExportSubscribers({ subscribers }: { subscribers: AdminSubscriber[] }) {
  function download() {
    const rows = [
      ["email", "consent", "created_at"],
      ...subscribers.map((subscriber) => [
        subscriber.email,
        subscriber.consent ? "yes" : "no",
        subscriber.created_at,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `youmi-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" className="admin-btn admin-btn--ghost" onClick={download} disabled={!subscribers.length}>
      Exportar CSV
    </button>
  );
}
