"use client";

import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartDrawer() {
  const { state, dispatch } = useCart();
  const subtotal = state.items.reduce((sum, i) => sum + i.Price * i.quantity, 0);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {state.open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 dark:bg-black/60"
          onClick={() => dispatch({ type: "CLOSE_CART" })}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex flex-col transition-transform duration-300 ${
          state.open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-amber-500 dark:text-amber-400" />
            <h2 className="font-semibold text-stone-900 dark:text-white">
              Cart{" "}
              {count > 0 && (
                <span className="text-amber-600 dark:text-amber-400">({count})</span>
              )}
            </h2>
          </div>
          <button
            onClick={() => dispatch({ type: "CLOSE_CART" })}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-3">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            state.items.map((item) => (
              <div
                key={item.ItemUPC}
                className="flex gap-4 bg-stone-50 dark:bg-stone-800 rounded-xl p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-white truncate">{item.ItemName}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-500 mt-0.5">
                    {item.Size} · {item.Department}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm mt-1">
                    ${item.Price.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => dispatch({ type: "REMOVE", upc: item.ItemUPC })}
                    className="text-stone-300 dark:text-stone-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        dispatch({ type: "SET_QTY", upc: item.ItemUPC, qty: item.quantity - 1 })
                      }
                      className="bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 rounded-lg p-1 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-stone-900 dark:text-white text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        dispatch({ type: "SET_QTY", upc: item.ItemUPC, qty: item.quantity + 1 })
                      }
                      className="bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 rounded-lg p-1 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-stone-200 dark:border-stone-800 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 dark:text-stone-400">Subtotal</span>
              <span className="text-stone-900 dark:text-white font-semibold text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => dispatch({ type: "CLOSE_CART" })}
              className="block w-full bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold py-3 rounded-xl text-center transition-colors"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={() => dispatch({ type: "CLEAR" })}
              className="block w-full text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 text-sm text-center transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
