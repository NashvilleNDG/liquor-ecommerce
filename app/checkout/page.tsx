"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useOrderHistory } from "@/context/OrderHistoryContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import StripeCheckout from "@/components/StripeCheckout";
import {
  ShoppingBag, ArrowLeft, Truck, Store,
  User, Mail, Phone, MapPin, Tag, X,
} from "lucide-react";

type DeliveryMode = "delivery" | "pickup";

const VALID_PROMOS: Record<string, number> = {
  WELCOME10: 0.10,
  SRTB15:    0.15,
  SAVE20:    0.20,
};

function Field({
  label, id, type = "text", placeholder, required, value, onChange, icon: Icon,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  required?: boolean; value: string; onChange: (v: string) => void;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
        {label} {required && <span className="text-crimson">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-stone-50 border border-stone-200 focus:border-crimson rounded-xl text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors py-3 ${Icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const { addOrder } = useOrderHistory();
  const subtotal = state.items.reduce((s, i) => s + Number(i.Price) * i.quantity, 0);
  const tax      = subtotal * 0.0975; // Tennessee sales tax ~9.75%
  const freeShip = subtotal >= 99;

  const [mode, setMode]     = useState<DeliveryMode>("delivery");
  const [form, setForm]     = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
    notes: "",
  });
  const [submitting] = useState(false);

  const [promoInput, setPromoInput]   = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError]   = useState("");

  const discount      = appliedCode ? subtotal * (VALID_PROMOS[appliedCode] ?? 0) : 0;
  const deliveryFee   = freeShip || mode === "pickup" ? 0 : 9.99;
  const orderTotal    = subtotal - discount + tax + deliveryFee;

  function set(field: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [field]: v }));
  }

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (VALID_PROMOS[code]) {
      setAppliedCode(code);
      setPromoError("");
      setPromoInput("");
    } else {
      setPromoError("Invalid promo code");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  if (state.items.length === 0 && !submitting) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
          <ShoppingBag size={56} className="text-stone-300" />
          <p className="text-stone-500 text-lg font-medium">Your cart is empty</p>
          <Link href="/shop" className="bg-crimson hover:bg-crimson-dark text-white font-bold px-8 py-3 rounded-2xl transition-colors">
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
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8 sm:py-10">

          <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6">
            <ArrowLeft size={14} /> Continue shopping
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-6 sm:mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">

              {/* Left — form */}
              <div className="lg:col-span-2 space-y-5">

                {/* Delivery mode */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
                  <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Fulfillment Method</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { id: "delivery", label: "Home Delivery", icon: Truck,  desc: "Free over $99" },
                      { id: "pickup",   label: "Store Pickup",  icon: Store,  desc: "Ready same day" },
                    ] as { id: DeliveryMode; label: string; icon: React.ElementType; desc: string }[]).map(({ id, label, icon: Icon, desc }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setMode(id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center ${
                          mode === id
                            ? "border-crimson bg-red-50 text-crimson"
                            : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-bold text-stone-800 leading-tight">{label}</span>
                        <span className="text-xs text-stone-400">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact info */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
                  <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name" id="firstName" placeholder="John"  required value={form.firstName} onChange={set("firstName")} icon={User} />
                    <Field label="Last Name"  id="lastName"  placeholder="Smith" required value={form.lastName}  onChange={set("lastName")} />
                  </div>
                  <Field label="Email"  id="email" type="email" placeholder="john@example.com" required value={form.email} onChange={set("email")} icon={Mail} />
                  <Field label="Phone"  id="phone" type="tel"   placeholder="(615) 000-0000"   required value={form.phone} onChange={set("phone")} icon={Phone} />
                </div>

                {/* Delivery address */}
                {mode === "delivery" && (
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
                    <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Delivery Address</h2>
                    <Field label="Street Address" id="address" placeholder="123 Main St" required value={form.address} onChange={set("address")} icon={MapPin} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <Field label="City"  id="city"  placeholder="Murfreesboro" required value={form.city}  onChange={set("city")} />
                      </div>
                      <Field label="State" id="state" placeholder="TN" required value={form.state} onChange={set("state")} />
                    </div>
                    <Field label="ZIP Code" id="zip" placeholder="37129" required value={form.zip} onChange={set("zip")} />
                    <p className="text-xs text-stone-400">
                      We currently deliver within Rutherford County and surrounding areas. Enter your address to confirm availability.
                    </p>
                  </div>
                )}

                {/* Pickup info */}
                {mode === "pickup" && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-crimson font-bold text-sm">
                      <Store size={16} /> Pickup Location
                    </div>
                    <p className="text-stone-800 font-semibold text-sm">Stones River Total Beverages</p>
                    <p className="text-stone-600 text-sm">208 North Thompson Lane, Murfreesboro, TN 37129</p>
                    <p className="text-stone-500 text-xs">Mon–Thu 9AM–10PM · Fri–Sat 9AM–11PM · Sun 12PM–8PM</p>
                    <a
                      href="https://maps.google.com/?q=208+North+Thompson+Lane+Murfreesboro+TN+37129"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-crimson hover:underline mt-1"
                    >
                      <MapPin size={11} /> Get directions
                    </a>
                    <p className="text-stone-400 text-xs pt-1">We&apos;ll send a confirmation email when your order is ready.</p>
                  </div>
                )}

                {/* Order notes */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
                  <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Order Notes <span className="text-stone-300 font-normal normal-case">(optional)</span>
                  </h2>
                  <textarea
                    placeholder="Special instructions, gate codes, etc."
                    value={form.notes}
                    onChange={(e) => set("notes")(e.target.value)}
                    rows={3}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-crimson rounded-xl text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors p-4 resize-none"
                  />
                </div>
              </div>

              {/* Right — order summary */}
              <div className="space-y-5">
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 lg:sticky lg:top-24">
                  <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Order Summary</h2>

                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1 scrollbar-none">
                    {state.items.map((item) => (
                      <div key={item.ItemUPC} className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-800 truncate">{item.ItemName}</p>
                          <p className="text-[10px] text-stone-400">{item.Size} × {item.quantity}</p>
                        </div>
                        <p className="text-stone-900 font-bold text-xs whitespace-nowrap">
                          ${(Number(item.Price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Promo code */}
                  {appliedCode ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2 text-green-700 text-xs font-bold">
                        <Tag size={12} />
                        {appliedCode} — {(VALID_PROMOS[appliedCode] * 100).toFixed(0)}% off
                      </div>
                      <button onClick={() => setAppliedCode(null)} className="text-green-400 hover:text-red-500 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                          <Tag size={12} className="text-stone-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                            placeholder="Promo code"
                            className="flex-1 bg-transparent text-xs text-stone-900 placeholder-stone-400 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={applyPromo}
                          className="bg-crimson hover:bg-crimson-dark text-white text-xs font-bold px-3 rounded-xl transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && <p className="text-[11px] text-red-500 pl-1">{promoError}</p>}
                    </div>
                  )}

                  {/* Totals */}
                  <div className="border-t border-stone-100 pt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between text-stone-500">
                      <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount</span><span>−${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-500">
                      <span>Tax (9.75%)</span><span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Delivery</span>
                      <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                        {deliveryFee === 0 ? "Free" : "$9.99"}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-900 font-bold text-base border-t border-stone-100 pt-2">
                      <span>Total</span>
                      <span className="text-crimson">${orderTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Age confirmation */}
                  <div className="flex items-start gap-2 bg-stone-50 rounded-xl p-3 border border-stone-100">
                    <input type="checkbox" id="age21" required className="mt-0.5 accent-crimson w-4 h-4 flex-shrink-0 cursor-pointer" />
                    <label htmlFor="age21" className="text-xs text-stone-500 cursor-pointer">
                      I confirm I am <strong className="text-stone-900">21 years or older</strong> and agree to the age verification policy.
                    </label>
                  </div>

                  <StripeCheckout
                    amount={orderTotal}
                    onSuccess={() => {
                      const orderId = Math.random().toString(16).slice(2, 10).toUpperCase();
                      const address =
                        mode === "delivery"
                          ? `${form.address}, ${form.city}, ${form.state} ${form.zip}`.trim()
                          : undefined;
                      addOrder({
                        id: orderId,
                        date: new Date().toISOString(),
                        items: state.items.map((item) => ({
                          name: item.ItemName,
                          upc: item.ItemUPC,
                          qty: item.quantity,
                          price: Number(item.Price),
                          dept: item.Department ?? "",
                        })),
                        subtotal,
                        discount,
                        tax,
                        delivery: deliveryFee,
                        total: orderTotal,
                        mode,
                        address,
                        promoCode: appliedCode ?? undefined,
                        status: "processing",
                      });
                      dispatch({ type: "CLEAR" });
                      router.push(`/checkout/success?order=${orderId}`);
                    }}
                    submitting={submitting}
                  />
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
