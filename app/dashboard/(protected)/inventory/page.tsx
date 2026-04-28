import { fetchProducts } from "@/lib/kanji-api";
import { readOverrides } from "@/lib/product-overrides";
import { loadImageCache, resolveProductImage } from "@/lib/image-cache";
import ProductTable from "@/components/ProductTable";
import { Package, RefreshCw, Star, EyeOff, ImageIcon } from "lucide-react";

export const revalidate = 300;

export default async function InventoryPage() {
  const [products, overrides, imageCache] = await Promise.all([
    fetchProducts(),
    Promise.resolve(readOverrides()),
    Promise.resolve(loadImageCache()),
  ]);

  const inStock    = products.filter((p) => Number(p.CurrentStock) > 0).length;
  const outOfStock = products.filter((p) => Number(p.CurrentStock) <= 0).length;
  const lowStock   = products.filter((p) => Number(p.CurrentStock) > 0 && Number(p.CurrentStock) <= 5).length;
  const featured   = Object.values(overrides).filter((o) => o.featured).length;
  const hidden     = Object.values(overrides).filter((o) => o.hidden).length;
  // Count from all three image sources
  const hasImage   = products.filter((p) => !!resolveProductImage(p.ItemUPC, overrides[p.ItemUPC]?.imageUrl, imageCache)).length;

  const stats = [
    { label: "Total SKUs",    value: products.length.toLocaleString(), color: "text-stone-900",  sub: "" },
    { label: "In Stock",      value: inStock.toLocaleString(),          color: "text-green-600",  sub: `${outOfStock} out · ${lowStock} low` },
    { label: "Featured",      value: featured.toLocaleString(),         color: "text-amber-600",  sub: "shown on homepage", icon: Star },
    { label: "Hidden",        value: hidden.toLocaleString(),           color: "text-red-500",    sub: "hidden from shop",  icon: EyeOff },
    { label: "With Images",   value: hasImage.toLocaleString(),         color: "text-blue-600",   sub: `${products.length - hasImage} still missing`, icon: ImageIcon },
    { label: "Out of Stock",  value: outOfStock.toLocaleString(),       color: "text-stone-400",  sub: "" },
  ];

  return (
    <div className="min-h-full bg-white">

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 rounded-xl p-2.5">
            <Package size={18} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Products</h1>
            <p className="text-sm text-stone-400 mt-0.5 flex items-center gap-1.5">
              <RefreshCw size={11} /> Live from Kanji POS · refreshes every 5 min
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-6 max-w-screen-2xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map(({ label, value, color, sub, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-200 p-4 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-1">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                {Icon && <Icon size={16} className={color} />}
              </div>
              <p className="text-xs font-semibold text-stone-600">{label}</p>
              {sub && <p className="text-[11px] text-stone-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Product table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-stone-900">All Products</h2>
              <p className="text-xs text-stone-400 mt-0.5">Click <strong>Edit</strong> on any row to set images, labels, pricing, and visibility</p>
            </div>
          </div>
          <ProductTable products={products} initialOverrides={overrides} imageCache={imageCache} />
        </div>
      </div>
    </div>
  );
}
