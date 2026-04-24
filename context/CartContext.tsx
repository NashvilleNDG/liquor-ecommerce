"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import type { Product } from "@/lib/kanji-api";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
}

type Action =
  | { type: "ADD"; product: Product; qty?: number }
  | { type: "REMOVE"; upc: string }
  | { type: "SET_QTY"; upc: string; qty: number }
  | { type: "CLEAR" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "HYDRATE"; items: CartItem[] };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.items };
    case "ADD": {
      const addQty = action.qty ?? 1;
      const existing = state.items.find((i) => i.ItemUPC === action.product.ItemUPC);
      if (existing) {
        return {
          ...state,
          open: true,
          items: state.items.map((i) =>
            i.ItemUPC === action.product.ItemUPC
              ? { ...i, quantity: i.quantity + addQty }
              : i
          ),
        };
      }
      return {
        ...state,
        open: true,
        items: [...state.items, { ...action.product, quantity: addQty }],
      };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.ItemUPC !== action.upc) };
    case "SET_QTY":
      return {
        ...state,
        items:
          action.qty <= 0
            ? state.items.filter((i) => i.ItemUPC !== action.upc)
            : state.items.map((i) =>
                i.ItemUPC === action.upc ? { ...i, quantity: action.qty } : i
              ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, open: !state.open };
    case "OPEN_CART":
      return { ...state, open: true };
    case "CLOSE_CART":
      return { ...state, open: false };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const STORAGE_KEY = "srtb_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], open: false });

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const items: CartItem[] = JSON.parse(saved);
        if (Array.isArray(items) && items.length > 0) {
          dispatch({ type: "HYDRATE", items });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist cart items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore storage errors
    }
  }, [state.items]);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
