"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/types";

export type DrawerName = "nav" | "search" | "bag" | "account" | "wishlist" | "language" | null;

export type WishlistItem = {
  handle: string;
  title: string;
  price: number;
  image: string;
};

type StoreContextValue = {
  hydrated: boolean;
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  addLine: (line: Omit<CartLine, "key">) => void;
  removeLine: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  drawer: DrawerName;
  openDrawer: (drawer: Exclude<DrawerName, null>) => void;
  closeDrawer: () => void;
  wishlist: WishlistItem[];
  wishlistCount: number;
  isWished: (handle: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "youmi.cart.v1";
const WISHLIST_KEY = "youmi.wishlist.v1";

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [drawer, setDrawer] = useState<DrawerName>(null);

  useEffect(() => {
    setCart(readStorage<CartLine[]>(CART_KEY, []));
    setWishlist(readStorage<WishlistItem[]>(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    document.body.classList.toggle("drawer-open", Boolean(drawer));
    return () => document.body.classList.remove("drawer-open");
  }, [drawer]);

  const openDrawer = useCallback((next: Exclude<DrawerName, null>) => {
    setDrawer(next);
  }, []);

  const closeDrawer = useCallback(() => setDrawer(null), []);

  const addLine = useCallback((line: Omit<CartLine, "key">) => {
    const key = `${line.handle}::${line.variant ?? "default"}`;
    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + line.quantity } : item
        );
      }
      return [...current, { ...line, key }];
    });
    setDrawer("bag");
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((current) => current.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) => (item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist((current) => {
      if (current.some((entry) => entry.handle === item.handle)) {
        return current.filter((entry) => entry.handle !== item.handle);
      }
      return [...current, item];
    });
  }, []);

  const isWished = useCallback(
    (handle: string) => wishlist.some((entry) => entry.handle === handle),
    [wishlist]
  );

  const value = useMemo<StoreContextValue>(() => {
    const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
    const subtotal = cart.reduce((total, line) => total + line.price * line.quantity, 0);
    return {
      hydrated,
      cart,
      cartCount,
      subtotal,
      addLine,
      removeLine,
      updateQuantity,
      clearCart,
      drawer,
      openDrawer,
      closeDrawer,
      wishlist,
      wishlistCount: wishlist.length,
      isWished,
      toggleWishlist,
    };
  }, [
    hydrated,
    cart,
    addLine,
    removeLine,
    updateQuantity,
    clearCart,
    drawer,
    openDrawer,
    closeDrawer,
    wishlist,
    isWished,
    toggleWishlist,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside <StoreProvider>");
  return context;
}
