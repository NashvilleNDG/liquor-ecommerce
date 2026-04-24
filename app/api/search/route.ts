import { NextRequest, NextResponse } from "next/server";
import { fetchProducts } from "@/lib/kanji-api";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  const products = await fetchProducts();
  const matches = products
    .filter((p) => p.ItemName.toLowerCase().includes(q))
    .slice(0, 8)
    .map((p) => ({ upc: p.ItemUPC, name: p.ItemName, dept: p.Department, price: p.Price }));
  return NextResponse.json(matches);
}
