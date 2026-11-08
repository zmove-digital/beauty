import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Roman Beauty — Hair, Lenses & Rituals | Dubai",
    template: "%s | Roman Beauty",
  },
  description:
    "Roman Beauty — salon-grade hair tools, human hair extensions, colored contact lenses and body rituals, dispatched from Dubai to the world.",
  keywords: [
    "Roman Beauty",
    "hair dryer Dubai",
    "clip in hair extensions",
    "colored contact lenses",
    "tape in extensions",
    "body care UAE",
  ],
  openGraph: {
    title: "Roman Beauty — Hair, Lenses & Rituals",
    description:
      "Salon-grade hair tools, human hair extensions, colored contact lenses and body rituals, dispatched from Dubai.",
    type: "website",
    locale: "en_AE",
    siteName: "Roman Beauty",
    images: ["/images/ICONIC_HAIR_DRYER.jpg"],
  },
  icons: {
    icon: "/images/Roman_Beauty_Icon.png",
    shortcut: "/images/Roman_Beauty_Icon.png",
    apple: "/images/Roman_Beauty_Icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f3f4",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
