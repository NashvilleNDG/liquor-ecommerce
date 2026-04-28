// Client-safe: no fs/path imports — used by both client and server components

const STATIC_MAP: Record<string, string> = {
  "018200007712": "https://images.openfoodfacts.org/images/products/001/820/000/7712/front_en.3.400.jpg",
  "018200007699": "https://images.openfoodfacts.org/images/products/001/820/000/7699/front_en.8.400.jpg",
  "034100575090": "https://images.openfoodfacts.org/images/products/003/410/057/5090/front_en.3.400.jpg",
};

export function getProductImage(upc: string): string | null {
  return STATIC_MAP[upc] ?? null;
}
