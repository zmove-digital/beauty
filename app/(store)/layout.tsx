import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Drawers } from "@/components/Drawers";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { StoreProvider } from "@/components/providers";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AnnouncementBar />
      <Sidebar />
      <Drawers />
      <main className="page-main" id="main">
        {children}
      </main>
      <Footer />
    </StoreProvider>
  );
}
