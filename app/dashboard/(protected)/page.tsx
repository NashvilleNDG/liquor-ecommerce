import { fetchProducts } from "@/lib/kanji-api";
import { readFileSync, existsSync } from "fs";
import path from "path";
import Link from "next/link";
import {
  Package, TrendingUp, AlertTriangle, DollarSign,
  Users, Mail, Tag, Percent, ShoppingCart,
  ArrowUpRight, RefreshCw, CheckCircle, Clock,
  CalendarDays, ImageIcon, Utensils, BarChart2,
} from "lucide-react";

export const revalidate = 300;

function readJSON<T>(filename: string, fallback: T): T {
  try {
    const file = path.join(process.cwd(), "data", filename);
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch { return fallback; }
}

interface Order {
  id: string; date: string; customer: string;
  total: number; status: string; mode: string;
}

// ── KPI Card — unified amber/stone theme ──────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; href?: string;
}) {
  const card = (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-start gap-4 hover:shadow-md hover:border-stone-300 transition-all duration-200 group">
      <div className="bg-amber-50 rounded-xl p-2.5 flex-shrink-0 group-hover:bg-amber-100 transition-colors">
        <Icon size={18} className="text-amber-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
      {href && <ArrowUpRight size={14} className="text-stone-400 flex-shrink-0 mt-1 group-hover:text-amber-500 transition-colors" />}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div>
        <h2 className="text-base font-bold text-stone-900">{title}</h2>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  delivered:        "bg-stone-900 text-white",
  out_for_delivery: "bg-amber-100 text-amber-800",
  processing:       "bg-amber-50 text-amber-700 border border-amber-200",
  pending:          "bg-stone-100 text-stone-500",
  cancelled:        "bg-stone-100 text-stone-400 line-through",
};

export default async function DashboardPage() {
  const products    = await fetchProducts().catch(() => []);
  const users       = readJSON<{ id: string; name: string; email: string; createdAt: string; points: number }[]>("users.json", []);
  const subscribers = readJSON<string[]>("subscribers.json", []);
  const deals       = readJSON<{ id: string; active: boolean }[]>("deals.json", []);
  const events      = readJSON<{ id: string; title: string; date: string }[]>("events.json", []);
  const orders      = readJSON<Order[]>("orders.json", []);

  const inStock    = products.filter((p) => Number(p.CurrentStock) > 5).length;
  const lowStock   = products.filter((p) => Number(p.CurrentStock) > 0 && Number(p.CurrentStock) <= 5);
  const outOfStock = products.filter((p) => Number(p.CurrentStock) <= 0).length;
  const totalValue = products.reduce((s, p) => s + Number(p.Price) * Math.max(0, Number(p.CurrentStock)), 0);

  const deptMap = new Map<string, number>();
  for (const p of products) deptMap.set(p.Department, (deptMap.get(p.Department) ?? 0) + 1);
  const depts = Array.from(deptMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxDeptCount = Math.max(...depts.map((d) => d[1]), 1);

  const totalRevenue  = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
  const recentOrders  = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const quickActions = [
    { label: "Add Deal",       href: "/dashboard/deals",      icon: Tag          },
    { label: "Add Discount",   href: "/dashboard/discounts",  icon: Percent      },
    { label: "Add Event",      href: "/dashboard/events",     icon: CalendarDays },
    { label: "Upload Images",  href: "/dashboard/images",     icon: ImageIcon    },
    { label: "Food Pairings",  href: "/dashboard/pairings",   icon: Utensils     },
    { label: "View Analytics", href: "/dashboard/analytics",  icon: BarChart2    },
  ];

  return (
    <div className="min-h-full bg-white">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Dashboard</h1>
            <p className="text-sm text-stone-400 mt-0.5 flex items-center gap-1.5">
              <RefreshCw size={12} className="text-stone-400" /> Live sync from Kanji POS · refreshes every 5 min
            </p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm font-semibold bg-stone-900 hover:bg-stone-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            View Store <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-7 space-y-6 sm:space-y-8 max-w-screen-2xl mx-auto">

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard label="Total Revenue"    value={`$${totalRevenue.toLocaleString("en-US",{maximumFractionDigits:0})}`} sub={`${orders.length} orders`}          icon={DollarSign}    href="/dashboard/orders"    />
          <KpiCard label="Pending Orders"   value={pendingOrders}   sub="awaiting action"            icon={ShoppingCart}  href="/dashboard/orders"    />
          <KpiCard label="Total Products"   value={products.length.toLocaleString()} sub={`${outOfStock} out of stock`}    icon={Package}       href="/dashboard/inventory" />
          <KpiCard label="Low Stock Alerts" value={lowStock.length} sub="≤ 5 units remaining"        icon={AlertTriangle} href="/dashboard/low-stock"  />
          <KpiCard label="Registered Users" value={users.length}    sub="total accounts"             icon={Users}         href="/dashboard/users"      />
          <KpiCard label="Subscribers"      value={subscribers.length} sub="newsletter list"         icon={Mail}          href="/dashboard/newsletter" />
          <KpiCard label="Active Deals"     value={deals.filter(d=>d.active).length} sub={`${deals.length} total`}     icon={Tag}           href="/dashboard/deals"     />
          <KpiCard label="Inventory Value"  value={`$${totalValue.toLocaleString("en-US",{maximumFractionDigits:0})}`} sub="at in-store price" icon={TrendingUp}                       />
        </div>

        {/* ── Middle row ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Department breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <SectionHeader
              title="Inventory by Department"
              sub="SKUs per category"
              action={
                <Link href="/dashboard/analytics" className="text-xs text-stone-400 hover:text-amber-600 flex items-center gap-1 transition-colors">
                  Full report <ArrowUpRight size={12} />
                </Link>
              }
            />
            <div className="space-y-3">
              {depts.map(([name, count]) => {
                const pct = (count / maxDeptCount) * 100;
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-700 font-medium">{name}</span>
                      <span className="text-stone-400 tabular-nums">{count} SKUs</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
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

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <SectionHeader
              title="Recent Orders"
              sub={`${orders.length} total orders`}
              action={
                <Link href="/dashboard/orders" className="text-xs text-stone-400 hover:text-amber-600 flex items-center gap-1 transition-colors">
                  View all <ArrowUpRight size={12} />
                </Link>
              }
            />
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
                  <ShoppingCart size={22} className="text-stone-400" />
                </div>
                <p className="text-stone-400 text-sm text-center">No orders yet.<br/>They&apos;ll appear here once customers check out.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-stone-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">#{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-stone-400 truncate">{order.customer || "Guest"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-stone-900">${order.total?.toFixed(2)}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[order.status] ?? "bg-stone-100 text-stone-500"}`}>
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <SectionHeader
              title="Low Stock Alerts"
              sub={`${lowStock.length} items need restocking`}
              action={
                <Link href="/dashboard/low-stock" className="text-xs text-stone-400 hover:text-amber-600 flex items-center gap-1 transition-colors">
                  View all <ArrowUpRight size={12} />
                </Link>
              }
            />
            {lowStock.length === 0 ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <CheckCircle size={20} className="text-amber-600" />
                <p className="text-stone-500 text-sm">All products are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {lowStock.slice(0, 8).map((p) => (
                  <div key={p.ItemUPC} className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-800 truncate">{p.ItemName}</p>
                      <p className="text-[10px] text-stone-400">{p.Department}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums ${
                      Number(p.CurrentStock) <= 2
                        ? "bg-stone-900 text-white"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {Number(p.CurrentStock).toFixed(0)} left
                    </span>
                  </div>
                ))}
                {lowStock.length > 8 && (
                  <p className="text-xs text-stone-400 text-center pt-1">+{lowStock.length - 8} more items</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <SectionHeader title="Quick Actions" sub="Jump to any admin section" />
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 transition-all group"
                >
                  <Icon size={15} className="text-stone-400 group-hover:text-amber-600 transition-colors" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>

            {/* Stock mini-summary */}
            <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "In Stock",     value: inStock,         cls: "text-stone-900"  },
                { label: "Low Stock",    value: lowStock.length, cls: "text-amber-600"  },
                { label: "Out of Stock", value: outOfStock,      cls: "text-stone-400"  },
              ].map(({ label, value, cls }) => (
                <div key={label}>
                  <p className={`text-xl font-bold ${cls}`}>{value}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Upcoming Events ── */}
        {events.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <SectionHeader
              title="Upcoming Events"
              sub={`${events.length} scheduled`}
              action={
                <Link href="/dashboard/events" className="text-xs text-stone-400 hover:text-amber-600 flex items-center gap-1 transition-colors">
                  Manage <ArrowUpRight size={12} />
                </Link>
              }
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {events.slice(0, 4).map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200 hover:border-amber-200 transition-colors">
                  <div className="bg-amber-50 text-amber-600 rounded-lg p-2 flex-shrink-0">
                    <CalendarDays size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">{event.title}</p>
                    <p className="text-[10px] text-stone-400">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
