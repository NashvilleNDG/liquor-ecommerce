"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Star, Heart, Gift, ChevronRight, Package, CheckCircle, Clock } from "lucide-react";
import type { AdminOrder } from "@/app/api/orders/route";

export default function AccountPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/my")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setOrders(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpent  = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const recent      = orders.slice(0, 3);

  const STATUS_ICON: Record<string, React.ElementType> = {
    pending:          Clock,
    processing:       Package,
    out_for_delivery: Package,
    delivered:        CheckCircle,
    cancelled:        Clock,
  };
  const STATUS_COLOR: Record<string, string> = {
    pending:          "text-amber-600",
    processing:       "text-blue-600",
    out_for_delivery: "text-purple-600",
    delivered:        "text-green-600",
    cancelled:        "text-stone-400",
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders",  value: totalOrders,            icon: ShoppingBag, color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Total Spent",   value: `$${totalSpent.toFixed(2)}`, icon: Gift,    color: "text-green-600",  bg: "bg-green-50" },
          { label: "Loyalty Points", value: "—",                   icon: Star,        color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Saved Items",   value: "—",                    icon: Heart,       color: "text-crimson",    bg: "bg-red-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-4">
            <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-stone-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs text-crimson font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag size={36} className="text-stone-200 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No orders yet</p>
            <Link href="/shop" className="mt-3 inline-block text-xs text-crimson font-medium hover:underline">
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((o) => {
              const Icon  = STATUS_ICON[o.status] ?? Clock;
              const color = STATUS_COLOR[o.status] ?? "text-stone-500";
              return (
                <div key={o.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{o.id}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {new Date(o.date).toLocaleDateString()} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-900">${o.total.toFixed(2)}</p>
                    <p className={`text-xs font-medium flex items-center gap-1 justify-end ${color}`}>
                      <Icon size={11} />
                      {o.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { href: "/shop",              label: "Browse the Shop",     desc: "Find your next favorite", icon: ShoppingBag },
          { href: "/account/profile",   label: "Edit Profile",        desc: "Update your info",         icon: Star },
        ].map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 bg-white border border-stone-200 rounded-2xl p-4 hover:border-crimson/30 hover:shadow-sm transition-all"
          >
            <div className="bg-crimson/10 rounded-xl p-3">
              <Icon size={20} className="text-crimson" />
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm">{label}</p>
              <p className="text-xs text-stone-500">{desc}</p>
            </div>
            <ChevronRight size={14} className="text-stone-400 ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}
