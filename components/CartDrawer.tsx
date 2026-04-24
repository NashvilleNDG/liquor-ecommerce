"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, Tag, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProductImage } from "@/lib/product-images";
import Link from "next/link";

const FREE_SHIP_THRESHOLD = 99;

const VALID_PROMOS: Record<string, number> = {
  WELCOME10: 0.10,
  SRTB15:    0.15,
  SAVE20:    0.20,
};

export default function CartDrawer() {
  const { state, dispatch } = useCart();
  const subtotal = state.items.reduce((sum, i) => sum + Number(i.Price) * i.quantity, 0);
  const count    = state.items.reduce((sum, i) => sum + i.quantity, 0);

  const [promoInput, setPromoInput]   = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError]   = useState("");

  const discount     = appliedCode ? subtotal * (VALID_PROMOS[appliedCode] ?? 0) : 0;
  const discountedTotal = subtotal - discount;
  const toFreeShip   = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const freeShipPct  = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);

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

  function removePromo() {
    setAppliedCode(null);
    setPromoError("");
  }

  return (
    <>
      {/* Backdrop */}
      {state.open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => dispatch({ type: "CLOSE_CART" })}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white border-l border-stone-200 flex flex-col transition-transform duration-300 ${
          state.open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-crimson" />
            <h2 className="font-bold text-stone-900 text-base">
              Your Cart{" "}
              {count > 0 && (
                <span className="text-crimson">({count})</span>
              )}
            </h2>
          </div>
          <button
            onClick={() => dispatch({ type: "CLOSE_CART" })}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        {state.items.length > 0 && (
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
            {toFreeShip > 0 ? (
              <p className="text-xs text-stone-600 mb-1.5">
                Add <span className="font-bold text-crimson">${toFreeShip.toFixed(2)}</span> more for free delivery
              </p>
            ) : (
              <p className="text-xs font-semibold text-green-600 mb-1.5">You qualify for free delivery!</p>
            )}
            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-crimson rounded-full transition-all duration-500"
                style={{ width: `${freeShipPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-4 pt-16">
              <ShoppingBag size={52} className="opacity-20" />
              <p className="font-medium">Your cart is empty</p>
              <Link
                href="/shop"
                onClick={() => dispatch({ type: "CLOSE_CART" })}
                className="flex items-center gap-1 text-sm text-crimson hover:underline font-semibold"
              >
                Start shopping <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            state.items.map((item) => {
              const imageUrl = getProductImage(item.ItemUPC);
              return (
                <div key={item.ItemUPC} className="flex gap-3 bg-stone-50 rounded-xl p-3 border border-stone-100">
                  {/* Product image / emoji */}
                  <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg border border-stone-200 flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.ItemName}
                        width={64}
                        height={64}
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-2xl">
                        {item.Department === "BEER" ? "🍺"
                          : item.Department === "Wines" ? "🍷"
                          : item.Department === "LIQUOR" ? "🥃"
                          : "📦"}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 leading-tight line-clamp-2">{item.ItemName}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{item.Size} · {item.Department}</p>
                    <p className="text-sm font-bold text-crimson mt-1">${Number(item.Price).toFixed(2)}</p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end justify-between gap-1 flex-shrink-0">
                    <button
                      onClick={() => dispatch({ type: "REMOVE", upc: item.ItemUPC })}
                      className="text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-1.5 py-1">
                      <button
                        onClick={() => dispatch({ type: "SET_QTY", upc: item.ItemUPC, qty: item.quantity - 1 })}
                        className="text-stone-500 hover:text-crimson transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-stone-900 text-xs font-semibold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => dispatch({ type: "SET_QTY", upc: item.ItemUPC, qty: item.quantity + 1 })}
                        className="text-stone-500 hover:text-crimson transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-stone-200 px-5 py-4 space-y-4 bg-white">

            {/* Promo code */}
            {appliedCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                  <Tag size={14} />
                  {appliedCode} — {(VALID_PROMOS[appliedCode] * 100).toFixed(0)}% off
                </div>
                <button onClick={removePromo} className="text-green-500 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                    <Tag size={13} className="text-stone-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      placeholder="Promo code"
                      className="flex-1 bg-transparent text-sm text-stone-900 placeholder-stone-400 outline-none"
                    />
                  </div>
                  <button
                    onClick={applyPromo}
                    className="bg-crimson hover:bg-crimson-dark text-white text-sm font-bold px-4 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-500 pl-1">{promoError}</p>}
              </div>
            )}

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedCode})</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Delivery</span>
                <span className={subtotal >= FREE_SHIP_THRESHOLD ? "text-green-600 font-medium" : ""}>
                  {subtotal >= FREE_SHIP_THRESHOLD ? "Free" : "$9.99"}
                </span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-base pt-2 border-t border-stone-100">
                <span>Estimated Total</span>
                <span className="text-crimson">
                  ${(discountedTotal + (subtotal >= FREE_SHIP_THRESHOLD ? 0 : 9.99)).toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => dispatch({ type: "CLOSE_CART" })}
              className="flex items-center justify-center gap-2 w-full bg-crimson hover:bg-crimson-dark text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-md"
            >
              Checkout <ChevronRight size={16} />
            </Link>

            <button
              onClick={() => dispatch({ type: "CLEAR" })}
              className="block w-full text-stone-400 hover:text-red-500 text-xs text-center transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
