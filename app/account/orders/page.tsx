"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { AdminOrder } from "@/app/api/orders/route";

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending:          { label: "Pending",          icon: Clock,        color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  processing:       { label: "Processing",       icon: Package,      color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck,        color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  delivered:        { label: "Delivered",        icon: CheckCircle,  color: "text-green-700",  bg: "bg-green-50 border-green-200" },
  cancelled:        { label: "Cancelled",        icon: XCircle,      color: "text-stone-400",  bg: "bg-stone-50 border-stone-200" },
};

export default function MyOrdersPage() {
  const [orders, setOrders]   = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders/my")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setOrders(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <ShoppingBag size={40} className="text-stone-200 mx-auto mb-4" />
        <h3 className="font-bold text-stone-900 mb-1">No orders yet</h3>
        <p className="text-stone-500 text-sm">Your order history will appear here.</p>
        <Link href="/shop" className="mt-4 inline-block bg-crimson text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-crimson/90 transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-stone-900 text-lg">Order History</h2>
      {orders.map((order) => {
        const meta = STATUS_META[order.status] ?? STATUS_META.pending;
        const Icon = meta.icon;
        const open = expanded === order.id;
        return (
          <div key={order.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            {/* Header row */}
            <button
              onClick={() => setExpanded(open ? null : order.id)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-bold text-stone-900 text-sm">{order.id}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {new Date(order.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    {" · "}
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    {" · "}
                    {order.mode === "delivery" ? "Delivery" : "Pickup"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-stone-900">${order.total.toFixed(2)}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
                    <Icon size={10} /> {meta.label}
                  </span>
                </div>
                {open ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
              </div>
            </button>

            {/* Expanded details */}
            {open && (
              <div className="border-t border-stone-100 p-4 sm:p-5 space-y-4">
                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Items</p>
                  <div className="space-y-1.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-stone-700">{item.name} <span className="text-stone-400">×{item.qty}</span></span>
                        <span className="font-medium text-stone-900">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-stone-100 pt-3 space-y-1">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span><span>−${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Tax</span><span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Delivery</span><span>{order.delivery > 0 ? `$${order.delivery.toFixed(2)}` : "Free"}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-100">
                    <span>Total</span><span>${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery address */}
                {order.address && (
                  <div className="text-sm text-stone-600 bg-stone-50 rounded-xl px-3 py-2">
                    <span className="font-medium">Delivered to:</span> {order.address}
                  </div>
                )}

                {/* Tracking */}
                {order.thirdPartyDelivery?.trackingUrl && (
                  <a
                    href={order.thirdPartyDelivery.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-crimson hover:underline"
                  >
                    <Truck size={13} /> Track your delivery
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
