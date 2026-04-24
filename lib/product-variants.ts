import type { Product } from "./kanji-api";

// Matches volume sizes: 50ML, 1.75L, 1 OZ, etc.
const SIZE_VOL = /\b\d+(\.\d+)?\s*(ML|CL|L|OZ|GAL|LITER|LITRE)\b/gi;
// Matches written fractions used as sizes: "1 4 PINT", "1/4 PINT"
const SIZE_FRAC = /\b\d+\s*[/]?\s*\d+\s*(PINT|PINTS|QT|QUART|GALLON)\b/gi;
// Matches pack descriptors: 10PK, 6 PACK, 20X50ML
const SIZE_PACK = /\b\d+\s*(PK|PACK|CT|COUNT)\b|\b\d+\s*X\s*\d+(\.\d+)?\s*(ML|L|OZ)\b/gi;
// Container / material words that appear after stripping sizes
const CONTAINER = /\b(PLASTIC|GLASS|BOTTLE|BOTTLES|CANS?|PET|KEG|BARREL|DRAFT|CAN)\b/gi;

/** Strip size/pack/container info to get a comparable base name */
export function getBaseName(name: string): string {
  return name
    .replace(SIZE_VOL, "")
    .replace(SIZE_FRAC, "")
    .replace(SIZE_PACK, "")
    .replace(CONTAINER, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toUpperCase();
}

/** Find all size variants of a product in the full catalog */
export function getVariants(product: Product, allProducts: Product[]): Product[] {
  const base = getBaseName(product.ItemName);
  if (!base) return [];

  return allProducts
    .filter(
      (p) =>
        p.Department === product.Department &&
        p.ItemUPC !== product.ItemUPC &&
        getBaseName(p.ItemName) === base
    )
    .sort((a, b) => Number(a.Price) - Number(b.Price));
}

/** Group products so only the cheapest variant per base name shows in the grid */
export function deduplicateByVariant(products: Product[]): Product[] {
  const seen = new Map<string, Product>();

  for (const p of products) {
    const key = `${p.Department}::${getBaseName(p.ItemName)}`;
    const existing = seen.get(key);
    if (!existing || Number(p.Price) < Number(existing.Price)) {
      seen.set(key, p);
    }
  }

  return Array.from(seen.values());
}
