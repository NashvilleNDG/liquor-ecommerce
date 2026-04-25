import { fetchProducts } from "@/lib/kanji-api";
import { getVariants, deduplicateByVariant } from "@/lib/product-variants";
import { getProductImage } from "@/lib/product-images";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

export const revalidate = 300;

function loadImageCache(): Record<string, string | null> {
  try {
    const file = path.join(process.cwd(), "data", "product-images-cache.json");
    if (!existsSync(file)) return {};
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch { return {}; }
}

export default async function ProductPage({ params }: { params: Promise<{ upc: string }> }) {
  const { upc: rawUpc } = await params;
  const allProducts = await fetchProducts();
  const upc = decodeURIComponent(rawUpc);
  const product = allProducts.find((p) => p.ItemUPC === upc);

  if (!product) notFound();

  const variants = getVariants(product, allProducts);

  const related = deduplicateByVariant(
    allProducts.filter(
      (p) =>
        p.Department === product.Department &&
        !variants.some((v) => v.ItemUPC === p.ItemUPC) &&
        p.ItemUPC !== product.ItemUPC
    )
  ).slice(0, 6);

  const imageCache = loadImageCache();
  const imageUrl = getProductImage(upc) ?? imageCache[upc] ?? null;

  return <ProductDetail product={product} variants={variants} related={related} cityhive={null} imageUrl={imageUrl} />;
}
