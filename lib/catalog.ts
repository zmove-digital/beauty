import catalogData from "@/data/catalog.json";
import type { Article, Collection, Product } from "./types";

type Catalog = {
  collections: Collection[];
  products: Product[];
  articles: Article[];
};

export const catalog = catalogData as Catalog;

export const collections: Collection[] = catalog.collections;
export const products: Product[] = catalog.products;
export const articles: Article[] = catalog.articles;

export function getCatalogProduct(handle: string): Product | undefined {
  return products.find((product) => product.handle === handle);
}

export function getCatalogCollection(handle: string): Collection | undefined {
  return collections.find((collection) => collection.handle === handle);
}

export function getCatalogArticle(handle: string): Article | undefined {
  return articles.find((article) => article.handle === handle);
}

export function catalogProductsByCollection(handle: string): Product[] {
  if (handle === "lenses") {
    return products.filter((product) => product.collections.includes("lenses"));
  }
  if (handle === "home-hair-services") {
    return products.filter((product) =>
      product.collections.some((c) => ["yb-technique", "hair-tools"].includes(c))
    );
  }
  return products.filter((product) => product.collections.includes(handle));
}

export function searchCatalog(query: string): Product[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  const words = term.split(/\s+/);
  return products.filter((product) => {
    const haystack = [
      product.title,
      product.subtitle,
      product.category,
      ...product.collections,
      ...product.images.map((image) => image.alt),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

export const shopTheLook = {
  eyebrow: "SHOP THE LOOK",
  heading: "Complete your styling set",
  text: "Discover the essential tools designed to create effortless, salon-quality results at home.",
  image: "/images/Youmi_beauty_glam_dryer_styling_set.png",
  products: [
    { handle: "youmi-beauty-glamdry", title: "GlamDry Hair Dryer", price: 462, image: "/images/POST4.png", hotspot: { top: "40%", left: "50%" } },
    { handle: "youmi-beauty-hair-dryer-1300w", title: "Hair Dryer 1300W | Roman Beauty", price: 294, image: "/images/K67A2193copy.jpg", hotspot: { top: "40%", left: "50%" } },
    { handle: "ash-blonde-ponytail-hair-extension", title: "Ash Blonde — Ponytail Extension | Roman Beauty", price: 1050, image: "/images/002A8020.jpg", hotspot: { top: "90%", left: "50%" } },
  ],
};

export const overlayGrids = [
  {
    items: [
      { title: "BODY CARE", href: "/collections/body-care", image: "/images/Body_wash_youmi_beauty.jpg", alt: "Body care" },
      { title: "CLIP IN EXTENSIONS", href: "/collections/hair-clip-in-extensions", image: "/images/youmi_beauty_clip_in_hair_extensions_best_in_Dubai.jpg", alt: "Clip in extensions" },
    ],
  },
  {
    items: [
      { title: "HAIR TOOLS", href: "/collections/hair-tools", image: "/images/Youmi_beauty_Hair_Extensions_colored_contact_lenses_hair_curler_hair_dryer.jpg", alt: "Hair tools" },
      { title: "TAPE IN EXTENSIONS", href: "/collections/tape-in-extension", image: "/images/Youmi_beauty_glam_dryer_styling_set.png", alt: "Tape in extensions" },
    ],
  },
];

export const communityVideos = [
  {
    src: "https://youmibeauty.com/cdn/shop/videos/c/vp/4cfe1f7b573e46cbbb7d59502dcc59c1/4cfe1f7b573e46cbbb7d59502dcc59c1.HD-1080p-7.2Mbps-95991338.mp4?v=0",
    poster: "/images/4cfe1f7b573e46cbbb7d59502dcc59c1.thumbnail.0000000000_800x.jpg",
  },
  {
    src: "https://youmibeauty.com/cdn/shop/videos/c/vp/3fda8477b279480aabe6425d55ab90a0/3fda8477b279480aabe6425d55ab90a0.HD-1080p-7.2Mbps-95991335.mp4?v=0",
    poster: "/images/3fda8477b279480aabe6425d55ab90a0.thumbnail.0000000000_800x.jpg",
  },
  {
    src: "https://youmibeauty.com/cdn/shop/videos/c/vp/bd60f1db53c24b1492140683babb187b/bd60f1db53c24b1492140683babb187b.HD-1080p-7.2Mbps-95991339.mp4?v=0",
    poster: "/images/bd60f1db53c24b1492140683babb187b.thumbnail.0000000000_800x.jpg",
  },
  {
    src: "https://youmibeauty.com/cdn/shop/videos/c/vp/590c847d916046f0873d7eca92c78639/590c847d916046f0873d7eca92c78639.HD-1080p-7.2Mbps-95991336.mp4?v=0",
    poster: "/images/590c847d916046f0873d7eca92c78639.thumbnail.0000000000_800x.jpg",
  },
];

export const announcementMessages = [
  "APPLE PAY IS AVAILABLE NOW !",
  "BUY NOW PAY LATER TAMARA IN UAE",
  "BUY NOW PAY LATER TABBY IN UAE - KSA",
];


