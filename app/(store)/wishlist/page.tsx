import type { Metadata } from "next";
import { WishlistView } from "@/components/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Pieces you have saved from the Youmi Beauty collection.",
};

export default function WishlistPage() {
  return (
    <div className="sidebar-space">
      <WishlistView />
    </div>
  );
}
