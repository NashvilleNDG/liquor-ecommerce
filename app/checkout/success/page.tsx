"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, ShoppingBag, ArrowRight, Package, Truck, Clock } from "lucide-react";

const ORDER_NUM = () => Math.floor(100000 + Math.random() * 900000).toString();

const STEPS = [
  { icon: CheckCircle, label: "Order Received",    desc: "We've got your order",    done: true  },
  { icon: Package,     label: "Being Prepared",    desc: "Staff is picking items",  done: true  },
  { icon: Truck,       label: "Out for Delivery",  desc: "On its way to you",       done: false },
  { icon: Clock,       label: "Delivered",         desc: "Enjoy!",                  done: false },
];

export default function SuccessPage() {
  const orderNum = ORDER_NUM();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full space-y-8 text-center">

          {/* Success icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                <CheckCircle size={48} className="text-green-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-gray-900 text-lg">
                🎉
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white">Order Placed!</h1>
            <p className="text-gray-400">
              Thank you for your order. We've received it and will prepare it shortly.
            </p>
          </div>

          {/* Order number */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Order Number</p>
            <p className="text-2xl font-bold text-amber-400 font-mono">#{orderNum}</p>
            <p className="text-xs text-gray-600">Save this for your records. Confirmation sent to your email.</p>
          </div>

          {/* Order tracking steps */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 text-left">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Order Status</h2>
            {STEPS.map(({ icon: Icon, label, desc, done }, i) => (
              <div key={label} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${done ? "bg-green-500/10 border-2 border-green-500/40" : "bg-gray-800 border-2 border-gray-700"}`}>
                  <Icon size={16} className={done ? "text-green-400" : "text-gray-600"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${done ? "text-white" : "text-gray-600"}`}>{label}</p>
                  <p className="text-xs text-gray-600">{desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden" /> // connector line handled by spacing
                )}
              </div>
            ))}
          </div>

          {/* What's next */}
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-5 text-left space-y-2">
            <p className="text-amber-400 font-semibold text-sm">What happens next?</p>
            <ul className="text-gray-400 text-xs space-y-1.5">
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
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3.5 rounded-2xl transition-all hover:scale-105"
            >
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3.5 rounded-2xl transition-colors"
            >
              Back to Home <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
