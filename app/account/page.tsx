import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";

export const metadata: Metadata = {
  title: "Your account",
  description: "Sign in, create a Youmi Beauty account and follow your orders.",
};

type PageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function AccountPage({ searchParams }: PageProps) {
  const { mode } = await searchParams;

  return (
    <div className="sidebar-space">
      <AccountPanel mode={mode === "register" ? "register" : "login"} />
    </div>
  );
}
