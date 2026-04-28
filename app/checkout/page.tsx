"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useOrderHistory } from "@/context/OrderHistoryContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import StripeCheckout from "@/components/StripeCheckout";
import {
  ShoppingBag, ArrowLeft, Truck, Store,
  User, Mail, Phone, MapPin, Tag, X, Loader2, CheckCircle,
} from "lucide-react";

type DeliveryMode = "delivery" | "pickup";

interface DeliverySettings {
  enabled: boolean;
  fee: number;
  freeThreshold: number;
  estimatedTime: string;
  maxDistance: number;
}

interface StoreSettings {
  storeName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  taxRate: number;
  minOrderAmount: number;
  hoursMonFri: string;
  hoursSat: string;
  hoursSun: string;
  phone: string;
}

const DEFAULT_DELIVERY: DeliverySettings = {
  enabled: true, fee: 9.99, freeThreshold: 99,
  estimatedTime: "45–60 minutes", maxDistance: 15,
};
const DEFAULT_STORE: StoreSettings = {
  storeName: "Stones River Total Beverages",
  address: "208 North Thompson Lane", city: "Murfreesboro", state: "TN", zip: "37129",
  taxRate: 9.75, minOrderAmount: 0,
  hoursMonFri: "Mon–Fri 9AM–10PM", hoursSat: "Sat 9AM–11PM", hoursSun: "Sun 12PM–8PM",
  phone: "(615) 555-0100",
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

  // Dynamic settings loaded from admin dashboard
  const [delivery, setDelivery] = useState<DeliverySettings>(DEFAULT_DELIVERY);
  const [store,    setStore]    = useState<StoreSettings>(DEFAULT_STORE);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/delivery").then(r => r.json()).catch(() => DEFAULT_DELIVERY),
      fetch("/api/settings").then(r => r.json()).catch(() => DEFAULT_STORE),
    ]).then(([d, s]) => {
      setDelivery({ ...DEFAULT_DELIVERY, ...d });
      setStore({ ...DEFAULT_STORE, ...s });
      setSettingsLoaded(true);
    });
  }, []);

  const subtotal = state.items.reduce((s, i) => s + Number(i.Price) * i.quantity, 0);
  const [mode, setMode] = useState<DeliveryMode>("delivery");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
    notes: "",
  });
  const [submitting,    setSubmitting]    = useState(false);
  const [ageConfirmed,  setAgeConfirmed]  = useState(false);

  // Address autocomplete
  const [suggestions,     setSuggestions]     = useState<{ display: string; street: string; city: string; state: string; zip: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "delivery") return;
    const q = form.address.trim();
    if (q.length < 4) { setSuggestions([]); setShowSuggestions(false); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ", Tennessee, US")}&format=json&limit=5&countrycodes=us&addressdetails=1`,
          { headers: { "User-Agent": "StonesRiverBeverages/1.0" } }
        );
        const data = await res.json();
        const parsed = (data as Record<string, unknown>[])
          .filter((r) => (r.address as Record<string, string>)?.road)
          .map((r) => {
            const a = r.address as Record<string, string>;
            return {
              display: (r.display_name as string).split(",").slice(0, 4).join(",").trim(),
              street:  `${a.house_number ?? ""} ${a.road ?? ""}`.trim(),
              city:    a.city ?? a.town ?? a.village ?? "",
              state:   a.state ?? "",
              zip:     a.postcode ?? "",
            };
          });
        setSuggestions(parsed);
        setShowSuggestions(parsed.length > 0);
      } catch { setSuggestions([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [form.address, mode]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function selectSuggestion(s: { street: string; city: string; state: string; zip: string }) {
    setForm(f => ({ ...f, address: s.street, city: s.city, state: s.state, zip: s.zip }));
    setShowSuggestions(false);
  }

  // Distance-based delivery fee
  const [deliveryQuote, setDeliveryQuote] = useState<{ fee: number; miles: number } | null>(null);
  const [quoteLoading,  setQuoteLoading]  = useState(false);
  const [quoteError,    setQuoteError]    = useState("");

  // Promo code state
  const [promoInput,    setPromoInput]    = useState("");
  const [appliedCode,   setAppliedCode]   = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedType,   setAppliedType]   = useState<"percent" | "fixed">("percent");
  const [appliedValue,  setAppliedValue]  = useState(0);
  const [promoError,    setPromoError]    = useState("");
  const [promoLoading,  setPromoLoading]  = useState(false);

  // Dynamic calculations using admin settings
  const taxRate      = (store.taxRate ?? 9.75) / 100;
  const tax          = subtotal * taxRate;
  const isFreeShip   = delivery.freeThreshold > 0 && subtotal >= delivery.freeThreshold;
  const baseDeliveryFee = deliveryQuote?.fee ?? (delivery.baseFee ?? delivery.fee);
  const deliveryFee  = isFreeShip || mode === "pickup" ? 0 : baseDeliveryFee;
  const discount     = appliedCode ? appliedDiscount : 0;
  const orderTotal   = Math.max(0, subtotal - discount + tax + deliveryFee);

  // Fetch distance-based delivery quote whenever address is complete
  useEffect(() => {
    if (mode !== "delivery") return;
    const { address, city, state, zip } = form;
    if (!address.trim() || !city.trim() || !zip.trim()) {
      setDeliveryQuote(null);
      setQuoteError("");
      return;
    }
    const full = `${address}, ${city}, ${state || "TN"} ${zip}`;
    setQuoteLoading(true);
    setQuoteError("");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/delivery/quote?address=${encodeURIComponent(full)}`);
        const data = await res.json();
        if (!res.ok) {
          setQuoteError(data.error ?? "Could not calculate delivery fee");
          setDeliveryQuote(null);
        } else {
          setDeliveryQuote({ fee: data.fee, miles: data.miles });
          setQuoteError("");
        }
      } catch {
        setQuoteError("Could not calculate delivery fee");
      }
      setQuoteLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [form.address, form.city, form.state, form.zip, mode]);

  function set(field: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [field]: v }));
  }

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderAmount: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCode(data.code);
        setAppliedDiscount(data.discountAmount);
        setAppliedType(data.type);
        setAppliedValue(data.value);
        setPromoInput("");
      } else {
        setPromoError(data.error ?? "Invalid promo code");
      }
    } catch {
      setPromoError("Could not validate code. Try again.");
    }
    setPromoLoading(false);
  }

  function removePromo() {
    setAppliedCode(null);
    setAppliedDiscount(0);
  }

  async function saveOrder() {
    if (submitting) return;
    setSubmitting(true);
    const orderId = `ORD-${Date.now()}`;
    const address =
      mode === "delivery"
        ? `${form.address}, ${form.city}, ${form.state} ${form.zip}`.trim()
        : undefined;

    const orderPayload = {
      id: orderId,
      date: new Date().toISOString(),
      customer: `${form.firstName} ${form.lastName}`.trim() || "Guest",
      email: form.email,
      items: state.items.map((item) => ({
        name: item.ItemName,
        qty: item.quantity,
        price: Number(item.Price),
      })),
      subtotal,
      discount,
      tax,
      delivery: deliveryFee,
      total: orderTotal,
      mode,
      address,
      promoCode: appliedCode ?? undefined,
      status: "pending" as const,
      notes: form.notes || undefined,
    };

    // Save to admin dashboard orders
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    }).catch(() => {/* non-critical */});

    // Also save to user's local order history
    addOrder({
      id: orderId,
      date: orderPayload.date,
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveOrder();
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

  const promoLabel = appliedCode
    ? appliedType === "percent"
      ? `${appliedValue}% off`
      : `$${appliedValue.toFixed(2)} off`
    : "";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
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
                      {
                        id: "delivery", label: "Home Delivery", icon: Truck,
                        desc: delivery.freeThreshold > 0
                          ? `$${(delivery.baseFee ?? 5).toFixed(2)} + $${(delivery.perMileFee ?? 0.50).toFixed(2)}/mi · Free over $${delivery.freeThreshold}`
                          : delivery.enabled ? `$${(delivery.baseFee ?? 5).toFixed(2)} + $${(delivery.perMileFee ?? 0.50).toFixed(2)}/mi` : "Unavailable",
                      },
                      { id: "pickup", label: "Store Pickup",  icon: Store, desc: "Ready same day" },
                    ] as { id: DeliveryMode; label: string; icon: React.ElementType; desc: string }[]).map(({ id, label, icon: Icon, desc }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setMode(id)}
                        disabled={id === "delivery" && !delivery.enabled}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed ${
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
                  {mode === "delivery" && delivery.estimatedTime && (
                    <p className="text-xs text-stone-400 flex items-center gap-1.5">
                      <Truck size={11} /> Estimated delivery: <strong>{delivery.estimatedTime}</strong>
                    </p>
                  )}
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
                    <div className="relative" ref={suggestRef}>
                      <div className="space-y-1.5">
                        <label htmlFor="address" className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Street Address <span className="text-crimson">*</span>
                        </label>
                        <div className="relative">
                          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            id="address"
                            type="text"
                            placeholder="123 Main St"
                            required
                            autoComplete="off"
                            value={form.address}
                            onChange={(e) => { set("address")(e.target.value); setShowSuggestions(true); }}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            className="w-full bg-stone-50 border border-stone-200 focus:border-crimson rounded-xl text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors py-3 pl-10 pr-4"
                          />
                        </div>
                      </div>
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
                          {suggestions.map((s, i) => (
                            <li
                              key={i}
                              onMouseDown={() => selectSuggestion(s)}
                              className="px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-0 flex items-start gap-2"
                            >
                              <MapPin size={12} className="mt-0.5 shrink-0 text-stone-400" />
                              <span>{s.display}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <Field label="City"  id="city"  placeholder="Murfreesboro" required value={form.city}  onChange={set("city")} />
                      </div>
                      <Field label="State" id="state" placeholder="TN" required value={form.state} onChange={set("state")} />
                    </div>
                    <Field label="ZIP Code" id="zip" placeholder="37129" required value={form.zip} onChange={set("zip")} />
                    {delivery.maxDistance > 0 && (
                      <p className="text-xs text-stone-400">
                        We deliver within {delivery.maxDistance} miles. Enter your address to confirm availability.
                      </p>
                    )}
                  </div>
                )}

                {/* Pickup info — dynamic from settings */}
                {mode === "pickup" && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-crimson font-bold text-sm">
                      <Store size={16} /> Pickup Location
                    </div>
                    <p className="text-stone-800 font-semibold text-sm">{store.storeName}</p>
                    <p className="text-stone-600 text-sm">
                      {store.address}, {store.city}, {store.state} {store.zip}
                    </p>
                    {store.phone && (
                      <a href={`tel:${store.phone}`} className="text-sm text-crimson hover:underline flex items-center gap-1">
                        <Phone size={12} /> {store.phone}
                      </a>
                    )}
                    <p className="text-stone-500 text-xs">
                      {store.hoursMonFri} · {store.hoursSat} · {store.hoursSun}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${store.address} ${store.city} ${store.state} ${store.zip}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-crimson hover:underline mt-1"
                    >
                      <MapPin size={11} /> Get directions
                    </a>
                    <p className="text-stone-400 text-xs pt-1">
                      We&apos;ll send a confirmation email when your order is ready.
                    </p>
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

                  {/* Promo code — validates against admin dashboard codes */}
                  {appliedCode ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2 text-green-700 text-xs font-bold">
                        <CheckCircle size={12} />
                        {appliedCode} — {promoLabel}
                      </div>
                      <button onClick={removePromo} className="text-green-400 hover:text-red-500 transition-colors">
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
                            onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                            placeholder="Promo code"
                            className="flex-1 bg-transparent text-xs text-stone-900 placeholder-stone-400 outline-none uppercase"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={applyPromo}
                          disabled={promoLoading || !promoInput.trim()}
                          className="bg-crimson hover:bg-crimson-dark disabled:opacity-50 text-white text-xs font-bold px-3 rounded-xl transition-colors flex items-center gap-1"
                        >
                          {promoLoading ? <Loader2 size={11} className="animate-spin" /> : "Apply"}
                        </button>
                      </div>
                      {promoError && <p className="text-[11px] text-red-500 pl-1">{promoError}</p>}
                    </div>
                  )}

                  {/* Totals — dynamic tax & delivery from admin settings */}
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
                      <span>Tax ({store.taxRate}%)</span>
                      <span>{settingsLoaded ? `$${tax.toFixed(2)}` : "…"}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>
                        Delivery
                        {deliveryQuote && !isFreeShip && mode === "delivery" && (
                          <span className="ml-1 text-[10px] text-stone-400">({deliveryQuote.miles} mi)</span>
                        )}
                      </span>
                      <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                        {mode === "pickup"
                          ? "Free (Pickup)"
                          : isFreeShip
                            ? "Free"
                            : quoteLoading
                              ? <span className="text-stone-400 text-xs">Calculating…</span>
                              : quoteError
                                ? <span className="text-red-500 text-xs">—</span>
                                : deliveryQuote
                                  ? `$${deliveryQuote.fee.toFixed(2)}`
                                  : settingsLoaded
                                    ? `From $${(delivery.baseFee ?? delivery.fee).toFixed(2)}`
                                    : "…"}
                      </span>
                    </div>
                    {quoteError && mode === "delivery" && (
                      <p className="text-[10px] text-red-500">{quoteError}</p>
                    )}
                    {mode === "delivery" && !isFreeShip && delivery.freeThreshold > 0 && (
                      <p className="text-[10px] text-stone-400">
                        Add ${(delivery.freeThreshold - subtotal).toFixed(2)} more for free delivery
                      </p>
                    )}
                    <div className="flex justify-between text-stone-900 font-bold text-base border-t border-stone-100 pt-2">
                      <span>Total</span>
                      <span className="text-crimson">${orderTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Age confirmation */}
                  <div className={`flex items-start gap-2 rounded-xl p-3 border transition-colors ${ageConfirmed ? "bg-green-50 border-green-200" : "bg-stone-50 border-stone-200"}`}>
                    <input
                      type="checkbox"
                      id="age21"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      className="mt-0.5 accent-crimson w-4 h-4 flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="age21" className="text-xs text-stone-500 cursor-pointer">
                      I confirm I am <strong className="text-stone-900">21 years or older</strong> and agree to the age verification policy.
                    </label>
                  </div>

                  <StripeCheckout
                    amount={orderTotal}
                    onSuccess={saveOrder}
                    submitting={submitting}
                    disabled={!ageConfirmed}
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
