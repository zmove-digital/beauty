import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { hasAdminSession } from "@/lib/admin-auth";
import { isDatabaseConfigured } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  if (!(await hasAdminSession())) redirect("/admin/login");

  return (
    <>
      <aside className="admin-rail">
        <div className="admin-rail__brand">
          <strong>Youmi Beauty</strong>
          <span>Admin</span>
        </div>

        <AdminNav />

        <div className="admin-rail__footer">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            Ver loja ↗
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="admin-main">
        {!isDatabaseConfigured() && (
          <p className="admin-alert is-error">
            <strong>Banco não configurado.</strong> Adicione{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> ao <code>.env.local</code> e reinicie o servidor.
            As páginas abaixo ficam vazias até isso ser feito.
          </p>
        )}
        {children}
      </div>
    </>
  );
}
