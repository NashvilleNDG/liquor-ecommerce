import { existsSync, readFileSync } from "fs";
import path from "path";
import { fetchProducts } from "@/lib/kanji-api";
import { deduplicateByVariant } from "@/lib/product-variants";
import ImagesAdminClient from "./ImagesAdminClient";

export const dynamic = "force-dynamic";

const HIDDEN_DEPTS = ["DELIVERY FEE", "GROCERY", "Kegs", "KEG", "NOVELTY", "PROMOCODE",
  "Tobacco", "TOBACCO", "CBD", "THC", "Cigarette", "CIGARETTE",
  "CIGARS", "Cigars", "CIGAR", "Vape", "VAPE", "E-Cigarette", "E-CIGARETTE"];

function loadCache(): Record<string, string | null> {
  try {
    const file = path.join(process.cwd(), "data", "product-images-cache.json");
    if (!existsSync(file)) return {};
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch { return {}; }
}

export default async function AdminImagesPage() {
  const allProducts = await fetchProducts();
  const products = deduplicateByVariant(
    allProducts.filter(p => Number(p.CurrentStock) > 0 && !HIDDEN_DEPTS.includes(p.Department))
  ).map(p => ({ ItemUPC: p.ItemUPC, ItemName: p.ItemName, Department: p.Department, Price: p.Price }));

  return <ImagesAdminClient products={products} initialCache={loadCache()} />;
}
