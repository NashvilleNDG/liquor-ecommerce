"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart, Search, ChevronDown, RefreshCw,
  Package, Clock, Truck, CheckCircle, XCircle, Filter, X,
} from "lucide-react";
import type { AdminOrder } from "@/app/api/orders/route";

const STATUSES = ["all", "pending", "processing", "out_for_delivery", "delivered", "cancelled"] as const;

const STATUS_META: Record<string, { label: string; icon: React.ElementType; style: string; dot: string }> = {
  pending:          { label: "Pending",          icon: Clock,        style: "bg-stone-100 text-stone-600",    dot: "bg-stone-400"  },
  processing:       { label: "Processing",       icon: Package,      style: "bg-amber-100 text-amber-800",    dot: "bg-amber-500"  },
  out_for_delivery: { label: "Out for Delivery", icon: Truck,        style: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
  delivered:        { label: "Delivered",        icon: CheckCircle,  style: "bg-stone-900 text-white",        dot: "bg-stone-600"  },
  cancelled:        { label: "Cancelled",        icon: XCircle,      style: "bg-stone-100 text-stone-400",    dot: "bg-stone-300"  },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta.style}`}>
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders]     = useState<AdminOrder[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as AdminOrder["status"] } : o));
    setUpdating(null);
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  const filtered = useMemo(() => {
    let r = orders;
    if (statusFilter !== "all") r = r.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        (o.customer ?? "").toLowerCase().includes(q) ||
        (o.email ?? "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [orders, statusFilter, search]);

  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total ?? 0), 0);

  // Summary counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  return (
    <div className="min-h-full bg-white">

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <ShoppingCart size={20} className="text-amber-600" /> All Orders
            </h1>
            <p className="text-sm text-stone-400 mt-0.5">
              {orders.length} orders · <span className="text-amber-600 font-semibold">${totalRevenue.toFixed(2)} revenue</span>
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 px-3 py-2 rounded-xl transition-all"
          >
            <RefreshCw size={14} className={`text-stone-500 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-5 max-w-screen-2xl mx-auto">

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                statusFilter === s
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {s !== "all" && <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[s]?.dot}`} />}
              {s === "all" ? "All Orders" : STATUS_META[s]?.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === s ? "bg-white/20" : "bg-stone-100"}`}>
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer…"
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-400 text-stone-900 placeholder-stone-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Orders table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-16 flex items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-amber-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center">
              <ShoppingCart size={28} className="text-stone-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-stone-700">No orders found</p>
              <p className="text-sm text-stone-400 mt-1">
                {orders.length === 0
                  ? "Orders will appear here once customers complete checkout."
                  : "Try adjusting your filters."}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Customer</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Mode</th>
                  <th className="text-right text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-center text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-center text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="hover:bg-stone-50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-mono font-bold text-stone-900 text-xs">#{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-stone-400">{(order.items?.length ?? 0)} items</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-stone-800 font-medium truncate max-w-[140px]">{order.customer || "Guest"}</p>
                        {order.email && <p className="text-xs text-stone-400 truncate max-w-[140px]">{order.email}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-stone-500">
                        {order.date ? new Date(order.date).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.mode === "delivery" ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-600"}`}>
                          {order.mode === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-stone-900">
                        ${(order.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className="text-xs bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 outline-none cursor-pointer disabled:opacity-50"
                        >
                          {Object.entries(STATUS_META).map(([val, { label }]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expanded === order.id && (
                      <tr key={`${order.id}-exp`} className="bg-stone-50 border-t border-stone-100">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            {/* Items */}
                            <div>
                              <p className="font-semibold text-stone-700 mb-2">Items</p>
                              {order.items?.length ? (
                                <div className="space-y-1">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between">
                                      <span className="text-stone-600 truncate">{item.qty}× {item.name}</span>
                                      <span className="text-stone-800 font-medium ml-2">${(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : <p className="text-stone-400">No item details</p>}
                            </div>

                            {/* Totals */}
                            <div>
                              <p className="font-semibold text-stone-700 mb-2">Totals</p>
                              <div className="space-y-1">
                                <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>${(order.subtotal ?? 0).toFixed(2)}</span></div>
                                {order.discount > 0 && <div className="flex justify-between"><span className="text-stone-500">Discount</span><span className="text-amber-600">-${order.discount.toFixed(2)}</span></div>}
                                <div className="flex justify-between"><span className="text-stone-500">Tax</span><span>${(order.tax ?? 0).toFixed(2)}</span></div>
                                {order.mode === "delivery" && <div className="flex justify-between"><span className="text-stone-500">Delivery</span><span>${(order.delivery ?? 0).toFixed(2)}</span></div>}
                                <div className="flex justify-between font-bold pt-1 border-t border-stone-200"><span>Total</span><span>${(order.total ?? 0).toFixed(2)}</span></div>
                              </div>
                            </div>

                            {/* Info */}
                            <div>
                              <p className="font-semibold text-stone-700 mb-2">Details</p>
                              <div className="space-y-1 text-stone-600">
                                {order.address && <p>📍 {order.address}</p>}
                                {order.promoCode && <p>🏷️ Code: <span className="font-mono bg-stone-100 px-1 rounded">{order.promoCode}</span></p>}
                                {order.notes && <p>📝 {order.notes}</p>}
                                <p>📅 {order.date ? new Date(order.date).toLocaleString() : "Unknown"}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
