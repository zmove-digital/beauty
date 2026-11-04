import Link from "next/link";
import { hasAdminSession, isAdminConfigured } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { redirect } from "next/navigation";

export const metadata = { title: "Entrar" };

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect("/admin");

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <strong>Youmi Beauty</strong>
          <span>Painel administrativo</span>
        </div>

        <h1>Entrar</h1>
        <p className="hint">Área restrita à equipe Youmi.</p>

        {!isAdminConfigured() && (
          <p className="admin-alert is-error">
            Defina <code>ADMIN_PASSWORD</code> no <code>.env.local</code> e reinicie o servidor para
            habilitar o login.
          </p>
        )}

        <LoginForm disabled={!isAdminConfigured()} />

        <Link href="/" className="admin-login__back">
          ← Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
