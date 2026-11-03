import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: { email?: unknown; consent?: unknown };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const consent = payload.consent !== false;

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const admin = getAdminClient();
  let persisted = false;

  if (admin) {
    const { error } = await admin
      .from("newsletter_subscribers")
      .upsert({ email, consent }, { onConflict: "email" });

    if (error) {
      console.warn("[api/newsletter] Supabase insert failed:", error.message);
    } else {
      persisted = true;
    }
  }

  return NextResponse.json({
    message: "Thank you — you're on the list.",
    persisted,
  });
}
