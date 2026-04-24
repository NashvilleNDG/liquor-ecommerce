import { fetchProducts } from "@/lib/kanji-api";
import ProductTable from "@/components/ProductTable";
import { Package, RefreshCw } from "lucide-react";

export const revalidate = 300;

export default async function InventoryPage() {
  const products = await fetchProducts();
  const inStock    = products.filter((p) => Number(p.CurrentStock) > 0).length;
  const outOfStock = products.filter((p) => Number(p.CurrentStock) <= 0).length;
  const totalUnits = products.reduce((s, p) => s + Math.max(0, Number(p.CurrentStock)), 0);

  return (
    <div className="min-h-screen bg-stone-950">
      <header className="bg-stone-900 border-b border-stone-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 rounded-xl p-2">
              <Package size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Inventory</h1>
              <p className="text-xs text-stone-500 mt-0.5">Full product catalog from Kanji POS</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <RefreshCw size={12} />
            Auto-refreshes every 5 min
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-6">

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total SKUs",    value: products.length.toLocaleString(),    color: "text-white" },
            { label: "In Stock",      value: inStock.toLocaleString(),             color: "text-green-400" },
            { label: "Out of Stock",  value: outOfStock.toLocaleString(),          color: "text-red-400" },
            { label: "Total Units",   value: totalUnits.toLocaleString(),          color: "text-amber-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-stone-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Full table */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <ProductTable products={products} />
        </div>
      </main>
    </div>
  );
}
