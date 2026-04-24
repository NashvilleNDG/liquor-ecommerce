import { fetchProducts } from "@/lib/kanji-api";
import ProductTable from "@/components/ProductTable";
import {
  Package, TrendingUp, AlertTriangle, RefreshCw,
  DollarSign, ShoppingBag, Layers
} from "lucide-react";
import Link from "next/link";

export const revalidate = 300;

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType;
  color: "amber" | "green" | "red" | "blue" | "purple";
}) {
  const colors = {
    amber:  { text: "text-amber-400",  bg: "bg-amber-500/10"  },
    green:  { text: "text-green-400",  bg: "bg-green-500/10"  },
    red:    { text: "text-red-400",    bg: "bg-red-500/10"    },
    blue:   { text: "text-blue-400",   bg: "bg-blue-500/10"   },
    purple: { text: "text-purple-400", bg: "bg-purple-500/10" },
  }[color];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
      <div className={`${colors.bg} rounded-xl p-2.5 sm:p-3 flex-shrink-0`}>
        <Icon size={18} className={colors.text} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-xl sm:text-2xl font-bold mt-0.5 ${colors.text}`}>{value}</p>
        {sub && <p className="text-[10px] sm:text-xs text-stone-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  let products: Awaited<ReturnType<typeof fetchProducts>> = [];
  let error = "";

  try {
    products = await fetchProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch products";
  }

  const inStock    = products.filter((p) => Number(p.CurrentStock) > 5);
  const lowStock   = products.filter((p) => Number(p.CurrentStock) > 0 && Number(p.CurrentStock) <= 5);
  const outOfStock = products.filter((p) => Number(p.CurrentStock) <= 0);
  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.Price) * Math.max(0, Number(p.CurrentStock)), 0
  );

  const deptMap = new Map<string, { count: number; value: number; inStock: number }>();
  for (const p of products) {
    const d = p.Department || "Other";
    const prev = deptMap.get(d) ?? { count: 0, value: 0, inStock: 0 };
    deptMap.set(d, {
      count:   prev.count + 1,
      value:   prev.value + Number(p.Price) * Math.max(0, Number(p.CurrentStock)),
      inStock: prev.inStock + (Number(p.CurrentStock) > 0 ? 1 : 0),
    });
  }
  const depts = Array.from(deptMap.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...depts.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-xs text-stone-500 mt-0.5">Live sync via Kanji POS API</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
              <RefreshCw size={12} />
              Refreshes every 5 min
            </div>
            <Link
              href="/shop"
              className="text-xs bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              View Store
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {error ? (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-4 sm:p-6 text-sm">
            <strong>API Error:</strong> {error}
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              <StatCard label="Total SKUs"      value={products.length.toLocaleString()} icon={Package}     color="amber"  sub="all products" />
              <StatCard label="In Stock"        value={inStock.length.toLocaleString()}  icon={ShoppingBag} color="green"  sub="stock > 5" />
              <StatCard label="Low Stock"       value={lowStock.length.toLocaleString()} icon={AlertTriangle} color="red"  sub="1-5 remaining" />
              <StatCard label="Departments"     value={deptMap.size}                     icon={Layers}      color="blue"   sub="categories" />
              <StatCard label="Inventory Value" value={`$${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} icon={DollarSign} color="purple" sub="at in-store price" />
            </div>

            {/* Analytics row */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">

              {/* Department breakdown chart */}
              <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-semibold text-white">Inventory by Department</h2>
                  <TrendingUp size={16} className="text-stone-600" />
                </div>
                <div className="space-y-3">
                  {depts.slice(0, 10).map((dept) => {
                    const pct = (dept.count / maxCount) * 100;
                    const inStockPct = dept.count > 0 ? (dept.inStock / dept.count) * 100 : 0;
                    return (
                      <div key={dept.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="text-stone-300 font-medium truncate">{dept.name}</span>
                          <span className="text-stone-500 whitespace-nowrap flex-shrink-0">
                            {dept.count} SKUs &middot; <span className="text-green-400">{dept.inStock} in stock</span>
                          </span>
                        </div>
                        <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-green-500/50" style={{ width: `${inStockPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-stone-700">Orange = total SKUs &middot; Green = in-stock ratio</p>
              </div>

              {/* Low-stock alerts */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-semibold text-white">Low Stock Alerts</h2>
                  <span className="text-xs bg-red-900/50 text-red-400 border border-red-700/50 px-2 py-0.5 rounded-full">
                    {lowStock.length} items
                  </span>
                </div>
                <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1 scrollbar-none">
                  {lowStock.length === 0 ? (
                    <p className="text-stone-600 text-sm">No low-stock items.</p>
                  ) : (
                    lowStock.slice(0, 20).map((p) => (
                      <div key={p.ItemUPC} className="flex items-center justify-between gap-2 bg-stone-800 rounded-xl px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-stone-200 truncate">{p.ItemName}</p>
                          <p className="text-[10px] text-stone-600">{p.Department}</p>
                        </div>
                        <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                          Number(p.CurrentStock) <= 2 ? "bg-red-900/70 text-red-400" : "bg-orange-900/70 text-orange-400"
                        }`}>
                          {Number(p.CurrentStock).toFixed(0)} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {lowStock.length > 20 && (
                  <p className="text-xs text-stone-600 text-center">+{lowStock.length - 20} more items</p>
                )}
              </div>
            </div>

            {/* Stock status summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: "Fully Stocked", count: inStock.length,    color: "bg-green-500",  pct: products.length > 0 ? (inStock.length / products.length) * 100 : 0 },
                { label: "Low Stock",     count: lowStock.length,   color: "bg-orange-500", pct: products.length > 0 ? (lowStock.length / products.length) * 100 : 0 },
                { label: "Out of Stock",  count: outOfStock.length, color: "bg-red-500",    pct: products.length > 0 ? (outOfStock.length / products.length) * 100 : 0 },
              ].map(({ label, count, color, pct }) => (
                <div key={label} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3">
                  <div className="flex-1 sm:text-center">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-white mt-0.5">{count.toLocaleString()}</p>
                  </div>
                  <div className="w-24 sm:w-full space-y-1">
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct.toFixed(1)}%` }} />
                    </div>
                    <p className="text-xs text-stone-600 text-right sm:text-center">{pct.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Table */}
            <div className="bg-stone-900 rounded-2xl p-4 sm:p-6 border border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
                <h2 className="text-sm sm:text-base font-semibold text-white">All Products</h2>
                <p className="text-xs text-stone-500">Search, filter, and export your full catalog</p>
              </div>
              <ProductTable products={products} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
