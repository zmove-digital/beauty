import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await searchProducts(query);
    return NextResponse.json({ products: products.slice(0, 12), total: products.length });
  } catch (error) {
    console.error("[api/search]", error);
    return NextResponse.json({ products: [], total: 0, error: "Search is unavailable." }, { status: 500 });
  }
}
