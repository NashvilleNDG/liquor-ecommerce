import { fetchProducts } from "@/lib/kanji-api";
import ProductTable from "@/components/ProductTable";
import { Package, RefreshCw } from "lucide-react";

export const revalidate = 300;

export default async function InventoryPage() {
  const products   = await fetchProducts();
  const inStock    = products.filter((p) => Number(p.CurrentStock) > 0).length;
  const outOfStock = products.filter((p) => Number(p.CurrentStock) <= 0).length;
  const lowStock   = products.filter((p) => Number(p.CurrentStock) > 0 && Number(p.CurrentStock) <= 5).length;

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
              <RefreshCw size={11} className="text-stone-400" /> Full catalog from Kanji POS · refreshes every 5 min
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-6 max-w-screen-2xl mx-auto">

        {/* Stats — unified theme */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total SKUs",   value: products.length.toLocaleString(), valueColor: "text-stone-900" },
            { label: "In Stock",     value: inStock.toLocaleString(),         valueColor: "text-stone-900" },
            { label: "Low Stock",    value: lowStock.toLocaleString(),        valueColor: "text-amber-600" },
            { label: "Out of Stock", value: outOfStock.toLocaleString(),      valueColor: "text-stone-400" },
          ].map(({ label, value, valueColor }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-sm transition-all">
              <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
              <p className="text-xs text-stone-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Product table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
            <h2 className="text-base font-bold text-stone-900">All Products</h2>
            <p className="text-xs text-stone-400">Search, filter, and export your full catalog</p>
          </div>
          <ProductTable products={products} />
        </div>
      </div>
    </div>
  );
}
