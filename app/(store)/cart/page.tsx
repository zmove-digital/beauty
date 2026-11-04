import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces in your Youmi Beauty bag.",
};

export default function CartPage() {
  return (
    <div className="sidebar-space">
      <CartView />
    </div>
  );
}
