import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Youmi Beauty order — dispatched from Dubai.",
};

export default function CheckoutPage() {
  return (
    <div className="sidebar-space">
      <CheckoutForm />
    </div>
  );
}
