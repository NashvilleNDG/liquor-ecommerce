import { fetchProducts } from "@/lib/kanji-api";
import { getVariants, deduplicateByVariant } from "@/lib/product-variants";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

export const revalidate = 300;

export default async function ProductPage({ params }: { params: Promise<{ upc: string }> }) {
  const { upc: rawUpc } = await params;
  const allProducts = await fetchProducts();
  const upc = decodeURIComponent(rawUpc);
  const product = allProducts.find((p) => p.ItemUPC === upc);

  if (!product) notFound();

  // All size variants of this product (excluding itself)
  const variants = getVariants(product, allProducts);

  // Related products: deduplicated, same dept, different base name, limit 6
  const related = deduplicateByVariant(
    allProducts.filter(
      (p) =>
        p.Department === product.Department &&
        !variants.some((v) => v.ItemUPC === p.ItemUPC) &&
        p.ItemUPC !== product.ItemUPC
    )
  ).slice(0, 6);

  return <ProductDetail product={product} variants={variants} related={related} />;
}
