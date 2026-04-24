"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Check, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import type { Deal } from "@/app/api/deals/route";

interface Props { initialDeals: Deal[] }

const EMPTY: Omit<Deal, "id"> = {
  title: "", subtitle: "", badge: "", imageUrl: "", href: "/shop", active: true,
};

export default function DealsAdminClient({ initialDeals }: Props) {
  const [deals, setDeals]   = useState<Deal[]>(initialDeals);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [dirty, setDirty]   = useState(false);
  const [form, setForm]     = useState<Omit<Deal, "id">>(EMPTY);
  const [adding, setAdding] = useState(false);

  function mark() { setDirty(true); setSaved(false); }

  function updateField(id: string, field: keyof Deal, value: string | boolean) {
    setDeals((prev) => prev.map((d) => d.id === id ? { ...d, [field]: value } : d));
    mark();
  }

  function remove(id: string) {
    setDeals((prev) => prev.filter((d) => d.id !== id));
    mark();
  }

  function addDeal() {
    if (!form.title.trim()) return;
    const newDeal: Deal = { ...form, id: `deal-${Date.now()}` };
    setDeals((prev) => [...prev, newDeal]);
    setForm(EMPTY);
    setAdding(false);
    mark();
  }

  async function save() {
    setSaving(true);
    await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deals),
    });
    setSaving(false);
    setSaved(true);
    setDirty(false);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Tag size={20} className="text-crimson" /> Current Deals
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">{deals.filter((d) => d.active).length} active · {deals.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdding((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-700 transition-all"
            >
              <Plus size={14} /> Add Deal
            </button>
            <button
              onClick={save}
              disabled={saving || !dirty}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                saved && !dirty ? "bg-green-100 text-green-700 border border-green-200"
                  : dirty ? "bg-crimson text-white hover:bg-red-700 shadow-md"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving…" : saved && !dirty ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Add deal form */}
        {adding && (
          <div className="bg-white border-2 border-crimson rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-stone-900">New Deal Banner</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "title",    label: "Title *",         placeholder: "Weekend Special" },
                { key: "subtitle", label: "Subtitle",        placeholder: "Save big on select wines" },
                { key: "badge",    label: "Badge text",      placeholder: "SAVE 20%" },
                { key: "imageUrl", label: "Image URL",       placeholder: "https://..." },
                { key: "href",     label: "Link (href)",     placeholder: "/shop?dept=Wines" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">{label}</label>
                  <input
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-crimson transition-colors"
                  />
                </div>
              ))}
            </div>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="h-32 object-cover rounded-lg border border-stone-200" />
            )}
            <div className="flex gap-3">
              <button onClick={addDeal} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-crimson text-white hover:bg-red-700 transition-all">
                <Plus size={14} /> Add
              </button>
              <button onClick={() => { setAdding(false); setForm(EMPTY); }} className="px-4 py-2.5 rounded-xl text-sm text-stone-500 hover:text-stone-900 border border-stone-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Deals list */}
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-stone-200">
            <Tag size={40} className="text-stone-300" />
            <p className="text-stone-500 font-medium">No deals yet.</p>
            <p className="text-stone-400 text-sm">Click &ldquo;Add Deal&rdquo; to create your first promo banner.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div key={deal.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${deal.active ? "border-stone-200" : "border-stone-100 opacity-60"}`}>
                {deal.imageUrl ? (
                  <div className="relative aspect-[4/3] bg-stone-100">
                    <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" />
                    {deal.badge && (
                      <span className="absolute top-3 left-3 bg-crimson text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        {deal.badge}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-stone-100 flex items-center justify-center">
                    <Tag size={32} className="text-stone-300" />
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-bold text-stone-900 leading-tight">{deal.title}</p>
                    {deal.subtitle && <p className="text-stone-500 text-sm mt-0.5">{deal.subtitle}</p>}
                    <p className="text-xs text-stone-400 mt-1 truncate">→ {deal.href}</p>
                  </div>
                  {[
                    { key: "title",    label: "Title",    val: deal.title },
                    { key: "subtitle", label: "Subtitle", val: deal.subtitle },
                    { key: "badge",    label: "Badge",    val: deal.badge },
                    { key: "imageUrl", label: "Image URL",val: deal.imageUrl },
                    { key: "href",     label: "Link",     val: deal.href },
                  ].map(({ key, label, val }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">{label}</label>
                      <input
                        value={val}
                        onChange={(e) => updateField(deal.id, key as keyof Deal, e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 outline-none focus:border-crimson transition-colors"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => updateField(deal.id, "active", !deal.active)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${deal.active ? "text-green-600 hover:text-green-800" : "text-stone-400 hover:text-stone-600"}`}
                    >
                      {deal.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {deal.active ? "Active" : "Inactive"}
                    </button>
                    <button onClick={() => remove(deal.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
