import { ArticlesManager } from "@/components/admin/ArticlesManager";
import { getAdminArticles } from "@/lib/admin-db";

export const metadata = { title: "Artigos" };

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();

  return (
    <>
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Conteúdo</span>
          <h1>Artigos</h1>
          <p>Posts do blog exibidos em /blogs/organization-blog.</p>
        </div>
      </header>

      <ArticlesManager articles={articles} />
    </>
  );
}
