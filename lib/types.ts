export type ProductImage = {
  src: string;
  alt: string;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductDetail = {
  title: string;
  content: string;
};

export type Product = {
  handle: string;
  title: string;
  subtitle?: string;
  price: number;
  compareAtPrice?: number | null;
  category: string;
  badge?: string | null;
  soldOut?: boolean;
  featured?: boolean;
  images: ProductImage[];
  collections: string[];
  options: ProductOption[];
  metadata: Record<string, string>;
  description: string;
  details: ProductDetail[];
  position?: number;
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  image?: string | null;
  position?: number;
};

export type Article = {
  handle: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  content: string;
};

export type CartLine = {
  key: string;
  handle: string;
  title: string;
  price: number;
  image: string;
  variant?: string;
  quantity: number;
};

export type StoreOrder = {
  orderNumber: string;
  email: string;
  subtotal: number;
  shipping: number;
  total: number;
};
