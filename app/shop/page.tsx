import { Suspense } from "react";
import { fetchProducts } from "@/lib/kanji-api";
import { deduplicateByVariant, getBaseName } from "@/lib/product-variants";
import { readTags } from "@/lib/pairing-tags";
import ShopClient from "./ShopClient";

export const revalidate = 300;

const DEPT_ORDER = ["BEER", "Wines", "LIQUOR", "CBD", "Cigarette", "CIGARS", "Soda", "MIXERS"];
const HIDDEN_DEPTS = ["DELIVERY FEE", "GROCERY", "Kegs", "KEG", "NOVELTY", "PROMOCODE", "Tobacco", "TOBACCO", "CBD", "THC"];

export default async function ShopPage() {
  const allProducts = await fetchProducts();

  // Build variant count map: baseName::dept → total count
  const variantCount = new Map<string, number>();
  for (const p of allProducts) {
    const key = `${p.Department}::${getBaseName(p.ItemName)}`;
    variantCount.set(key, (variantCount.get(key) ?? 0) + 1);
  }

  // Show only the lowest-price variant per product group in the grid
  const products = deduplicateByVariant(allProducts.filter(p => !HIDDEN_DEPTS.includes(p.Department))).map((p) => ({
    ...p,
    _variantCount: variantCount.get(`${p.Department}::${getBaseName(p.ItemName)}`) ?? 1,
  }));

  const departments = [
    ...DEPT_ORDER.filter((d) => products.some((p) => p.Department === d)),
    ...Array.from(new Set(products.map((p) => p.Department)))
      .filter((d) => !DEPT_ORDER.includes(d))
      .sort(),
  ];

  const pairingTagsMap = readTags();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-500">Loading…</div>}>
      <ShopClient products={products} departments={departments} pairingTagsMap={pairingTagsMap} />
    </Suspense>
  );
}
