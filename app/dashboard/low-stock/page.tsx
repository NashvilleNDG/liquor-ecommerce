import { fetchProducts } from "@/lib/kanji-api";
import { AlertTriangle, Download } from "lucide-react";
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
    <div className="min-h-screen bg-stone-950">
      <header className="bg-stone-900 border-b border-stone-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 rounded-xl p-2">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Low Stock Alerts</h1>
              <p className="text-xs text-stone-500 mt-0.5">{lowStock.length} products need attention</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-6">

        {/* Summary badges */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Critical (≤ 2)",  count: critical.length, color: "text-red-400",    bg: "bg-red-900/20 border-red-700/40"    },
            { label: "Warning (3–5)",   count: warning.length,  color: "text-orange-400", bg: "bg-orange-900/20 border-orange-700/40" },
            { label: "Notice (6–10)",   count: notice.length,   color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-700/40" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`border rounded-2xl p-5 text-center ${bg}`}>
              <p className={`text-3xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-stone-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <LowStockClient products={lowStock} />
      </main>
    </div>
  );
}
