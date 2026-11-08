import { Community } from "@/components/Community";
import { FeaturedArticles } from "@/components/FeaturedArticles";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { ImageOverlayGrid } from "@/components/ImageOverlayGrid";
import { ProductTabsCarousel } from "@/components/ProductTabsCarousel";
import { ShopTheLook } from "@/components/ShopTheLook";
import { overlayGrids } from "@/lib/catalog";
import { getAllArticles, getCollectionProducts } from "@/lib/data";

// Refresh the home page every 30s so catalog edits made in /admin appear
// without a full rebuild. Admin writes also trigger revalidation on demand.
export const revalidate = 30;

export default async function HomePage() {
  const [bestSellers, lenses, articles] = await Promise.all([
    getCollectionProducts("best-sellers"),
    getCollectionProducts("lenses"),
    getAllArticles(),
  ]);

  return (
    <>
      <h1 className="visually-hidden">
        Roman Beauty — salon-grade hair tools, human hair extensions, coloured contact lenses and body
        rituals, dispatched from Dubai.
      </h1>

      <HeroSlideshow />

      <ProductTabsCarousel
        tabLabel="Best Seller"
        collections={[{ handle: "best-sellers", title: "Best Sellers", products: bestSellers }]}
      />

      <ProductTabsCarousel
        className="carousel--lenses"
        collections={[{ handle: "lenses", title: "Colored Lenses", products: lenses }]}
      />

      <ShopTheLook />

      {overlayGrids.map((grid, index) => (
        <ImageOverlayGrid key={`overlay-${index}`} grid={grid} />
      ))}

      <Community />

      <FeaturedArticles articles={articles} />
    </>
  );
}
