import { fetchProducts } from "@/lib/kanji-api";
import { getVariants, deduplicateByVariant } from "@/lib/product-variants";
import { getCityHiveProductByName } from "@/lib/cityhive-api";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

export const revalidate = 300;

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

  // Fetch CityHive enrichment (images, description, ABV, ratings, etc.)
  const cityhive = await getCityHiveProductByName(product.ItemName).catch(() => null);

  return <ProductDetail product={product} variants={variants} related={related} cityhive={cityhive} />;
}
