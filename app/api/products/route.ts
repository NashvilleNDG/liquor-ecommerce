import { NextResponse } from "next/server";
import { fetchProducts } from "@/lib/kanji-api";

export async function GET() {
  try {
    const products = await fetchProducts();
    return NextResponse.json({ products, total: products.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
