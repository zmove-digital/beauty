export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const navPrimary: NavLink[] = [
  { label: "RB Technique", href: "/collections/rb-technique" },
  { label: "Rituals", href: "/collections/rituals" },
  { label: "Body Care", href: "/collections/body-care" },
  { label: "Hair Care", href: "/collections/hair-care" },
  {
    label: "Contact Lenses",
    href: "/collections/lenses",
    children: [
      { label: "Without Power Monthly", href: "/collections/colored-contact-lenses-without-power-monthly" },
      { label: "With Power Monthly", href: "/collections/colored-contact-lenses-with-power-monthly" },
      { label: "Lens Solution", href: "/products/roman-beauty-lens-solution-120-ml" },
    ],
  },
  { label: "Clip-In Extensions", href: "/collections/hair-clip-in-extensions" },
  { label: "Tape-In Extensions", href: "/collections/tape-in-extension" },
  { label: "Ponytail Extensions", href: "/collections/ponytail-hair-extension" },
  { label: "Hair Curler", href: "/products/roman-beauty-hair-curler" },
  { label: "Hair Dryer", href: "/collections/hair-dryer" },
  { label: "Eye Lashes", href: "/collections/eye-lashes" },
  { label: "Hair Essentials", href: "/collections/hair-essentials" },
];

export const navSecondary: NavLink[] = [
  { label: "BEST SELLERS", href: "/collections/best-sellers" },
  { label: "FAQ", href: "/pages/frequently-asked-questions" },
  { label: "ABOUT YB", href: "/pages/about" },
  { label: "ORGANIZATION BLOG", href: "/blogs/organization-blog" },
  { label: "PRESS", href: "/pages/press" },
  { label: "WHOLESALER", href: "/pages/wholesale" },
  { label: "AFFILIATE", href: "/pages/affiliate" },
  { label: "HOME HAIR SERVICES", href: "/collections/home-hair-services" },
  { label: "WISHLIST", href: "/wishlist" },
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Refund Policy", href: "/policies/refund-policy" },
  { label: "Shipping Policy", href: "/policies/shipping-policy" },
];
