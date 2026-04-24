"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

interface LoyaltyState {
  points: number;
  tier: Tier;
}

type Action =
  | { type: "ADD_POINTS"; payload: number }
  | { type: "HYDRATE"; payload: LoyaltyState };

const LS_KEY = "srtb_loyalty";

function getTier(points: number): Tier {
  if (points >= 5000) return "Platinum";
  if (points >= 1500) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
}

function reducer(state: LoyaltyState, action: Action): LoyaltyState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "ADD_POINTS": {
      const points = state.points + action.payload;
      return { points, tier: getTier(points) };
    }
    default:
      return state;
  }
}

interface LoyaltyCtx {
  points: number;
  tier: Tier;
  addPoints: (amount: number) => void;
}

const LoyaltyContext = createContext<LoyaltyCtx>({
  points: 0,
  tier: "Bronze",
  addPoints: () => {},
});

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { points: 0, tier: "Bronze" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed: LoyaltyState = JSON.parse(raw);
        dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  function addPoints(amount: number) {
    dispatch({ type: "ADD_POINTS", payload: Math.floor(amount) });
  }

  return (
    <LoyaltyContext.Provider value={{ points: state.points, tier: state.tier, addPoints }}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  return useContext(LoyaltyContext);
}
