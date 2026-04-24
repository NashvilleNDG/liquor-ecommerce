import { fetchProducts } from "@/lib/kanji-api";
import { deduplicateByVariant } from "@/lib/product-variants";
import { readTags } from "@/lib/pairing-tags";
import PairingsClient from "./PairingsClient";

export const dynamic = "force-dynamic";

export default async function AdminPairingsPage() {
  const allProducts = await fetchProducts();
  const products    = deduplicateByVariant(allProducts.filter((p) => Number(p.CurrentStock) > 0));
  const initialTags = readTags();

  return <PairingsClient products={products} initialTags={initialTags} />;
}
