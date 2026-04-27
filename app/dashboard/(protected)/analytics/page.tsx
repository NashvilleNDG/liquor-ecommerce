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
  const avgPrice   = products.reduce((s, p) => s + Number(p.Price), 0) / (products.length || 1);

  const buckets = [
    { label: "Under $10",  min: 0,   max: 10      },
    { label: "$10 – $25",  min: 10,  max: 25      },
    { label: "$25 – $50",  min: 25,  max: 50      },
    { label: "$50 – $100", min: 50,  max: 100     },
    { label: "$100+",      min: 100, max: Infinity },
  ].map((b) => ({
    ...b,
    count: products.filter((p) => Number(p.Price) >= b.min && Number(p.Price) < b.max).length,
  }));
  const maxBucket = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="min-h-full bg-white">

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <h1 className="text-xl font-bold text-stone-900">Analytics</h1>
        <p className="text-sm text-stone-400 mt-0.5">Inventory value and product distribution</p>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-6 max-w-screen-2xl mx-auto">

        {/* Summary KPIs — unified amber/stone */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total SKUs",  value: products.length.toLocaleString(),                                              icon: Package    },
            { label: "Departments", value: depts.length,                                                                  icon: BarChart2  },
            { label: "Avg Price",   value: `$${avgPrice.toFixed(2)}`,                                                    icon: DollarSign },
            { label: "Total Value", value: `$${totalValue.toLocaleString("en-US",{maximumFractionDigits:0})}`,           icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5 flex items-start gap-4 hover:shadow-sm transition-all">
              <div className="bg-amber-50 rounded-xl p-2.5 flex-shrink-0">
                <Icon size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Value by Department */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-amber-50 rounded-lg p-1.5">
              <DollarSign size={16} className="text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-stone-900">Inventory Value by Department</h2>
          </div>
          <div className="space-y-4">
            {depts.map((dept) => {
              const pct   = (dept.value / maxValue) * 100;
              const share = totalValue > 0 ? (dept.value / totalValue) * 100 : 0;
              return (
                <div key={dept.name}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-1.5">
                    <span className="text-stone-800 font-semibold">{dept.name}</span>
                    <div className="flex items-center gap-4 text-xs text-stone-400">
                      <span className="text-amber-600 font-bold tabular-nums">${dept.value.toLocaleString("en-US",{maximumFractionDigits:0})}</span>
                      <span>{share.toFixed(1)}% of total</span>
                      <span>{dept.count} SKUs</span>
                      <span className={`font-medium ${dept.inStockPct > 70 ? "text-stone-700" : dept.inStockPct > 40 ? "text-amber-600" : "text-stone-400"}`}>
                        {dept.inStockPct.toFixed(0)}% in stock
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department table + Price distribution */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Department table */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-50 rounded-lg p-1.5">
                <BarChart2 size={16} className="text-amber-600" />
              </div>
              <h2 className="text-base font-bold text-stone-900">Department Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-stone-500 uppercase tracking-wider border-b border-stone-200">
                    <th className="text-left py-2.5 font-semibold">Department</th>
                    <th className="text-right py-2.5 font-semibold">SKUs</th>
                    <th className="text-right py-2.5 font-semibold">In Stock</th>
                    <th className="text-right py-2.5 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {depts.map((dept) => (
                    <tr key={dept.name} className="hover:bg-stone-50 transition-colors">
                      <td className="py-2.5 text-stone-800 font-medium">{dept.name}</td>
                      <td className="py-2.5 text-right text-stone-500 tabular-nums">{dept.count}</td>
                      <td className="py-2.5 text-right tabular-nums">
                        <span className={`font-semibold ${dept.inStockPct > 70 ? "text-stone-700" : dept.inStockPct > 40 ? "text-amber-600" : "text-stone-400"}`}>
                          {dept.inStockPct.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-amber-600 font-bold tabular-nums">
                        ${dept.value.toLocaleString("en-US",{maximumFractionDigits:0})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price distribution */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-50 rounded-lg p-1.5">
                <TrendingUp size={16} className="text-amber-600" />
              </div>
              <h2 className="text-base font-bold text-stone-900">Price Distribution</h2>
            </div>
            <div className="space-y-3">
              {buckets.map((b) => {
                const pct  = (b.count / maxBucket) * 100;
                const share = products.length > 0 ? (b.count / products.length) * 100 : 0;
                return (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-stone-700 font-medium">{b.label}</span>
                      <span className="text-stone-400 tabular-nums">{b.count.toLocaleString()} products ({share.toFixed(0)}%)</span>
                    </div>
                    <div className="h-4 bg-stone-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      >
                        {pct > 20 && <span className="text-[10px] text-stone-900 font-bold">{share.toFixed(0)}%</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-500 mt-3">Based on in-store price across {products.length.toLocaleString()} products</p>
          </div>
        </div>
      </div>
    </div>
  );
}
