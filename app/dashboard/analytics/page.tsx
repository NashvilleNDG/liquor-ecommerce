import { fetchProducts } from "@/lib/kanji-api";
import { TrendingUp, DollarSign, Package, BarChart2 } from "lucide-react";

export const revalidate = 300;

export default async function AnalyticsPage() {
  const products = await fetchProducts();

  const deptMap = new Map<string, { count: number; value: number; inStock: number; totalStock: number }>();
  for (const p of products) {
    const d = p.Department || "Other";
    const prev = deptMap.get(d) ?? { count: 0, value: 0, inStock: 0, totalStock: 0 };
    deptMap.set(d, {
      count:      prev.count + 1,
      value:      prev.value + Number(p.Price) * Math.max(0, Number(p.CurrentStock)),
      inStock:    prev.inStock + (Number(p.CurrentStock) > 0 ? 1 : 0),
      totalStock: prev.totalStock + Math.max(0, Number(p.CurrentStock)),
    });
  }

  const depts = Array.from(deptMap.entries()).map(([name, d]) => ({
    name, ...d,
    inStockPct: d.count > 0 ? (d.inStock / d.count) * 100 : 0,
  })).sort((a, b) => b.value - a.value);

  const totalValue = depts.reduce((s, d) => s + d.value, 0);
  const maxValue   = Math.max(...depts.map((d) => d.value), 1);

  const buckets = [
    { label: "Under $10",  min: 0,   max: 10       },
    { label: "$10 - $25",  min: 10,  max: 25       },
    { label: "$25 - $50",  min: 25,  max: 50       },
    { label: "$50 - $100", min: 50,  max: 100      },
    { label: "$100+",      min: 100, max: Infinity  },
  ].map((b) => ({
    ...b,
    count: products.filter((p) => Number(p.Price) >= b.min && Number(p.Price) < b.max).length,
  }));
  const maxBucket = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="min-h-screen bg-stone-950">
      <header className="bg-stone-900 border-b border-stone-800 px-4 sm:px-6 py-4">
        <h1 className="text-lg sm:text-xl font-bold text-white">Analytics</h1>
        <p className="text-xs text-stone-500 mt-0.5">Inventory value and product distribution</p>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Value by department */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-yellow-400" />
            <h2 className="text-sm sm:text-base font-semibold text-white">Inventory Value by Department</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {depts.map((dept) => {
              const pct   = (dept.value / maxValue) * 100;
              const share = totalValue > 0 ? (dept.value / totalValue) * 100 : 0;
              return (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex flex-wrap items-start sm:items-center justify-between gap-1 sm:gap-2 text-sm">
                    <span className="text-stone-200 font-medium">{dept.name}</span>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-stone-500 flex-wrap">
                      <span className="text-yellow-400 font-semibold">${dept.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                      <span>{share.toFixed(1)}% of total</span>
                      <span>{dept.count} SKUs</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dept table + price distribution */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Department table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-blue-400" />
              <h2 className="text-sm sm:text-base font-semibold text-white">Department Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[300px]">
                <thead>
                  <tr className="text-stone-500 uppercase tracking-wider border-b border-stone-800">
                    <th className="text-left py-2">Department</th>
                    <th className="text-right py-2">SKUs</th>
                    <th className="text-right py-2">In Stock</th>
                    <th className="text-right py-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                  {depts.map((dept) => (
                    <tr key={dept.name} className="hover:bg-stone-800/30 transition-colors">
                      <td className="py-2.5 text-stone-200 font-medium">{dept.name}</td>
                      <td className="py-2.5 text-right text-stone-400">{dept.count}</td>
                      <td className="py-2.5 text-right">
                        <span className={dept.inStockPct > 70 ? "text-green-400" : dept.inStockPct > 40 ? "text-orange-400" : "text-red-400"}>
                          {dept.inStockPct.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-yellow-400 font-semibold">
                        ${dept.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price distribution */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-green-400" />
              <h2 className="text-sm sm:text-base font-semibold text-white">Price Distribution</h2>
            </div>
            <div className="space-y-3">
              {buckets.map((b) => {
                const pct = (b.count / maxBucket) * 100;
                return (
                  <div key={b.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-300">{b.label}</span>
                      <span className="text-stone-500">{b.count.toLocaleString()} products</span>
                    </div>
                    <div className="h-4 bg-stone-800 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      >
                        {pct > 15 && <span className="text-[10px] text-white font-bold">{((b.count / products.length) * 100).toFixed(0)}%</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-700">Based on in-store price across all {products.length.toLocaleString()} products</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Avg Price",   value: `$${(products.reduce((s, p) => s + Number(p.Price), 0) / (products.length || 1)).toFixed(2)}`, icon: DollarSign },
            { label: "Total SKUs",  value: products.length.toLocaleString(), icon: Package },
            { label: "Departments", value: depts.length, icon: BarChart2 },
            { label: "Total Value", value: `$${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 text-center space-y-2">
              <Icon size={20} className="text-yellow-400 mx-auto" />
              <p className="text-lg sm:text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
