import { Suspense } from "react";
import { fetchProducts } from "@/lib/kanji-api";
import { deduplicateByVariant, getBaseName } from "@/lib/product-variants";
import { readTags } from "@/lib/pairing-tags";
import { readOverrides } from "@/lib/product-overrides";
import { loadImageCache, resolveProductImage } from "@/lib/image-cache";
import ShopClient from "./ShopClient";

export const revalidate = 300;

const DEPT_ORDER = ["BEER", "Wines", "LIQUOR", "CBD", "Cigarette", "CIGARS", "Soda", "MIXERS"];
const HIDDEN_DEPTS = ["DELIVERY FEE", "GROCERY", "Kegs", "KEG", "NOVELTY", "PROMOCODE", "Tobacco", "TOBACCO", "CBD", "THC", "Cigarette", "CIGARETTE", "CIGARS", "Cigars", "CIGAR", "Vape", "VAPE", "E-Cigarette", "E-CIGARETTE"];

export default async function ShopPage() {
  const [allProducts, overrides] = await Promise.all([
    fetchProducts(),
    Promise.resolve(readOverrides()),
  ]);

  // Build variant count map: baseName::dept → total count
  const variantCount = new Map<string, number>();
  for (const p of allProducts) {
    const key = `${p.Department}::${getBaseName(p.ItemName)}`;
    variantCount.set(key, (variantCount.get(key) ?? 0) + 1);
  }

  const imageCache = loadImageCache();

  // Filter hidden products, then deduplicate variants
  const visible = allProducts.filter(
    (p) => !HIDDEN_DEPTS.includes(p.Department) && !overrides[p.ItemUPC]?.hidden
  );

  const products = deduplicateByVariant(visible).map((p) => {
    const ov = overrides[p.ItemUPC];
    return {
      ...p,
      // Apply price override (replaces what's shown to the customer)
      Price:         ov?.onlinePrice ?? p.Price,
      _variantCount: variantCount.get(`${p.Department}::${getBaseName(p.ItemName)}`) ?? 1,
      _imageUrl:     resolveProductImage(p.ItemUPC, ov?.imageUrl, imageCache),
      _featured:     ov?.featured ?? false,
      _label:        ov?.label ?? null,
    };
  });

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
