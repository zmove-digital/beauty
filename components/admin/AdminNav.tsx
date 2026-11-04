"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Visão geral", exact: true },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/collections", label: "Coleções" },
  { href: "/admin/articles", label: "Artigos" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/subscribers", label: "Newsletter" },
];

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";

  return (
    <nav className="admin-nav" aria-label="Admin">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
