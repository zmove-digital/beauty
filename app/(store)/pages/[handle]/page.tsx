import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { contentPages, getContentPage } from "@/lib/content";

type PageProps = {
  params: Promise<{ handle: string }>;
};

export function generateStaticParams() {
  return Object.keys(contentPages).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const page = getContentPage(handle);

  if (!page) return { title: "Page not found" };

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/pages/${page.handle}` },
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { handle } = await params;
  const page = getContentPage(handle);

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
        {page.eyebrow && <span className="eyebrow">{page.eyebrow}</span>}
        <h1 className="h2">{page.title}</h1>
        <div className="rte" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </div>
    </div>
  );
}
