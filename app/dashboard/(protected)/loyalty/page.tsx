"use client";

import { useState, useEffect } from "react";
import { Star, Save, Loader2, CheckCircle } from "lucide-react";
import type { LoyaltyConfig } from "@/app/api/loyalty/route";

const inp = "w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 transition-colors placeholder-stone-400";

export default function LoyaltyPage() {
  const [cfg,    setCfg]    = useState<LoyaltyConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => { fetch("/api/loyalty").then(r => r.json()).then(setCfg); }, []);

  function set<K extends keyof LoyaltyConfig>(key: K, val: LoyaltyConfig[K]) {
    setCfg(p => p ? { ...p, [key]: val } : p);
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); if (!cfg) return;
    setSaving(true);
    await fetch("/api/loyalty", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  if (!cfg) return <div className="min-h-full bg-white flex items-center justify-center"><Loader2 size={28} className="text-amber-400 animate-spin" /></div>;

  const dollarValue = cfg.pointsPerDollar / cfg.redemptionRate;

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><Star size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Loyalty Program</h1>
              <p className="text-sm text-stone-400 mt-0.5">Configure points, tiers, and rewards</p>
            </div>
          </div>
          <button form="loyalty-form" type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-900 font-bold text-sm rounded-xl transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <form id="loyalty-form" onSubmit={handleSave}>
        <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-3xl mx-auto space-y-6">

          {/* Enable toggle */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900">Enable Loyalty Program</h2>
              <p className="text-sm text-stone-400 mt-0.5">Customers earn and redeem points on every order</p>
            </div>
            <button type="button" onClick={() => set("enabled", !cfg.enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${cfg.enabled ? "bg-amber-500" : "bg-stone-200"}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${cfg.enabled ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Points rules */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <h2 className="font-bold text-stone-900 mb-1">Points Rules</h2>
            <p className="text-xs text-stone-400 mb-4">
              Preview: customers earn <strong className="text-amber-600">{cfg.pointsPerDollar} pts/$1</strong> and redeem at <strong className="text-amber-600">{cfg.redemptionRate} pts = $1</strong>
              {" "}(≈ <strong className="text-stone-700">{(dollarValue * 100).toFixed(1)}¢ per dollar spent</strong>)
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Points Earned per $1 Spent</label>
                <input className={inp} type="number" min="1" value={cfg.pointsPerDollar} onChange={e => set("pointsPerDollar", parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Points Needed per $1 Discount</label>
                <input className={inp} type="number" min="1" value={cfg.redemptionRate} onChange={e => set("redemptionRate", parseInt(e.target.value) || 100)} />
              </div>
            </div>
          </div>

          {/* Tiers */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <h2 className="font-bold text-stone-900 mb-4">Loyalty Tiers</h2>
            <div className="space-y-3">
              {cfg.tiers.map((t, i) => (
                <div key={t.name} className="bg-stone-50 rounded-xl border border-stone-200 p-4">
                  <div className="grid sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Tier Name</label>
                      <input className={inp} value={t.name} onChange={e => { const tiers = [...cfg.tiers]; tiers[i] = { ...t, name: e.target.value }; set("tiers", tiers); }} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Min Points</label>
                      <input className={inp} type="number" min="0" value={t.min} onChange={e => { const tiers = [...cfg.tiers]; tiers[i] = { ...t, min: parseInt(e.target.value) || 0 }; set("tiers", tiers); }} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Bonus % on Points</label>
                      <input className={inp} type="number" min="0" value={t.bonus} onChange={e => { const tiers = [...cfg.tiers]; tiers[i] = { ...t, bonus: parseInt(e.target.value) || 0 }; set("tiers", tiers); }} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Perks Description</label>
                      <input className={inp} value={t.perks} onChange={e => { const tiers = [...cfg.tiers]; tiers[i] = { ...t, perks: e.target.value }; set("tiers", tiers); }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bonus events */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <h2 className="font-bold text-stone-900 mb-4">Bonus Point Events</h2>
            <div className="space-y-3">
              {cfg.bonusEvents.map((ev, i) => (
                <div key={ev.label} className="flex items-center justify-between gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900">{ev.label}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        className="w-20 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm text-center text-stone-900 focus:outline-none focus:border-amber-400"
                        type="number" min="0" value={ev.points}
                        onChange={e => { const evs = [...cfg.bonusEvents]; evs[i] = { ...ev, points: parseInt(e.target.value) || 0 }; set("bonusEvents", evs); }}
                      />
                      <span className="text-xs text-stone-500">pts</span>
                    </div>
                    <button type="button"
                      onClick={() => { const evs = [...cfg.bonusEvents]; evs[i] = { ...ev, active: !ev.active }; set("bonusEvents", evs); }}
                      className={`relative w-10 h-5 rounded-full transition-colors ${ev.active ? "bg-amber-500" : "bg-stone-200"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${ev.active ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
