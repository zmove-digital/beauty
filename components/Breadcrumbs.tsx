import Link from "next/link";
import type { ReactNode } from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  className = "page-breadcrumb",
}: {
  items: BreadcrumbItem[];
  className?: string;
}): ReactNode {
  return (
    <nav className={className} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index > 0 && <span aria-hidden> / </span>}
          {item.href && index < items.length - 1 ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
