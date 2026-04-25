// Manually verified images (highest priority)
const STATIC_MAP: Record<string, string> = {
  "018200007712": "https://images.openfoodfacts.org/images/products/001/820/000/7712/front_en.3.400.jpg",
  "018200007699": "https://images.openfoodfacts.org/images/products/001/820/000/7699/front_en.8.400.jpg",
  "034100575090": "https://images.openfoodfacts.org/images/products/003/410/057/5090/front_en.3.400.jpg",
  "71990300906":  "https://images.openfoodfacts.org/images/products/007/199/030/1033/front_en.20.400.jpg",
  "33544000175":  "https://images.openfoodfacts.org/images/products/000/007/503/2814/front_en.127.400.jpg",
};

export function getProductImage(upc: string): string | null {
  return STATIC_MAP[upc] ?? null;
}
