import { fetchProducts } from "@/lib/kanji-api";
import { getVariants, deduplicateByVariant } from "@/lib/product-variants";
import { loadImageCache, resolveProductImage } from "@/lib/image-cache";
import { readOverrides, resolvePrice } from "@/lib/product-overrides";
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

  const [imageCache, overrides] = await Promise.all([
    Promise.resolve(loadImageCache()),
    Promise.resolve(readOverrides()),
  ]);

  const override      = overrides[upc] ?? {};
  const imageUrl      = resolveProductImage(upc, override.imageUrl, imageCache);
  const effectivePrice = resolvePrice(Number(product.Price), override);

  return (
    <ProductDetail
      product={product}
      variants={variants}
      related={related}
      cityhive={null}
      imageUrl={imageUrl}
      overrideDescription={override.description ?? null}
      overrideName={override.websiteName ?? null}
      overridePrice={effectivePrice !== Number(product.Price) ? effectivePrice : null}
    />
  );
}
