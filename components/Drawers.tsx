"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navPrimary, navSecondary } from "@/lib/nav";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";
import {
  IconArrowRight,
  IconBag,
  IconChevronDown,
  IconClose,
  IconGlobe,
  IconInstagram,
  IconMinus,
  IconPlus,
  IconSearch,
  IconTikTok,
  IconWhatsApp,
  IconWishlist,
} from "./icons";
import { useStore } from "./providers";

function DrawerHeader({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="drawer-header">
      <div>
        <span className="drawer-eyebrow">{eyebrow}</span>
        <h2 className="drawer-title">{title}</h2>
      </div>
      <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
        <IconClose />
      </button>
    </div>
  );
}

export function Drawers() {
  const {
    drawer,
    closeDrawer,
    cart,
    cartCount,
    subtotal,
    removeLine,
    updateQuantity,
    wishlist,
    toggleWishlist,
    openDrawer,
  } = useStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (drawer === "search") {
      const timer = window.setTimeout(() => searchInput.current?.focus(), 350);
      return () => window.clearTimeout(timer);
    }
  }, [drawer]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        setResults(Array.isArray(payload.products) ? payload.products : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, closeDrawer]);

  const shipping = subtotal >= 300 || subtotal === 0 ? 0 : 25;
  const total = subtotal + shipping;

  return (
    <>
      <div
        className={`sidebar-overlay ${drawer ? "is-visible" : ""}`}
        onClick={closeDrawer}
        aria-hidden
      />

      {/* ------------------------------ NAV ------------------------------ */}
      <section
        className={`noksha-drawer nav-drawer ${drawer === "nav" ? "is-open" : ""}`}
        aria-hidden={drawer !== "nav"}
      >
        <div className="drawer-panel">
          <DrawerHeader eyebrow="Roman Beauty" title="Menu" onClose={closeDrawer} />
          <nav className="nav-drawer-primary" aria-label="Main menu">
            <ul>
              {navPrimary.map((link) => (
                <li key={`${link.label}-${link.href}`} className={link.children ? "has-children" : ""}>
                  <Link href={link.href} onClick={closeDrawer}>
                    {link.label}
                  </Link>
                  {link.children && (
                    <ul className="nav-drawer-children">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} onClick={closeDrawer}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <nav className="nav-drawer-secondary" aria-label="Secondary menu">
            <ul>
              {navSecondary.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={closeDrawer}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="drawer-contact">
            <a href="https://wa.me/+971522888834" target="_blank" rel="noopener noreferrer">
              <IconWhatsApp />
              <span>971 52 288 8834</span>
            </a>
            <a href="mailto:Support@youmibeauty.com">
              <span>Support@youmibeauty.com</span>
            </a>
          </div>
        </div>
      </section>

      {/* ----------------------------- SEARCH ---------------------------- */}
      <section
        className={`noksha-drawer search-drawer ${drawer === "search" ? "is-open" : ""}`}
        aria-hidden={drawer !== "search"}
      >
        <div className="drawer-panel drawer-panel--wide">
          <DrawerHeader eyebrow="Find your next essential" title="Search" onClose={closeDrawer} />
          <div className="search-field">
            <IconSearch />
            <input
              ref={searchInput}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, collections…"
              aria-label="Search products"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <IconClose />
              </button>
            )}
          </div>

          {!query && (
            <div className="search-suggestions">
              <span className="search-suggestions__label">Popular searches</span>
              <div className="chip-row">
                {["GlamDry", "Clip-in", "La Capri", "Bath salts", "Lens solution"].map((term) => (
                  <button key={term} type="button" className="chip" onClick={() => setQuery(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && (
            <div className="search-results">
              <p className="search-results__meta">
                {searching ? "Searching…" : `${results.length} ${results.length === 1 ? "result" : "results"} for “${query}”`}
              </p>
              {!searching && results.length === 0 && (
                <div className="search-empty">
                  <p>We couldn't find a match. Try a category like “lenses” or “hair dryer”.</p>
                  <button type="button" className="btn btn--primary" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                </div>
              )}
              <ul className="search-result-list">
                {results.map((product) => (
                  <li key={product.handle}>
                    <Link href={`/products/${product.handle}`} onClick={closeDrawer}>
                      <img src={product.images[0]?.src} alt={product.images[0]?.alt ?? product.title} />
                      <span className="search-result-info">
                        <span className="search-result-title">{product.title}</span>
                        <span className="search-result-price">{money(product.price)}</span>
                      </span>
                      <IconArrowRight />
                    </Link>
                  </li>
                ))}
              </ul>
              {results.length > 0 && (
                <Link href={`/search?q=${encodeURIComponent(query)}`} className="hover-underline" onClick={closeDrawer}>
                  View all results
                </Link>
              )}
            </div>
          )}

          <div className="drawer-bottom-note">
            <IconGlobe />
            <span>Complimentary shipping over Dhs. 300</span>
          </div>
        </div>
      </section>

      {/* ------------------------------ BAG ------------------------------ */}
      <section
        className={`noksha-drawer bag-drawer ${drawer === "bag" ? "is-open" : ""}`}
        aria-hidden={drawer !== "bag"}
      >
        <div className="drawer-panel drawer-panel--wide bag-panel">
          <DrawerHeader eyebrow="Your selection" title={`Bag (${cartCount})`} onClose={closeDrawer} />

          {cart.length === 0 ? (
            <div className="bag-empty">
              <IconBag />
              <h3>Your bag is empty</h3>
              <p>Discover the tools, extensions and rituals our community loves.</p>
              <Link href="/collections/best-sellers" className="btn btn--primary" onClick={closeDrawer}>
                Shop best sellers
              </Link>
            </div>
          ) : (
            <div className="bag-layout">
              <ul className="bag-lines">
                {cart.map((line) => (
                  <li className="bag-line" key={line.key}>
                    <Link href={`/products/${line.handle}`} onClick={closeDrawer} className="bag-line__image">
                      <img src={line.image} alt={line.title} />
                    </Link>
                    <div className="bag-line__info">
                      <Link href={`/products/${line.handle}`} onClick={closeDrawer} className="bag-line__title">
                        {line.title}
                      </Link>
                      {line.variant && <span className="bag-line__variant">{line.variant}</span>}
                      <div className="bag-line__bottom">
                        <div className="qty-control">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.key, line.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <IconMinus />
                          </button>
                          <span>{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.key, line.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <IconPlus />
                          </button>
                        </div>
                        <span className="bag-line__price">{money(line.price * line.quantity)}</span>
                      </div>
                      <button
                        type="button"
                        className="bag-line__remove"
                        onClick={() => removeLine(line.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <aside className="bag-summary">
                <div className="bag-summary__row">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="bag-summary__row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Complimentary" : money(shipping)}</span>
                </div>
                <div className="bag-summary__row bag-summary__total">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
                <p className="bag-summary__note">
                  {subtotal < 300
                    ? `Add ${money(300 - subtotal)} more for complimentary shipping.`
                    : "Complimentary shipping unlocked. Taxes calculated at checkout."}
                </p>
                <Link href="/checkout" className="btn btn--primary btn--full" onClick={closeDrawer}>
                  Checkout
                </Link>
                <Link href="/cart" className="bag-summary__view" onClick={closeDrawer}>
                  View bag
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------- ACCOUNT ---------------------------- */}
      <section
        className={`noksha-drawer account-drawer ${drawer === "account" ? "is-open" : ""}`}
        aria-hidden={drawer !== "account"}
      >
        <div className="drawer-panel">
          <DrawerHeader eyebrow="Roman Beauty" title="Account" onClose={closeDrawer} />
          <p className="drawer-intro">
            Sign in to follow your orders, save your favourite pieces and check out faster.
          </p>
          <div className="drawer-stack">
            <Link href="/account" className="btn btn--primary btn--full" onClick={closeDrawer}>
              Sign in
            </Link>
            <Link href="/account?mode=register" className="btn btn--outline btn--full" onClick={closeDrawer}>
              Create an account
            </Link>
            <Link href="/account#orders" className="hover-underline" onClick={closeDrawer}>
              Track an order
            </Link>
          </div>
          <div className="drawer-card">
            <h3>Need a hand?</h3>
            <p>Our Dubai team answers within one business day.</p>
            <a href="https://wa.me/+971522888834" target="_blank" rel="noopener noreferrer" className="hover-underline">
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------- WISHLIST --------------------------- */}
      <section
        className={`noksha-drawer wishlist-drawer ${drawer === "wishlist" ? "is-open" : ""}`}
        aria-hidden={drawer !== "wishlist"}
      >
        <div className="drawer-panel">
          <DrawerHeader eyebrow="Saved for later" title={`Wishlist (${wishlist.length})`} onClose={closeDrawer} />
          {wishlist.length === 0 ? (
            <div className="bag-empty bag-empty--compact">
              <IconWishlist />
              <h3>Nothing saved yet</h3>
              <p>Tap the heart on any product to keep it here.</p>
              <Link href="/collections/best-sellers" className="btn btn--primary" onClick={closeDrawer}>
                Browse best sellers
              </Link>
            </div>
          ) : (
            <ul className="wishlist-drawer__items">
              {wishlist.map((item) => (
                <li className="wishlist-drawer__card" key={item.handle}>
                  <Link href={`/products/${item.handle}`} onClick={closeDrawer} className="wishlist-drawer__image">
                    <img src={item.image} alt={item.title} />
                  </Link>
                  <h3>
                    <Link href={`/products/${item.handle}`} onClick={closeDrawer}>
                      {item.title}
                    </Link>
                  </h3>
                  <p>{money(item.price)}</p>
                  <button
                    type="button"
                    className="wishlist-drawer__remove"
                    onClick={() =>
                      toggleWishlist({
                        handle: item.handle,
                        title: item.title,
                        price: item.price,
                        image: item.image,
                      })
                    }
                    aria-label={`Remove ${item.title} from wishlist`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------------------------- LANGUAGE --------------------------- */}
      <section
        className={`noksha-drawer language-drawer ${drawer === "language" ? "is-open" : ""}`}
        aria-hidden={drawer !== "language"}
      >
        <div className="drawer-panel">
          <DrawerHeader eyebrow="Language & currency" title="Language" onClose={closeDrawer} />
          <div className="language-list">
            <button type="button" className="is-selected">
              <span>English</span>
              <span className="language-check">✓</span>
            </button>
            <button type="button" disabled title="Arabic storefront coming soon">
              <span>العربية</span>
              <span className="language-soon">Coming soon</span>
            </button>
          </div>
          <div className="drawer-card">
            <h3>Currency</h3>
            <p>All prices are shown in UAE Dirham (AED) and include VAT where applicable.</p>
            <button type="button" className="currency-select">
              <IconGlobe /> AED — United Arab Emirates <IconChevronDown />
            </button>
          </div>
          <button type="button" className="btn btn--primary btn--full" onClick={() => openDrawer("nav")}>
            Continue shopping
          </button>
        </div>
      </section>
    </>
  );
}
