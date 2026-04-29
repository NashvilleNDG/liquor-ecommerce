import { notFound } from "next/navigation";
import { fetchProducts } from "@/lib/kanji-api";
import { readOverrides } from "@/lib/product-overrides";
import { loadImageCache, resolveProductImage } from "@/lib/image-cache";
import { getEffectiveDescription } from "@/lib/product-description";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 0;

interface Props {
  params: Promise<{ upc: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { upc } = await params;
  const [products, overrides, imageCache] = await Promise.all([
    fetchProducts(),
    Promise.resolve(readOverrides()),
    Promise.resolve(loadImageCache()),
  ]);

  const product = products.find((p) => p.ItemUPC === upc);
  if (!product) notFound();

  const override       = overrides[upc] ?? {};
  const cachedImageUrl = resolveProductImage(upc, override.imageUrl, imageCache);
  const generatedDescription = getEffectiveDescription(product, null); // auto-generated only

  return (
    <ProductDetailClient
      product={product}
      initialOverride={override}
      cachedImageUrl={cachedImageUrl}
      generatedDescription={generatedDescription}
    />
  );
}
