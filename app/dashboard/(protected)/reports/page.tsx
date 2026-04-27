import { readFileSync, existsSync } from "fs";
import path from "path";
import { TrendingUp, DollarSign, ShoppingCart, Users, Download, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Order {
  id: string; date: string; customer: string; email?: string;
  total: number; subtotal: number; discount: number; tax: number; delivery: number;
  status: string; items: { name: string; qty: number; price: number }[];
}

function readOrders(): Order[] {
  try {
    const f = path.join(process.cwd(), "data", "orders.json");
    if (!existsSync(f)) return [];
    return JSON.parse(readFileSync(f, "utf8"));
  } catch { return []; }
}

function groupByDay(orders: Order[]): { date: string; revenue: number; count: number }[] {
  const map = new Map<string, { revenue: number; count: number }>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const day = o.date?.slice(0, 10) ?? "";
    const prev = map.get(day) ?? { revenue: 0, count: 0 };
    map.set(day, { revenue: prev.revenue + (o.total ?? 0), count: prev.count + 1 });
  }
  return Array.from(map.entries())
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // last 30 days
}

function topProducts(orders: Order[]): { name: string; qty: number; revenue: number }[] {
  const map = new Map<string, { qty: number; revenue: number }>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    for (const item of o.items ?? []) {
      const prev = map.get(item.name) ?? { qty: 0, revenue: 0 };
      map.set(item.name, { qty: prev.qty + item.qty, revenue: prev.revenue + item.price * item.qty });
    }
  }
  return Array.from(map.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

export default function ReportsPage() {
  const orders = readOrders();
  const completed = orders.filter(o => o.status !== "cancelled");

  const totalRevenue  = completed.reduce((s, o) => s + (o.total ?? 0), 0);
  const totalOrders   = completed.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const totalDiscount = completed.reduce((s, o) => s + (o.discount ?? 0), 0);
  const totalTax      = completed.reduce((s, o) => s + (o.tax ?? 0), 0);
  const uniqueCustomers = new Set(completed.map(o => o.email ?? o.customer)).size;

  const daily     = groupByDay(orders);
  const maxRev    = Math.max(...daily.map(d => d.revenue), 1);
  const top       = topProducts(orders);
  const maxTopRev = Math.max(...top.map(p => p.revenue), 1);

  // Last 7 days vs previous 7
  const now = Date.now();
  const last7  = completed.filter(o => now - new Date(o.date).getTime() <  7 * 86400000);
  const prev7  = completed.filter(o => {
    const age = now - new Date(o.date).getTime();
    return age >= 7 * 86400000 && age < 14 * 86400000;
  });
  const last7Rev = last7.reduce((s, o) => s + o.total, 0);
  const prev7Rev = prev7.reduce((s, o) => s + o.total, 0);
  const revChange = prev7Rev ? ((last7Rev - prev7Rev) / prev7Rev) * 100 : null;

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><TrendingUp size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Revenue Reports</h1>
              <p className="text-sm text-stone-400 mt-0.5">All-time sales performance</p>
            </div>
          </div>
          <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 px-3 py-2 rounded-xl transition-all">
            View Orders <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-screen-xl mx-auto space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Revenue",    value: `$${totalRevenue.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`, icon: DollarSign,   sub: revChange !== null ? `${revChange >= 0 ? "+" : ""}${revChange.toFixed(1)}% vs last week` : "all time" },
            { label: "Total Orders",     value: totalOrders,             icon: ShoppingCart, sub: `${last7.length} in last 7 days` },
            { label: "Avg Order Value",  value: `$${avgOrderValue.toFixed(2)}`, icon: TrendingUp, sub: "per completed order" },
            { label: "Unique Customers", value: uniqueCustomers,         icon: Users,        sub: "placed at least one order" },
          ].map(({ label, value, icon: Icon, sub }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="bg-amber-50 rounded-xl p-2.5 flex-shrink-0"><Icon size={16} className="text-amber-600" /></div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Subtotal",         value: completed.reduce((s, o) => s + (o.subtotal ?? 0), 0) },
            { label: "Total Discounts",  value: -totalDiscount },
            { label: "Total Tax Collected", value: totalTax },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-xl p-4">
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">{label}</p>
              <p className={`text-xl font-bold mt-1 ${value < 0 ? "text-amber-600" : "text-stone-900"}`}>
                {value < 0 ? "-" : ""}${Math.abs(value).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-stone-900 mb-1">Daily Revenue</h2>
          <p className="text-xs text-stone-400 mb-5">Last 30 days (excluding cancelled orders)</p>
          {daily.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm">No order data yet</div>
          ) : (
            <div className="space-y-2">
              {daily.map((d) => {
                const pct = (d.revenue / maxRev) * 100;
                return (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="text-xs text-stone-400 w-20 flex-shrink-0 tabular-nums">
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <div className="flex-1 h-6 bg-stone-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg flex items-center px-2 transition-all"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      >
                        {pct > 20 && <span className="text-[10px] font-bold text-stone-900">${d.revenue.toFixed(0)}</span>}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-stone-700 w-16 text-right tabular-nums">${d.revenue.toFixed(0)}</span>
                    <span className="text-[10px] text-stone-400 w-12 text-right tabular-nums">{d.count} orders</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-stone-900 mb-5">Top 10 Products by Revenue</h2>
          {top.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm">No product data yet</div>
          ) : (
            <div className="space-y-3">
              {top.map((p, i) => {
                const pct = (p.revenue / maxTopRev) * 100;
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-400 w-5 flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-stone-800 truncate">{p.name}</p>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <span className="text-xs text-stone-400">{p.qty} sold</span>
                          <span className="text-sm font-bold text-amber-600 tabular-nums">${p.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-stone-900 mb-4">Order Status Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(["pending","processing","out_for_delivery","delivered","cancelled"] as const).map(status => {
              const count = orders.filter(o => o.status === status).length;
              const pct   = orders.length ? ((count / orders.length) * 100).toFixed(0) : "0";
              const styles: Record<string, string> = {
                pending: "bg-stone-50 text-stone-700 border-stone-200",
                processing: "bg-amber-50 text-amber-800 border-amber-200",
                out_for_delivery: "bg-amber-100 text-amber-900 border-amber-300",
                delivered: "bg-stone-900 text-white border-stone-900",
                cancelled: "bg-stone-100 text-stone-500 border-stone-200",
              };
              return (
                <div key={status} className={`rounded-xl border p-4 text-center ${styles[status]}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs mt-1 capitalize">{status.replace(/_/g, " ")}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
