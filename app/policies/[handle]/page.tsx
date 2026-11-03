import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getPolicyPage, policyPages } from "@/lib/content";

type PageProps = {
  params: Promise<{ handle: string }>;
};

export function generateStaticParams() {
  return Object.keys(policyPages).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const page = getPolicyPage(handle);

  if (!page) return { title: "Policy not found" };

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/policies/${page.handle}` },
  };
}

export default async function PolicyPage({ params }: PageProps) {
  const { handle } = await params;
  const page = getPolicyPage(handle);

  if (!page) notFound();

  return (
    <div className="sidebar-space">
      <div className="policy-page">
        <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: page.title },
          ]}
        />
        <h1 className="h2">{page.title}</h1>
        {page.updated && <p className="policy-updated">Last updated {page.updated}</p>}
        <div className="rte" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </div>
    </div>
  );
}
