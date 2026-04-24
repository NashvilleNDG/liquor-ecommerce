"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";

const STORAGE_KEY = "srtb_recent";
const MAX_ITEMS = 8;

type State = { upcs: string[] };
type Action =
  | { type: "ADD_VIEW"; upc: string }
  | { type: "HYDRATE"; upcs: string[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { upcs: action.upcs };
    case "ADD_VIEW": {
      const filtered = state.upcs.filter((u) => u !== action.upc);
      return { upcs: [action.upc, ...filtered].slice(0, MAX_ITEMS) };
    }
    default:
      return state;
  }
}

const RecentlyViewedContext = createContext<{
  upcs: string[];
  addView: (upc: string) => void;
} | null>(null);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { upcs: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", upcs: parsed.filter((u) => typeof u === "string") });
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Persist whenever upcs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.upcs));
    } catch { /* ignore */ }
  }, [state.upcs]);

  const addView = (upc: string) => dispatch({ type: "ADD_VIEW", upc });

  return (
    <RecentlyViewedContext.Provider value={{ upcs: state.upcs, addView }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used inside RecentlyViewedProvider");
  return ctx;
}
