import { Suspense } from "react";
import Link from "next/link";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fetchProducts } from "@/lib/kanji-api";
import { extractBrand, normalizeBrand } from "@/lib/brands";
import { deduplicateByVariant, getBaseName } from "@/lib/product-variants";
import { readTags } from "@/lib/pairing-tags";
import { getProductImage } from "@/lib/product-images";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopClient from "@/app/shop/ShopClient";

export const dynamic = "force-dynamic";

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
  } catch {
    return {};
  }
}

interface PageProps {
  params: Promise<{ brand: string }>;
}

export default async function BrandPage({ params }: PageProps) {
  const { brand: brandParam } = await params;
  const brandName = decodeURIComponent(brandParam);

  const allProducts = await fetchProducts();

  // Filter hidden depts + in stock
  const visible = allProducts.filter(
    (p) => !HIDDEN_DEPTS.includes(p.Department) && Number(p.CurrentStock) > 0
  );

  // Filter to products belonging to this brand (case-insensitive)
  const brandProducts = visible.filter(
    (p) => normalizeBrand(extractBrand(p.ItemName)).toLowerCase() === brandName.toLowerCase()
  );

  // Build variant count map for the brand's products
  const variantCount = new Map<string, number>();
  for (const p of brandProducts) {
    const key = `${p.Department}::${getBaseName(p.ItemName)}`;
    variantCount.set(key, (variantCount.get(key) ?? 0) + 1);
  }

  const imageCache = loadImageCache();

  const products = deduplicateByVariant(brandProducts).map((p) => ({
    ...p,
    _variantCount: variantCount.get(`${p.Department}::${getBaseName(p.ItemName)}`) ?? 1,
    _imageUrl: getProductImage(p.ItemUPC) ?? imageCache[p.ItemUPC] ?? null,
  }));

  // Derive departments from this brand's products
  const DEPT_ORDER = ["BEER", "Wines", "LIQUOR", "Soda", "MIXERS"];
  const departments = [
    ...DEPT_ORDER.filter((d) => products.some((p) => p.Department === d)),
    ...Array.from(new Set(products.map((p) => p.Department)))
      .filter((d) => !DEPT_ORDER.includes(d))
      .sort(),
  ];

  const pairingTagsMap = readTags();

  return (
    <>
      <Navbar />

      {/* Brand header */}
      <div className="bg-white border-b border-stone-200 py-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <nav className="text-sm text-stone-400 mb-2">
            <Link href="/brands" className="hover:text-crimson transition-colors">
              All Brands
            </Link>
            {" / "}
            <span className="text-stone-700">{brandName}</span>
          </nav>
          <h1 className="text-3xl font-bold text-stone-900">{brandName}</h1>
          <p className="text-stone-500 mt-1">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-stone-500">
            Loading…
          </div>
        }
      >
        <ShopClient
          products={products}
          departments={departments}
          pairingTagsMap={pairingTagsMap}
        />
      </Suspense>

      <Footer />
    </>
  );
}
