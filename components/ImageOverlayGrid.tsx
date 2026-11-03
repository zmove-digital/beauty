import Link from "next/link";

type OverlayGrid = {
  items: { title: string; href: string; image: string; alt: string }[];
};

export function ImageOverlayGrid({ grid }: { grid: OverlayGrid }) {
  return (
    <section className="image-overlay-grid section-light">
      <div className="image-overlay-grid__inner cols-2 no-gap">
        {grid.items.map((item) => (
          <div className="grid-item" key={item.href}>
            <Link
              href={item.href}
              aria-label={`${item.title} shop now`}
              className="image-with-text-overlay has-animated-cta"
            >
              <div className="scaling-image-wrapper">
                <div className="sliding-img-wrapper large-image">
                  <div className="img-slide-bg" style={{ backgroundColor: "#f3f3f4" }} />
                  <div className="image cropped-image-wrapper cropped-image--square is-hover-zoom-in">
                    <img src={item.image} alt={item.alt} loading="lazy" />
                  </div>
                </div>
              </div>

              <div className="image-overlay-end-details">
                <span className="title">{item.title}</span>
                <span className="cta hover-underline">SHOP NOW</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
