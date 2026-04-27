"use client";

import { useState, useEffect } from "react";
import { Image, Plus, Trash2, ToggleLeft, ToggleRight, X, Loader2, Eye } from "lucide-react";
import type { Banner } from "@/app/api/banners/route";

const inp = "w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 transition-colors placeholder-stone-400";

const BG_OPTIONS = [
  { label: "Amber Dark",   value: "from-amber-900 to-stone-900" },
  { label: "Stone Dark",   value: "from-stone-800 to-stone-950" },
  { label: "Amber Warm",   value: "from-amber-700 to-amber-900" },
  { label: "Wine Red",     value: "from-red-900 to-stone-900"   },
  { label: "Forest Green", value: "from-green-900 to-stone-900" },
  { label: "Navy Blue",    value: "from-blue-900 to-stone-900"  },
];

const EMPTY = { title: "", subtitle: "", ctaText: "Shop Now", ctaLink: "/shop", bgColor: "from-amber-900 to-stone-900" };

export default function BannersPage() {
  const [banners,  setBanners]  = useState<Banner[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [preview,  setPreview]  = useState<Banner | null>(null);

  async function load() { setLoading(true); const r = await fetch("/api/banners"); setBanners(await r.json()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setBanners(prev => [...prev, data]); setForm(EMPTY); setShowForm(false); setSaving(false);
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/banners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active }) });
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active } : b));
  }

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    await fetch("/api/banners", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setBanners(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><Image size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Homepage Banners</h1>
              <p className="text-sm text-stone-400 mt-0.5">{banners.filter(b => b.active).length} active banners</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm rounded-xl transition-colors">
            <Plus size={15} /> New Banner
          </button>
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${preview.bgColor} rounded-2xl p-10 text-center relative`}>
              <button onClick={() => setPreview(null)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={20} /></button>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Banner Preview</p>
              <h2 className="text-3xl font-black text-white mb-2">{preview.title || "Banner Title"}</h2>
              <p className="text-white/70 text-lg mb-6">{preview.subtitle || "Subtitle text"}</p>
              <button className="bg-amber-500 text-stone-900 font-bold px-6 py-2.5 rounded-xl text-sm">
                {preview.ctaText || "Shop Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-screen-xl mx-auto space-y-6">

        {/* Create form */}
        {showForm && (
          <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-900">New Banner</h2>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-stone-400" /></button>
            </div>
            <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Headline *</label>
                <input className={inp} required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Summer Sale — Up to 30% Off" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Subtitle</label>
                <input className={inp} value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Shop our selection of premium spirits" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Button Text</label>
                <input className={inp} value={form.ctaText} onChange={e => setForm(p => ({ ...p, ctaText: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Button Link</label>
                <input className={inp} value={form.ctaLink} onChange={e => setForm(p => ({ ...p, ctaLink: e.target.value }))} placeholder="/shop" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Background Style</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {BG_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm(p => ({ ...p, bgColor: opt.value }))}
                      className={`h-10 rounded-xl bg-gradient-to-r ${opt.value} border-2 transition-all ${form.bgColor === opt.value ? "border-amber-500 scale-105" : "border-transparent"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm rounded-xl disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Banner
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banner list */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-amber-400" /></div>
        ) : banners.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
            <Image size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-semibold">No banners yet</p>
            <p className="text-stone-400 text-sm mt-1">Create a banner to showcase promotions on your homepage.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map(b => (
              <div key={b.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden flex items-stretch">
                {/* Preview strip */}
                <div className={`w-24 flex-shrink-0 bg-gradient-to-br ${b.bgColor} flex items-center justify-center`}>
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider rotate-[-90deg] whitespace-nowrap">Banner</span>
                </div>
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 truncate">{b.title || "Untitled"}</p>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">{b.subtitle}</p>
                    <p className="text-[10px] text-stone-400 mt-1">→ {b.ctaText} · {b.ctaLink}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.active ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-500"}`}>
                      {b.active ? "Live" : "Hidden"}
                    </span>
                    <button onClick={() => setPreview(b)} className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Eye size={15} /></button>
                    <button onClick={() => toggle(b.id, !b.active)} className="text-stone-400 hover:text-amber-600 transition-colors">
                      {b.active ? <ToggleRight size={20} className="text-amber-500" /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => remove(b.id)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
