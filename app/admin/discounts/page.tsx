import { readFileSync, existsSync } from "fs";
import path from "path";
import type { Discount } from "@/app/api/discounts/route";
import DiscountsAdminClient from "./DiscountsAdminClient";
import { fetchProducts } from "@/lib/kanji-api";
import { deduplicateByVariant } from "@/lib/product-variants";

export const dynamic = "force-dynamic";

function readDiscounts(): Discount[] {
  const file = path.join(process.cwd(), "data", "discounts.json");
  if (!existsSync(file)) return [];
  try { return JSON.parse(readFileSync(file, "utf-8")); } catch { return []; }
}

export default async function AdminDiscountsPage() {
  const allProducts = await fetchProducts();
  const products = deduplicateByVariant(allProducts.filter(p => Number(p.CurrentStock) > 0))
    .map(p => ({ ItemUPC: p.ItemUPC, ItemName: p.ItemName, Department: p.Department, Price: p.Price }));
  return <DiscountsAdminClient initialDiscounts={readDiscounts()} products={products} />;
}
