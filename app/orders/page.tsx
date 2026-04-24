"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useOrderHistory, StoredOrder } from "@/context/OrderHistoryContext";
import { ShoppingBag, ArrowLeft, Truck, Store } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<StoredOrder["status"], string> = {
  processing: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  confirmed:  "bg-blue-100 text-blue-700 border border-blue-200",
  ready:      "bg-green-100 text-green-700 border border-green-200",
  delivered:  "bg-stone-100 text-stone-500 border border-stone-200",
};

const STATUS_LABEL: Record<StoredOrder["status"], string> = {
  processing: "Processing",
  confirmed:  "Confirmed",
  ready:      "Ready",
  delivered:  "Delivered",
};

export default function OrdersPage() {
  const { orders } = useOrderHistory();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-8 sm:py-10">

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Shop
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-6 sm:mb-8">
            Order History
          </h1>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
              <ShoppingBag size={56} className="text-stone-300" />
              <p className="text-stone-500 text-lg font-medium">No orders yet</p>
              <p className="text-stone-400 text-sm max-w-xs">
                Once you place an order it will appear here so you can track it.
              </p>
              <Link
                href="/shop"
                className="bg-crimson hover:bg-crimson-dark text-white font-bold px-8 py-3 rounded-2xl transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-stone-100">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold text-stone-900 font-mono">
                        Order #{order.id}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-stone-500">{formatDate(order.date)}</span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.upc}
                        className="flex justify-between items-start gap-3 text-sm"
                      >
                        <span className="text-stone-700 font-medium leading-snug">{item.name}</span>
                        <span className="text-stone-500 whitespace-nowrap text-xs">
                          x{item.qty} &nbsp;
                          <span className="font-semibold text-stone-700">
                            ${(item.price * item.qty).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card footer */}
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-stone-50 border-t border-stone-100">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      order.mode === "delivery"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-green-50 text-green-600 border-green-200"
                    }`}>
                      {order.mode === "delivery" ? (
                        <Truck size={12} />
                      ) : (
                        <Store size={12} />
                      )}
                      {order.mode === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                    <span className="text-sm font-bold text-crimson">
                      Total: ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
