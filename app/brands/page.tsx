import { fetchProducts } from "@/lib/kanji-api";
import { extractBrand, normalizeBrand } from "@/lib/brands";
import { getProductImage } from "@/lib/product-images";
import { existsSync, readFileSync } from "fs";
import path from "path";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandsClient from "./BrandsClient";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const HIDDEN_DEPTS = [
  "DELIVERY FEE", "GROCERY", "Kegs", "KEG", "NOVELTY", "PROMOCODE",
  "Tobacco", "TOBACCO", "CBD", "THC", "Cigarette", "CIGARETTE",
  "CIGARS", "Cigars", "CIGAR", "Vape", "VAPE", "E-Cigarette", "E-CIGARETTE",
];

function loadImageCache(): Record<string, string | null> {
  try {
    const file = path.join(process.cwd(), "data", "product-images-cache.json");
    if (!existsSync(file)) return {};
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch { return {}; }
}

export default async function BrandsPage() {
  const allProducts = await fetchProducts();
  const imageCache = loadImageCache();

  const visible = allProducts.filter(
    (p) => !HIDDEN_DEPTS.includes(p.Department) && Number(p.CurrentStock) > 0
  );

  // Build brand map: name → { count, image }
  const brandMap = new Map<string, { count: number; image: string | null }>();
  for (const p of visible) {
    const name = normalizeBrand(extractBrand(p.ItemName));
    const existing = brandMap.get(name);
    const imgUrl = getProductImage(p.ItemUPC) ?? imageCache[p.ItemUPC] ?? null;

    if (!existing) {
      brandMap.set(name, { count: 1, image: imgUrl });
    } else {
      // Keep first good image we find
      brandMap.set(name, {
        count: existing.count + 1,
        image: existing.image ?? imgUrl,
      });
    }
  }

  const brands = Array.from(brandMap.entries())
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .map(([name, { count, image }]) => ({ name, count, image }));

  const totalProducts = brands.reduce((sum, b) => sum + b.count, 0);

  return (
    <>
      <Navbar />

      {/* ── Client grid ── */}
      <BrandsClient brands={brands} />

      <Footer />
    </>
  );
}
