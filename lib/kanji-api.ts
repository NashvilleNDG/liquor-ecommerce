export interface Product {
  ItemUPC: string;
  ItemName: string;
  Size: string;
  Pack: string;
  Department: string;
  CurrentStock: number;
  Price: number;
  OnlinePrice: number;
}

export async function fetchProducts(): Promise<Product[]> {
  const key = process.env.KANJI_API_KEY;
  const base = process.env.KANJI_API_BASE_URL;

  const res = await fetch(`${base}/item?Key=${key}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Kanji API error: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
