"use client";

import { useState, useEffect } from "react";
import { TicketPercent, Plus, Trash2, ToggleLeft, ToggleRight, Copy, X, Loader2 } from "lucide-react";
import type { PromoCode } from "@/app/api/promo-codes/route";

const inp = "w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 transition-colors placeholder-stone-400";

type FormState = { code: string; type: "percent" | "fixed"; value: number; minOrder: number; maxUses: string; expiresAt: string; description: string };
const EMPTY: FormState = { code: "", type: "percent", value: 10, minOrder: 0, maxUses: "", expiresAt: "", description: "" };

export default function PromoCodesPage() {
  const [codes,    setCodes]   = useState<PromoCode[]>([]);
  const [loading,  setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]    = useState<FormState>(EMPTY);
  const [saving,   setSaving]  = useState(false);
  const [copied,   setCopied]  = useState<string | null>(null);
  const [error,    setError]   = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/promo-codes");
    setCodes(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    const res = await fetch("/api/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, maxUses: form.maxUses ? parseInt(form.maxUses) : null }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed"); setSaving(false); return; }
    setCodes(prev => [...prev, data]);
    setForm(EMPTY); setShowForm(false); setSaving(false);
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/promo-codes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active }) });
    setCodes(prev => prev.map(c => c.id === id ? { ...c, active } : c));
  }

  async function remove(id: string) {
    if (!confirm("Delete this promo code?")) return;
    await fetch("/api/promo-codes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setCodes(prev => prev.filter(c => c.id !== id));
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code); setTimeout(() => setCopied(null), 2000);
  }

  const active   = codes.filter(c => c.active);
  const inactive = codes.filter(c => !c.active);

  function CodeRow({ c }: { c: PromoCode }) {
    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
    const exhausted = c.maxUses !== null && c.usedCount >= c.maxUses;
    return (
      <tr className="hover:bg-stone-50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-stone-900 text-sm">{c.code}</span>
            <button onClick={() => copyCode(c.code)} className="text-stone-400 hover:text-amber-600 transition-colors">
              <Copy size={12} />
            </button>
            {copied === c.code && <span className="text-[10px] text-amber-600 font-semibold">Copied!</span>}
          </div>
          {c.description && <p className="text-xs text-stone-400 mt-0.5">{c.description}</p>}
        </td>
        <td className="px-4 py-3">
          <span className="font-bold text-stone-900">
            {c.type === "percent" ? `${c.value}%` : `$${c.value}`} off
          </span>
          {c.minOrder > 0 && <p className="text-[10px] text-stone-400">min ${c.minOrder}</p>}
        </td>
        <td className="px-4 py-3 text-sm text-stone-600 tabular-nums">
          {c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : " uses"}
        </td>
        <td className="px-4 py-3 text-xs text-stone-500">
          {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "No expiry"}
        </td>
        <td className="px-4 py-3">
          {isExpired || exhausted ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
              {isExpired ? "Expired" : "Exhausted"}
            </span>
          ) : (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.active ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-500"}`}>
              {c.active ? "Active" : "Paused"}
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => toggle(c.id, !c.active)} className="text-stone-400 hover:text-amber-600 transition-colors">
              {c.active ? <ToggleRight size={20} className="text-amber-500" /> : <ToggleLeft size={20} />}
            </button>
            <button onClick={() => remove(c.id)} className="text-stone-400 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><TicketPercent size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Promo Codes</h1>
              <p className="text-sm text-stone-400 mt-0.5">{active.length} active codes</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(true); setError(""); }} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm rounded-xl transition-colors">
            <Plus size={15} /> New Code
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-screen-xl mx-auto space-y-6">

        {/* Create form */}
        {showForm && (
          <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-900">Create Promo Code</h2>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-stone-400" /></button>
            </div>
            <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Code *</label>
                <input className={inp + " uppercase"} required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Type</label>
                <select className={inp} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as "percent" | "fixed" }))}>
                  <option value="percent">Percentage off</option>
                  <option value="fixed">Fixed $ off</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  {form.type === "percent" ? "Discount %" : "Discount $"} *
                </label>
                <input className={inp} type="number" min="1" required value={form.value} onChange={e => setForm(p => ({ ...p, value: parseFloat(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Min Order ($)</label>
                <input className={inp} type="number" min="0" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: parseFloat(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Max Uses (blank = unlimited)</label>
                <input className={inp} type="number" min="1" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} placeholder="Unlimited" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Expires (optional)</label>
                <input className={inp} type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Description (internal note)</label>
                <input className={inp} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Summer sale 2025" />
              </div>
              {error && <p className="sm:col-span-3 text-red-600 text-sm">{error}</p>}
              <div className="sm:col-span-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 border border-stone-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm rounded-xl transition-colors disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Total Codes",   value: codes.length,   color: "text-stone-900" },
            { label: "Active",        value: active.length,  color: "text-amber-600" },
            { label: "Total Uses",    value: codes.reduce((s, c) => s + c.usedCount, 0), color: "text-stone-900" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-stone-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-amber-400" /></div>
        ) : codes.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
            <TicketPercent size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-semibold">No promo codes yet</p>
            <p className="text-stone-400 text-sm mt-1">Create your first code to offer discounts to customers.</p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  {["Code", "Discount", "Uses", "Expires", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {codes.map(c => <CodeRow key={c.id} c={c} />)}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
