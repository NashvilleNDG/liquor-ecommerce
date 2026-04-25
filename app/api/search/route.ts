import { NextRequest, NextResponse } from "next/server";
import { fetchProducts } from "@/lib/kanji-api";

const HIDDEN_DEPTS = ["DELIVERY FEE", "GROCERY", "Kegs", "KEG", "NOVELTY", "PROMOCODE",
  "Tobacco", "TOBACCO", "CBD", "THC", "Cigarette", "CIGARETTE",
  "CIGARS", "Cigars", "CIGAR", "Vape", "VAPE", "E-Cigarette", "E-CIGARETTE"];

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  const products = await fetchProducts();
  const matches = products
    .filter((p) => !HIDDEN_DEPTS.includes(p.Department))
    .filter((p) => p.ItemName.toLowerCase().includes(q))
    .slice(0, 8)
    .map((p) => ({ upc: p.ItemUPC, name: p.ItemName, dept: p.Department, price: p.Price }));
  return NextResponse.json(matches);
}
