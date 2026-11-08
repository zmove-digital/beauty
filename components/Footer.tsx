import Link from "next/link";
import { IconEmail, IconInstagram, IconTikTok, IconWhatsApp } from "./icons";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner sidebar-space">
        <div className="footer__grid">
          <div className="footer__newsletter width-33">
            <div className="footer__logo">
              <Link href="/" className="footer__logo-link" aria-label="Roman Beauty — Home">
                <img src="/images/Roman_Beauty_Logo_white.png" alt="Roman Beauty" width={1200} height={351} />
              </Link>
            </div>
            <NewsletterForm />
          </div>

          <div className="footer__menu width-15">
            <div className="footer__menu-title">
              <span>HAIR ESSENTIALS</span>
            </div>
            <nav className="footer__menu-links" aria-label="Hair essentials">
              <Link href="/products/roman-beauty-hair-curler">Hair Curler</Link>
              <Link href="/collections/hair-dryer">Hair Dryer</Link>
              <Link href="/collections/hair-tools">Hair Tools</Link>
            </nav>
          </div>

          <div className="footer__menu width-15">
            <div className="footer__menu-title">
              <span>LENSES</span>
            </div>
            <nav className="footer__menu-links" aria-label="Lenses">
              <Link href="/collections/colored-contact-lenses-without-power-monthly">
                Colored Contact Lenses Without Power
              </Link>
              <Link href="/collections/colored-contact-lenses-with-power-monthly">
                Colored Contact Lenses With Power
              </Link>
              <Link href="/products/roman-beauty-lens-solution-120-ml">Lens Solution</Link>
            </nav>
          </div>

          <div className="footer__get-in-touch width-33">
            <div className="footer__menu-title">
              <span>Get in Touch</span>
            </div>
            <div className="get-in-touch-links">
              <div className="icon-box">
                <span className="ref-icon">
                  <IconWhatsApp />
                </span>
                <div className="inner-text">
                  <span className="text">Talk to us on Whatsapp</span>
                  <a className="contact-link" href="https://wa.me/+971522888834" target="_blank" rel="noopener noreferrer">
                    +971 52 288 8834
                  </a>
                </div>
              </div>
              <div className="icon-box">
                <span className="ref-icon">
                  <IconEmail />
                </span>
                <div className="inner-text">
                  <span className="text">Email us</span>
                  <a className="contact-link" href="mailto:support@romanbeauty.com">
                    support@romanbeauty.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__copyright">
            <span>© 2026</span>
            <p>ROMAN BEAUTY. All rights reserved.</p>
          </div>

          <div className="footer__payments" aria-label="Accepted payment methods">
            <div className="payment-icons">
              <span className="payment-icon payment-icon--visa">VISA</span>
              <span className="payment-icon payment-icon--mc" aria-label="Mastercard">
                <i className="mc-red" />
                <i className="mc-yellow" />
              </span>
              <span className="payment-icon payment-icon--amex">AMEX</span>
              <span className="payment-icon payment-icon--apple"> Pay</span>
              <span className="payment-icon payment-icon--google">G Pay</span>
              <span className="payment-icon payment-icon--tabby">tabby</span>
              <span className="payment-icon payment-icon--tamara">tamara</span>
            </div>
          </div>

          <div className="footer__socials">
            <a href="https://www.instagram.com/youmibeauty" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IconInstagram />
            </a>
            <a href="https://www.tiktok.com/@youmibeauty" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <IconTikTok />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
