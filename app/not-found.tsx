import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found template-page">
      <span className="eyebrow">Page not found</span>
      <h1>404</h1>
      <p>
        The page you were looking for has moved, sold out or never existed. Let us help you find
        something beautiful instead.
      </p>
      <Link href="/" className="btn btn--primary">
        Back to home
      </Link>
      <Link href="/collections/best-sellers" className="hover-underline">
        Shop best sellers
      </Link>
    </div>
  );
}
