const CH_BASE = "https://shop.stonesrivertotalbeverages.com";
const CH_KEY = "7508df878a8c7566a880e4d3f7fa7972";
const CH_MERCHANT = "68cdc9dd8cee0e5e1bc4240a";

export interface CityHiveImages {
  original: string;
  large: string;
  medium: string;
  small: string;
  thumbnail: string;
}

export interface CityHiveOption {
  size: string;
  price: number;
  quantity: number;
  option_id: string;
  product_id: string;
  available: boolean;
}

export interface CityHiveProductDetails {
  id: string;
  name: string;
  description: string;
  images: {
    primary: CityHiveImages;
    more_images: CityHiveImages[];
  };
  product_rating: number;
  number_of_product_ratings: number;
  additional_properties: {
    type?: string;
    subtype?: string;
    age?: string;
    content?: string;
    country?: string;
    state?: string;
    region?: string;
    sub_region?: string;
    basic_category?: string;
    brands?: string;
  };
  options: CityHiveOption[];
}

async function searchProductId(name: string): Promise<{ id: string; image: string | null } | null> {
  try {
    const url = `${CH_BASE}/api/v1/products/search_preview.json?api_key=${CH_KEY}&text=${encodeURIComponent(name)}&merchant_id=${CH_MERCHANT}&ch_request_flag_fast_search_preview=true&local=true`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const products: any[] = data?.data?.products || [];
    if (!products.length) return null;
    const normalized = name.toLowerCase().trim();
    const match =
      products.find((p) => p.name?.toLowerCase().trim() === normalized) ||
      products[0];
    if (!match?.id) return null;
    return {
      id: match.id,
      image: match.images?.primary?.medium || match.images?.primary?.large || null,
    };
  } catch {
    return null;
  }
}

export async function searchCityHiveImage(name: string): Promise<string | null> {
  const result = await searchProductId(name);
  return result?.image ?? null;
}

export async function getCityHiveProductByName(
  name: string
): Promise<CityHiveProductDetails | null> {
  const found = await searchProductId(name);
  if (!found?.id) return null;
  return getProductDetails(found.id);
}

async function getProductDetails(
  productId: string
): Promise<CityHiveProductDetails | null> {
  try {
    const url = `${CH_BASE}/api/v1/products/${productId}/details.json?api_key=${CH_KEY}&merchant_id=${CH_MERCHANT}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result !== 0) return null;
    const d = data.data;

    const rawOptions: any[] = d.merchants?.[0]?.product_options || [];
    const options: CityHiveOption[] = rawOptions
      .map((o) => {
        const qty = o.option_params?.size?.quantity;
        const measure = o.option_params?.size?.measure;
        const pack = o.option_params?.pack;
        const size = qty ? `${qty}${measure}` : pack || "—";
        return {
          size,
          price: o.price ?? 0,
          quantity: o.quantity ?? 0,
          option_id: o.option_id,
          product_id: o.product_id,
          available: (o.quantity ?? 0) > 0,
        };
      })
      .sort((a, b) => {
        const aNum = parseFloat(a.size) || 0;
        const bNum = parseFloat(b.size) || 0;
        return aNum - bNum;
      });

    return {
      id: d.id,
      name: d.name,
      description: d.description || "",
      images: d.images || { primary: null, more_images: [] },
      product_rating: d.product_rating ?? 0,
      number_of_product_ratings: d.number_of_product_ratings ?? 0,
      additional_properties: d.additional_properties || {},
      options,
    };
  } catch {
    return null;
  }
}
