import Link from "next/link";
import { money } from "@/lib/format";
import { shopTheLook } from "@/lib/catalog";
import { IconArrowRight } from "./icons";

export function ShopTheLook() {
  return (
    <section className="shop-the-look section-light">
      <div className="full-width">
        <div className="shop-the-look__inner">
          <div className="shop-the-look__media">
            <div className="shop-the-look__image">
              <div className="image cropped-image-wrapper cropped-image--square">
                <img src={shopTheLook.image} alt={shopTheLook.heading} loading="lazy" />
              </div>

              {shopTheLook.products.map((product) => (
                <div
                  className="shop-the-look__hotspot"
                  key={product.handle}
                  style={product.hotspot}
                >
                  <Link
                    href={`/products/${product.handle}`}
                    className="shop-the-look__hotspot-button"
                    aria-label={product.title}
                  >
                    <span className="shop-the-look__hotspot-pulse" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="shop-the-look__content space-right section-x-padding">
            <span className="shop-the-look__eyebrow h6">{shopTheLook.eyebrow}</span>
            <h2 className="shop-the-look__heading h2">{shopTheLook.heading}</h2>
            <div className="shop-the-look__text rte">
              <p>{shopTheLook.text}</p>
            </div>

            <ul className="shop-the-look__products">
              {shopTheLook.products.map((product) => (
                <li className="shop-the-look__product" key={product.handle}>
                  <Link href={`/products/${product.handle}`} className="shop-the-look__product-link">
                    <div className="shop-the-look__product-thumb">
                      <div className="image cropped-image-wrapper cropped-image--square">
                        <img src={product.image} alt={product.title} loading="lazy" />
                      </div>
                    </div>
                    <div className="shop-the-look__product-info">
                      <p className="shop-the-look__product-title">{product.title}</p>
                    </div>
                    <div className="shop-the-look__product-price">{money(product.price)}</div>
                  </Link>
                </li>
              ))}
            </ul>

            <Link href="/collections/best-sellers" className="btn btn-arrow shop-the-look__button">
              SHOP THE COLLECTION
              <span className="icon">
                <IconArrowRight />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
