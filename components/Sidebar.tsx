"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconAccount,
  IconBag,
  IconInstagram,
  IconLanguage,
  IconSearch,
  IconTikTok,
  IconWishlist,
} from "./icons";
import { useStore } from "./providers";

export function Sidebar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const { openDrawer, cartCount, wishlistCount } = useStore();

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled(next);
      document.body.classList.toggle("scrolled", next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = isHome && !scrolled;

  return (
    <>
      <aside
        className={`m-sidebar ${light ? "tone-light" : "tone-dark"}`}
        aria-label="Store navigation"
      >
        <div className="m-sidebar__content">
          <Link href="/" className="m-sidebar__logo" aria-label="Roman Beauty home">
            <img
              src={light ? "/images/Roman_Beauty_Logo_white.png" : "/images/Roman_Beauty_Logo.png"}
              alt="Roman Beauty"
              width={1200}
              height={351}
            />
          </Link>

          <button
            type="button"
            className="hamburger"
            aria-label="Open menu"
            onClick={() => openDrawer("nav")}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className="m-sidebar__nav" aria-label="Quick links">
            <button
              type="button"
              className="nav-icon-btn"
              aria-label="Search"
              onClick={() => openDrawer("search")}
            >
              <IconSearch />
              <strong>Search</strong>
            </button>
            <button
              type="button"
              className="nav-icon-btn"
              aria-label="Account"
              onClick={() => openDrawer("account")}
            >
              <IconAccount />
              <strong>Account</strong>
            </button>
            <button
              type="button"
              className="nav-icon-btn"
              aria-label="Change language"
              onClick={() => openDrawer("language")}
            >
              <IconLanguage />
              <strong>Language</strong>
            </button>
            <button
              type="button"
              className="nav-icon-btn"
              aria-label={`Shopping bag, ${cartCount} items`}
              onClick={() => openDrawer("bag")}
            >
              <span className="nav-icon-wrap">
                <IconBag />
                <span className="cart-count cart-count-icon">{cartCount}</span>
              </span>
              <strong>Bag</strong>
            </button>
            <button
              type="button"
              className="nav-icon-btn"
              aria-label={`Wishlist, ${wishlistCount} items`}
              onClick={() => openDrawer("wishlist")}
            >
              <span className="nav-icon-wrap">
                <IconWishlist />
                {wishlistCount > 0 && (
                  <span className="cart-count cart-count-icon">{wishlistCount}</span>
                )}
              </span>
              <strong>Wishlist</strong>
            </button>
          </nav>

          <div className="sidebar-footer">
            <ul className="social-icons-list">
              <li>
                <a
                  href="https://www.instagram.com/youmibeauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <IconInstagram />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@youmibeauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <IconTikTok />
                </a>
              </li>
            </ul>
            <p>DUBAI · UAE</p>
          </div>
        </div>
      </aside>

      <header className="m-mobile-header">
        <div className="m-mobile-header__content">
          <Link href="/" className="m-mobile-header__logo" aria-label="Roman Beauty home">
            <img src="/images/Roman_Beauty_Logo.png" alt="Roman Beauty" width={1200} height={351} />
          </Link>

          <div className="m-mobile-header__nav">
            <button
              type="button"
              aria-label="Search"
              onClick={() => openDrawer("search")}
            >
              <IconSearch />
            </button>
            <button
              type="button"
              aria-label={`Shopping bag, ${cartCount} items`}
              onClick={() => openDrawer("bag")}
              className="mobile-bag"
            >
              <IconBag />
              <span className="cart-count cart-count-icon">{cartCount}</span>
            </button>
            <button
              type="button"
              className="hamburger"
              aria-label="Open menu"
              onClick={() => openDrawer("nav")}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
