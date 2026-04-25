import { existsSync, readFileSync } from "fs";
import path from "path";

// Manually verified images (highest priority)
const STATIC_MAP: Record<string, string> = {
  "018200007712": "https://images.openfoodfacts.org/images/products/001/820/000/7712/front_en.3.400.jpg",
  "018200007699": "https://images.openfoodfacts.org/images/products/001/820/000/7699/front_en.8.400.jpg",
  "034100575090": "https://images.openfoodfacts.org/images/products/003/410/057/5090/front_en.3.400.jpg",
  "71990300906":  "https://images.openfoodfacts.org/images/products/007/199/030/1033/front_en.20.400.jpg",
  "33544000175":  "https://images.openfoodfacts.org/images/products/000/007/503/2814/front_en.127.400.jpg",
};

// Cache built by scripts/fetch-product-images.mjs
function loadCache(): Record<string, string | null> {
  try {
    const file = path.join(process.cwd(), "data", "product-images-cache.json");
    if (!existsSync(file)) return {};
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    return {};
  }
}

let _cache: Record<string, string | null> | null = null;
function getCache() {
  if (!_cache) _cache = loadCache();
  return _cache;
}

export function getProductImage(upc: string): string | null {
  if (STATIC_MAP[upc]) return STATIC_MAP[upc];
  const cached = getCache()[upc];
  return cached ?? null;
}
