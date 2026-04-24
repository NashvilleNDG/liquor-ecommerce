"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

export interface StoredOrder {
  id: string;
  date: string;
  items: Array<{ name: string; upc: string; qty: number; price: number; dept: string }>;
  subtotal: number;
  discount: number;
  tax: number;
  delivery: number;
  total: number;
  mode: "delivery" | "pickup";
  address?: string;
  promoCode?: string;
  status: "processing" | "confirmed" | "ready" | "delivered";
}

type State = { orders: StoredOrder[] };

type Action =
  | { type: "ADD_ORDER"; payload: StoredOrder }
  | { type: "HYDRATE"; payload: StoredOrder[] };

const LS_KEY = "srtb_orders";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { orders: action.payload };
    case "ADD_ORDER":
      return { orders: [action.payload, ...state.orders] };
    default:
      return state;
  }
}

interface OrderHistoryCtx {
  orders: StoredOrder[];
  addOrder: (order: StoredOrder) => void;
}

const OrderHistoryContext = createContext<OrderHistoryCtx>({
  orders: [],
  addOrder: () => {},
});

export function OrderHistoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { orders: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed: StoredOrder[] = JSON.parse(raw);
        dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state.orders));
  }, [state.orders]);

  function addOrder(order: StoredOrder) {
    dispatch({ type: "ADD_ORDER", payload: order });
  }

  return (
    <OrderHistoryContext.Provider value={{ orders: state.orders, addOrder }}>
      {children}
    </OrderHistoryContext.Provider>
  );
}

export function useOrderHistory() {
  return useContext(OrderHistoryContext);
}
