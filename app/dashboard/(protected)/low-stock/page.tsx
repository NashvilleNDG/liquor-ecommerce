import { fetchProducts } from "@/lib/kanji-api";
import { AlertTriangle } from "lucide-react";
import LowStockClient from "./LowStockClient";

export const revalidate = 300;

export default async function LowStockPage() {
  const products = await fetchProducts();
  const lowStock = products
    .filter((p) => Number(p.CurrentStock) > 0 && Number(p.CurrentStock) <= 10)
    .sort((a, b) => Number(a.CurrentStock) - Number(b.CurrentStock));

  const critical = lowStock.filter((p) => Number(p.CurrentStock) <= 2);
  const warning  = lowStock.filter((p) => Number(p.CurrentStock) > 2 && Number(p.CurrentStock) <= 5);
  const notice   = lowStock.filter((p) => Number(p.CurrentStock) > 5);

  return (
    <div className="min-h-full bg-white">

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 rounded-xl p-2.5">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Low Stock Alerts</h1>
            <p className="text-sm text-stone-400 mt-0.5">{lowStock.length} products need attention</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-6 max-w-screen-2xl mx-auto">

        {/* Summary — unified theme */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Critical  (≤ 2)", count: critical.length, valueColor: "text-stone-900", border: "border-stone-900" },
            { label: "Warning  (3–5)",  count: warning.length,  valueColor: "text-amber-600", border: "border-amber-300" },
            { label: "Notice  (6–10)", count: notice.length,   valueColor: "text-stone-700", border: "border-stone-300" },
          ].map(({ label, count, valueColor, border }) => (
            <div key={label} className={`rounded-2xl border ${border} bg-white p-5 text-center hover:shadow-sm transition-all`}>
              <p className={`text-3xl font-black ${valueColor}`}>{count}</p>
              <p className="text-xs text-stone-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <LowStockClient products={lowStock} />
      </div>
    </div>
  );
}
