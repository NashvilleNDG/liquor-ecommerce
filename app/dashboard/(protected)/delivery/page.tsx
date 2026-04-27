"use client";

import { useState, useEffect } from "react";
import { Truck, Plus, Trash2, Save, Loader2, CheckCircle, X } from "lucide-react";
import type { DeliverySettings, DeliveryZone } from "@/app/api/delivery/route";

const inp = "w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 transition-colors placeholder-stone-400";

export default function DeliveryPage() {
  const [form,   setForm]   = useState<DeliverySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => { fetch("/api/delivery").then(r => r.json()).then(setForm); }, []);

  function set<K extends keyof DeliverySettings>(key: K, val: DeliverySettings[K]) {
    setForm(p => p ? { ...p, [key]: val } : p);
    setSaved(false);
  }

  function addZone() {
    const zone: DeliveryZone = { id: crypto.randomUUID(), label: "New Zone", zips: "", fee: 5.99, active: true };
    setForm(p => p ? { ...p, zones: [...p.zones, zone] } : p);
  }

  function updateZone(id: string, key: keyof DeliveryZone, val: string | number | boolean) {
    setForm(p => p ? { ...p, zones: p.zones.map(z => z.id === id ? { ...z, [key]: val } : z) } : p);
  }

  function removeZone(id: string) {
    setForm(p => p ? { ...p, zones: p.zones.filter(z => z.id !== id) } : p);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    await fetch("/api/delivery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  if (!form) return <div className="min-h-full bg-white flex items-center justify-center"><Loader2 size={28} className="text-amber-400 animate-spin" /></div>;

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><Truck size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Delivery Settings</h1>
              <p className="text-sm text-stone-400 mt-0.5">Configure delivery fees, zones, and options</p>
            </div>
          </div>
          <button form="delivery-form" type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-900 font-bold text-sm rounded-xl transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <form id="delivery-form" onSubmit={handleSave}>
        <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-3xl mx-auto space-y-6">

          {/* Toggle delivery */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-stone-900">Enable Delivery</h2>
                <p className="text-sm text-stone-400 mt-0.5">Allow customers to order for home delivery</p>
              </div>
              <button type="button" onClick={() => set("enabled", !form.enabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.enabled ? "bg-amber-500" : "bg-stone-200"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.enabled ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Fees */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <h2 className="font-bold text-stone-900 mb-4">Base Delivery Options</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Default Delivery Fee ($)</label>
                <input className={inp} type="number" step="0.01" min="0" value={form.fee} onChange={e => set("fee", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Free Delivery Above ($) — 0 to disable</label>
                <input className={inp} type="number" step="1" min="0" value={form.freeThreshold} onChange={e => set("freeThreshold", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Estimated Delivery Time</label>
                <input className={inp} value={form.estimatedTime} onChange={e => set("estimatedTime", e.target.value)} placeholder="45–60 minutes" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Max Delivery Distance (miles)</label>
                <input className={inp} type="number" min="1" value={form.maxDistance} onChange={e => set("maxDistance", parseInt(e.target.value) || 10)} />
              </div>
            </div>
          </div>

          {/* Zones */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-stone-900">Delivery Zones</h2>
                <p className="text-xs text-stone-400 mt-0.5">Set different fees per ZIP code area</p>
              </div>
              <button type="button" onClick={addZone} className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-800 transition-colors">
                <Plus size={15} /> Add Zone
              </button>
            </div>

            {form.zones.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">No zones yet. Add a zone to set area-specific delivery fees.</p>
            ) : (
              <div className="space-y-3">
                {form.zones.map(z => (
                  <div key={z.id} className="bg-stone-50 rounded-xl border border-stone-200 p-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Zone Name</label>
                        <input className={inp} value={z.label} onChange={e => updateZone(z.id, "label", e.target.value)} placeholder="Downtown" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">ZIP Codes (comma-separated)</label>
                        <input className={inp} value={z.zips} onChange={e => updateZone(z.id, "zips", e.target.value)} placeholder="37129, 37130, 37132" />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Fee ($)</label>
                          <input className={inp} type="number" step="0.01" min="0" value={z.fee} onChange={e => updateZone(z.id, "fee", parseFloat(e.target.value) || 0)} />
                        </div>
                        <button type="button" onClick={() => removeZone(z.id)} className="mb-0.5 p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
