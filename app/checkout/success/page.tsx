"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, ShoppingBag, ArrowRight, Package, Truck, Clock, ListOrdered } from "lucide-react";

const STEPS = [
  { icon: CheckCircle, label: "Order Received",   desc: "We've got your order",   done: true  },
  { icon: Package,     label: "Being Prepared",   desc: "Staff is picking items", done: true  },
  { icon: Truck,       label: "Out for Delivery", desc: "On its way to you",      done: false },
  { icon: Clock,       label: "Delivered",        desc: "Enjoy!",                 done: false },
];

function SuccessContent() {
  const params = useSearchParams();
  const orderNum = params.get("order") ?? Math.random().toString(16).slice(2, 10).toUpperCase();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full space-y-8 text-center">

        {/* Success icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-crimson/10 border-2 border-crimson/30 flex items-center justify-center">
              <CheckCircle size={48} className="text-crimson" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-crimson flex items-center justify-center text-white text-sm font-bold">
              ✓
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-stone-900">Order Placed!</h1>
          <p className="text-stone-500">
            Thank you for your order. We've received it and will prepare it shortly.
          </p>
        </div>

        {/* Order number */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-1">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Order Number</p>
          <p className="text-2xl font-bold text-crimson font-mono">#{orderNum}</p>
          <p className="text-xs text-stone-400">Save this for your records. Confirmation sent to your email.</p>
        </div>

        {/* Order tracking steps */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 text-left">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">Order Status</h2>
          {STEPS.map(({ icon: Icon, label, desc, done }) => (
            <div key={label} className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${done ? "bg-crimson/10 border-2 border-crimson/30" : "bg-stone-100 border-2 border-stone-200"}`}>
                <Icon size={16} className={done ? "text-crimson" : "text-stone-400"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${done ? "text-stone-900" : "text-stone-400"}`}>{label}</p>
                <p className="text-xs text-stone-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What's next */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-left space-y-2">
          <p className="text-crimson font-semibold text-sm">What happens next?</p>
          <ul className="text-stone-500 text-xs space-y-1.5">
            <li>• You'll receive an email confirmation shortly</li>
            <li>• Our team will prepare your order within 1–2 hours</li>
            <li>• For pickup orders: we'll notify you when ready</li>
            <li>• For delivery: estimated 2–4 hours</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-dark text-white font-bold py-3.5 rounded-2xl transition-colors"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-semibold py-3.5 rounded-2xl transition-colors"
          >
            <ListOrdered size={16} />
            View Order History <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-crimson border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
