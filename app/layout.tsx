import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Drawers } from "@/components/Drawers";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { StoreProvider } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Youmi Beauty — Hair, Lenses & Rituals | Dubai",
    template: "%s | Youmi Beauty",
  },
  description:
    "Youmi Beauty — salon-grade hair tools, human hair extensions, colored contact lenses and body rituals, dispatched from Dubai to the world.",
  keywords: [
    "Youmi Beauty",
    "hair dryer Dubai",
    "clip in hair extensions",
    "colored contact lenses",
    "tape in extensions",
    "body care UAE",
  ],
  openGraph: {
    title: "Youmi Beauty — Hair, Lenses & Rituals",
    description:
      "Salon-grade hair tools, human hair extensions, colored contact lenses and body rituals, dispatched from Dubai.",
    type: "website",
    locale: "en_AE",
    siteName: "Youmi Beauty",
    images: ["/images/ICONIC_HAIR_DRYER.jpg"],
  },
  icons: {
    icon: "/images/Youmi_Beauty_Logo.png",
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
      <body>
        <StoreProvider>
          <AnnouncementBar />
          <Sidebar />
          <Drawers />
          <main className="page-main" id="main">
            {children}
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
