"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ShoppingCart, Search, RefreshCw,
  Package, Clock, Truck, CheckCircle, XCircle, X, Bell, Navigation,
} from "lucide-react";
import type { AdminOrder } from "@/app/api/orders/route";

const STATUSES = ["all", "pending", "processing", "out_for_delivery", "delivered", "cancelled"] as const;

const STATUS_META: Record<string, { label: string; icon: React.ElementType; style: string; dot: string }> = {
  pending:          { label: "Pending",          icon: Clock,        style: "bg-amber-100 text-amber-800",                                dot: "bg-amber-500"  },
  processing:       { label: "Processing",       icon: Package,      style: "bg-blue-100 text-blue-800",                                  dot: "bg-blue-500"   },
  out_for_delivery: { label: "Out for Delivery", icon: Truck,        style: "bg-purple-100 text-purple-800 border border-purple-200",     dot: "bg-purple-500" },
  delivered:        { label: "Delivered",        icon: CheckCircle,  style: "bg-green-100 text-green-800",                                dot: "bg-green-500"  },
  cancelled:        { label: "Cancelled",        icon: XCircle,      style: "bg-stone-100 text-stone-400",                                dot: "bg-stone-300"  },
};

const NEXT_STATUS: Record<string, { status: AdminOrder["status"]; label: string; style: string } | null> = {
  processing:       { status: "out_for_delivery", label: "→ Out for Delivery", style: "bg-purple-600 hover:bg-purple-700 text-white" },
  out_for_delivery: { status: "delivered",        label: "→ Mark Delivered",   style: "bg-green-600 hover:bg-green-700 text-white"   },
  delivered:        null,
  cancelled:        null,
  pending:          null,
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
  const [orders, setOrders]         = useState<AdminOrder[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updating, setUpdating]     = useState<string | null>(null);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dispatching, setDispatching] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<{ id: string; msg: string } | null>(null);
  const [enabledProviders, setEnabledProviders] = useState<{ doordash: boolean; uber: boolean }>({ doordash: false, uber: false });
  const knownIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data: AdminOrder[] = await res.json();
      const list = Array.isArray(data) ? data : [];

      if (!isFirstLoad.current) {
        const incoming = list.filter((o) => !knownIds.current.has(o.id) && o.status === "pending");
        if (incoming.length > 0) {
          setNewOrderIds((prev) => {
            const next = new Set(prev);
            incoming.forEach((o) => next.add(o.id));
            return next;
          });
          setNewOrderAlert(true);
        }
      }

      knownIds.current = new Set(list.map((o) => o.id));
      isFirstLoad.current = false;
      setOrders(list);
      setLastUpdated(new Date());
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Load enabled third-party providers from delivery settings
  useEffect(() => {
    fetch("/api/delivery").then(r => r.json()).then((d) => {
      setEnabledProviders({
        doordash: d.thirdParty?.doordash?.enabled ?? false,
        uber:     d.thirdParty?.uber?.enabled ?? false,
      });
    }).catch(() => {});
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-poll every 20 seconds
  useEffect(() => {
    const id = setInterval(() => load(true), 20_000);
    return () => clearInterval(id);
  }, [load]);

  async function updateStatus(id: string, status: AdminOrder["status"]) {
    setUpdating(id);
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    // Clear new-order highlight once actioned
    setNewOrderIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setUpdating(null);
  }

  async function dispatchCourier(orderId: string, provider: "doordash" | "uber") {
    setDispatching(orderId);
    setDispatchError(null);
    const res = await fetch("/api/delivery/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, provider }),
    });
    const data = await res.json();
    if (!res.ok) {
      setDispatchError({ id: orderId, msg: data.error ?? "Dispatch failed" });
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
    }
    setDispatching(null);
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setNewOrderIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
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
    // Pending orders float to top
    return [...r].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return 0;
    });
  }, [orders, statusFilter, search]);

  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total ?? 0), 0);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  return (
    <div className="min-h-full bg-white">

      {/* New order alert banner */}
      {newOrderAlert && (
        <div className="bg-amber-500 text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Bell size={16} className="animate-bounce" />
            New order{newOrderIds.size > 1 ? `s` : ""} received! Review and accept or reject below.
          </div>
          <button
            onClick={() => { setNewOrderAlert(false); setStatusFilter("pending"); }}
            className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            View Pending <span className="bg-white text-amber-700 font-bold px-1.5 py-0.5 rounded-full text-[10px]">{newOrderIds.size}</span>
          </button>
          <button onClick={() => setNewOrderAlert(false)} className="text-white/70 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <ShoppingCart size={20} className="text-amber-600" /> All Orders
              {(counts["pending"] ?? 0) > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {counts["pending"]} new
                </span>
              )}
            </h1>
            <p className="text-sm text-stone-400 mt-0.5">
              {orders.length} orders · <span className="text-amber-600 font-semibold">${totalRevenue.toFixed(2)} revenue</span>
              {lastUpdated && (
                <span className="ml-2 text-stone-300">· updated {lastUpdated.toLocaleTimeString()}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => load()}
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
                  ? s === "pending"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-stone-900 text-white border-stone-900"
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
              <table className="w-full text-sm min-w-[760px]">
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
                  {filtered.map((order) => {
                    const isPending = order.status === "pending";
                    const isNew = newOrderIds.has(order.id);
                    const next = NEXT_STATUS[order.status];

                    return (
                      <>
                        <tr
                          key={order.id}
                          className={`transition-colors cursor-pointer ${
                            isPending
                              ? isNew
                                ? "bg-amber-50 border-l-4 border-l-amber-500"
                                : "bg-amber-50/50 border-l-4 border-l-amber-300"
                              : "hover:bg-stone-50"
                          }`}
                          onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-mono font-bold text-stone-900 text-xs">#{order.id.slice(-8).toUpperCase()}</p>
                                <p className="text-[10px] text-stone-400">{(order.items?.length ?? 0)} items</p>
                              </div>
                              {isNew && (
                                <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="text-stone-800 font-medium truncate max-w-[140px]">{order.customer || "Guest"}</p>
                            {order.email && <p className="text-xs text-stone-400 truncate max-w-[140px]">{order.email}</p>}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-xs text-stone-500">
                            {order.date ? new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
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

                          {/* Actions cell */}
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">

                              {/* Pending: Accept / Reject */}
                              {isPending && (
                                <>
                                  <button
                                    disabled={updating === order.id}
                                    onClick={() => updateStatus(order.id, "processing")}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
                                  >
                                    {updating === order.id ? "…" : "Accept"}
                                  </button>
                                  <button
                                    disabled={updating === order.id}
                                    onClick={() => updateStatus(order.id, "cancelled")}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Processing: advance manually OR dispatch courier */}
                              {order.status === "processing" && order.mode === "delivery" && (
                                <div className="flex flex-col gap-1.5 items-center">
                                  {/* Dispatch courier dropdown */}
                                  {(enabledProviders.doordash || enabledProviders.uber) && !order.thirdPartyDelivery && (
                                    <div className="flex gap-1">
                                      {enabledProviders.doordash && (
                                        <button
                                          disabled={dispatching === order.id}
                                          onClick={() => dispatchCourier(order.id, "doordash")}
                                          className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                                        >
                                          <Navigation size={10} />
                                          {dispatching === order.id ? "…" : "DoorDash"}
                                        </button>
                                      )}
                                      {enabledProviders.uber && (
                                        <button
                                          disabled={dispatching === order.id}
                                          onClick={() => dispatchCourier(order.id, "uber")}
                                          className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-black hover:bg-stone-800 text-white transition-colors disabled:opacity-50"
                                        >
                                          <Navigation size={10} />
                                          {dispatching === order.id ? "…" : "Uber"}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  {/* Error */}
                                  {dispatchError?.id === order.id && (
                                    <p className="text-[10px] text-red-500 max-w-[140px] text-center">{dispatchError.msg}</p>
                                  )}
                                  {/* Manual advance */}
                                  {next && (
                                    <button
                                      disabled={updating === order.id}
                                      onClick={() => updateStatus(order.id, next.status)}
                                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${next.style}`}
                                    >
                                      {updating === order.id ? "…" : next.label}
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Non-delivery processing or out_for_delivery: advance button */}
                              {next && order.status !== "processing" && (
                                <button
                                  disabled={updating === order.id}
                                  onClick={() => updateStatus(order.id, next.status)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${next.style}`}
                                >
                                  {updating === order.id ? "…" : next.label}
                                </button>
                              )}
                              {/* Pickup processing orders: just the advance button */}
                              {next && order.status === "processing" && order.mode !== "delivery" && (
                                <button
                                  disabled={updating === order.id}
                                  onClick={() => updateStatus(order.id, next.status)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${next.style}`}
                                >
                                  {updating === order.id ? "…" : next.label}
                                </button>
                              )}

                              {/* Delivered / Cancelled: status-only, allow manual override via select */}
                              {(order.status === "delivered" || order.status === "cancelled") && (
                                <select
                                  value={order.status}
                                  onChange={(e) => updateStatus(order.id, e.target.value as AdminOrder["status"])}
                                  disabled={updating === order.id}
                                  className="text-xs bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 outline-none cursor-pointer disabled:opacity-50"
                                >
                                  {Object.entries(STATUS_META).map(([val, { label }]) => (
                                    <option key={val} value={val}>{label}</option>
                                  ))}
                                </select>
                              )}

                            </div>
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

                                {/* Details */}
                                <div>
                                  <p className="font-semibold text-stone-700 mb-2">Details</p>
                                  <div className="space-y-1 text-stone-600">
                                    {order.address && <p>📍 {order.address}</p>}
                                    {order.promoCode && <p>🏷️ Code: <span className="font-mono bg-stone-100 px-1 rounded">{order.promoCode}</span></p>}
                                    {order.notes && <p>📝 {order.notes}</p>}
                                    <p>📅 {order.date ? new Date(order.date).toLocaleString() : "Unknown"}</p>
                                    {order.thirdPartyDelivery && (
                                      <div className="mt-2 pt-2 border-t border-stone-200 space-y-0.5">
                                        <p className="font-semibold text-stone-700">
                                          {order.thirdPartyDelivery.provider === "doordash" ? "🔴" : "⚫"}{" "}
                                          {order.thirdPartyDelivery.provider === "doordash" ? "DoorDash" : "Uber"} dispatched
                                        </p>
                                        <p className="text-stone-500">ID: <span className="font-mono">{order.thirdPartyDelivery.deliveryId}</span></p>
                                        <p className="text-stone-500">Status: {order.thirdPartyDelivery.status}</p>
                                        {order.thirdPartyDelivery.trackingUrl && (
                                          <a href={order.thirdPartyDelivery.trackingUrl} target="_blank" rel="noopener noreferrer"
                                            className="text-amber-600 hover:underline">Track driver →</a>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => deleteOrder(order.id)}
                                    className="mt-3 text-[11px] text-red-400 hover:text-red-600 transition-colors"
                                  >
                                    Delete order
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
