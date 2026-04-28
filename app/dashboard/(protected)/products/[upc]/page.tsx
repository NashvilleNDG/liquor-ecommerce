import { notFound } from "next/navigation";
import { fetchProducts } from "@/lib/kanji-api";
import { readOverrides } from "@/lib/product-overrides";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 0;

interface Props {
  params: Promise<{ upc: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { upc }    = await params;
  const [products, overrides] = await Promise.all([
    fetchProducts(),
    Promise.resolve(readOverrides()),
  ]);

  const product = products.find((p) => p.ItemUPC === upc);
  if (!product) notFound();

  return (
    <ProductDetailClient
      product={product}
      initialOverride={overrides[upc] ?? {}}
    />
  );
}
