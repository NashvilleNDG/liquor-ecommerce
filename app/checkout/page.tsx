"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ShoppingBag, ArrowLeft, Truck, Store, CreditCard,
  User, Mail, Phone, MapPin, ChevronRight, Lock
} from "lucide-react";

type DeliveryMode = "delivery" | "pickup";

function Field({
  label, id, type = "text", placeholder, required, value, onChange, icon: Icon,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  required?: boolean; value: string; onChange: (v: string) => void;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 dark:focus:border-amber-500 rounded-xl text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none transition-colors py-3 ${Icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const router = useRouter();

  const subtotal  = state.items.reduce((s, i) => s + Number(i.Price) * i.quantity, 0);
  const tax       = subtotal * 0.08;
  const freeShip  = subtotal >= 99;

  const [mode, setMode] = useState<DeliveryMode>("delivery");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [field]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      dispatch({ type: "CLEAR" });
      router.push("/checkout/success");
    }, 1200);
  }

  const orderTotal = subtotal + tax + (freeShip || mode === "pickup" ? 0 : 9.99);

  if (state.items.length === 0 && !submitting) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
          <ShoppingBag size={56} className="text-stone-300 dark:text-stone-700" />
          <p className="text-stone-500 dark:text-stone-400 text-lg font-medium">Your cart is empty</p>
          <Link href="/shop" className="bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold px-8 py-3 rounded-2xl transition-colors">
            Browse Products
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8 sm:py-10">

          <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft size={14} /> Continue shopping
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6 sm:mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            {/* On mobile: stacked (form then summary). On lg: 3-col with summary sticky. */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">

              {/* Left — form (spans 2 cols on lg) */}
              <div className="lg:col-span-2 space-y-5 sm:space-y-6">

                {/* Delivery mode */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Fulfillment Method</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { id: "delivery", label: "Home Delivery", icon: Truck,  desc: "Free over $99" },
                      { id: "pickup",   label: "Store Pickup",  icon: Store,  desc: "Ready same day" },
                    ] as { id: DeliveryMode; label: string; icon: React.ElementType; desc: string }[]).map(({ id, label, icon: Icon, desc }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setMode(id)}
                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border transition-all text-center ${
                          mode === id
                            ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-semibold text-stone-800 dark:text-white leading-tight">{label}</span>
                        <span className="text-xs text-stone-400 dark:text-stone-500">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact info */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name" id="firstName" placeholder="John"  required value={form.firstName} onChange={set("firstName")} icon={User} />
                    <Field label="Last Name"  id="lastName"  placeholder="Smith" required value={form.lastName}  onChange={set("lastName")} />
                  </div>
                  <Field label="Email"  id="email" type="email" placeholder="john@example.com" required value={form.email} onChange={set("email")} icon={Mail} />
                  <Field label="Phone"  id="phone" type="tel"   placeholder="(555) 000-0000"   required value={form.phone} onChange={set("phone")} icon={Phone} />
                </div>

                {/* Delivery address */}
                {mode === "delivery" && (
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
                    <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Delivery Address</h2>
                    <Field label="Street Address" id="address" placeholder="123 Main St" required value={form.address} onChange={set("address")} icon={MapPin} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <Field label="City"  id="city"  placeholder="Nashville" required value={form.city}  onChange={set("city")} />
                      </div>
                      <Field label="State" id="state" placeholder="TN" required value={form.state} onChange={set("state")} />
                    </div>
                    <Field label="ZIP Code" id="zip" placeholder="37201" required value={form.zip} onChange={set("zip")} />
                  </div>
                )}

                {/* Pickup info */}
                {mode === "pickup" && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                      <Store size={16} /> Pickup Location
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-sm">123 Main Street, Your City, ST 00000</p>
                    <p className="text-stone-500 dark:text-stone-500 text-xs">Mon–Thu 9AM–10PM · Fri–Sat 9AM–11PM · Sun 12PM–8PM</p>
                    <p className="text-stone-400 dark:text-stone-500 text-xs mt-2">We&apos;ll send a confirmation email when your order is ready.</p>
                  </div>
                )}

                {/* Order notes */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Order Notes <span className="text-stone-300 dark:text-stone-700 font-normal normal-case">(optional)</span>
                  </h2>
                  <textarea
                    placeholder="Special instructions, gate codes, etc."
                    value={form.notes}
                    onChange={(e) => set("notes")(e.target.value)}
                    rows={3}
                    className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 rounded-xl text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none transition-colors p-4 resize-none"
                  />
                </div>
              </div>

              {/* Right — order summary */}
              <div className="space-y-5">
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4 lg:sticky lg:top-24">
                  <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Order Summary</h2>

                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1 scrollbar-none">
                    {state.items.map((item) => (
                      <div key={item.ItemUPC} className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-800 dark:text-white truncate">{item.ItemName}</p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-600">{item.Size} × {item.quantity}</p>
                        </div>
                        <p className="text-amber-600 dark:text-amber-400 font-semibold text-xs whitespace-nowrap">
                          ${(Number(item.Price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-stone-500 dark:text-stone-400">
                      <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500 dark:text-stone-400">
                      <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500 dark:text-stone-400">
                      <span>Delivery</span>
                      <span className="text-green-600 dark:text-green-400">{freeShip || mode === "pickup" ? "Free" : "$9.99"}</span>
                    </div>
                    <div className="flex justify-between text-stone-900 dark:text-white font-bold text-base border-t border-stone-100 dark:border-stone-800 pt-2">
                      <span>Total</span>
                      <span>${orderTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Age confirmation */}
                  <div className="flex items-start gap-2 bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
                    <input type="checkbox" id="age21" required className="mt-0.5 accent-yellow-500 w-4 h-4 flex-shrink-0 cursor-pointer" />
                    <label htmlFor="age21" className="text-xs text-stone-500 dark:text-stone-400 cursor-pointer">
                      I confirm I am <strong className="text-stone-900 dark:text-white">21 years or older</strong> and agree to the age verification policy.
                    </label>
                  </div>

                  {/* Payment placeholder */}
                  <div className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-stone-400 dark:text-stone-400 text-xs">
                      <Lock size={11} />
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {["VISA", "MC", "AMEX", "DISC"].map((c) => (
                        <span key={c} className="text-[10px] font-bold bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded">{c}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-400 dark:text-stone-600">Stripe integration coming soon</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-stone-900 font-bold py-4 rounded-2xl text-base transition-all"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                        Placing Order…
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Place Order <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
