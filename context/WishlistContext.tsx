"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import type { Product } from "@/lib/kanji-api";

const STORAGE_KEY = "srtb_wishlist";

type WishlistState = { items: Product[] };
type Action =
  | { type: "TOGGLE"; product: Product }
  | { type: "HYDRATE"; items: Product[] };

function reducer(state: WishlistState, action: Action): WishlistState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };
    case "TOGGLE": {
      const exists = state.items.some((i) => i.ItemUPC === action.product.ItemUPC);
      return {
        items: exists
          ? state.items.filter((i) => i.ItemUPC !== action.product.ItemUPC)
          : [...state.items, action.product],
      };
    }
    default:
      return state;
  }
}

const WishlistContext = createContext<{
  state: WishlistState;
  dispatch: React.Dispatch<Action>;
  isWishlisted: (upc: string) => boolean;
} | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const items: Product[] = JSON.parse(saved);
        if (Array.isArray(items)) dispatch({ type: "HYDRATE", items });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch { /* ignore */ }
  }, [state.items]);

  const isWishlisted = (upc: string) => state.items.some((i) => i.ItemUPC === upc);

  return (
    <WishlistContext.Provider value={{ state, dispatch, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
