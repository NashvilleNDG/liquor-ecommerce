"use client";

import { useState, useEffect } from "react";
import { Gift, Plus, Trash2, Copy, X, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import type { GiftCard } from "@/app/api/gift-cards/route";

const inp = "w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 transition-colors placeholder-stone-400";
const EMPTY = { value: 25, recipient: "", note: "", expiresAt: "" };

export default function GiftCardsPage() {
  const [cards,    setCards]    = useState<GiftCard[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [copied,   setCopied]   = useState<string | null>(null);

  async function load() { setLoading(true); const r = await fetch("/api/gift-cards"); setCards(await r.json()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/gift-cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setCards(prev => [...prev, data]); setForm(EMPTY); setShowForm(false); setSaving(false);
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/gift-cards", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active }) });
    setCards(prev => prev.map(c => c.id === id ? { ...c, active } : c));
  }

  async function remove(id: string) {
    if (!confirm("Delete this gift card?")) return;
    await fetch("/api/gift-cards", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setCards(prev => prev.filter(c => c.id !== id));
  }

  function copy(code: string) { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 2000); }

  const totalValue = cards.filter(c => c.active).reduce((s, c) => s + c.balance, 0);

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><Gift size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Gift Cards</h1>
              <p className="text-sm text-stone-400 mt-0.5">{cards.filter(c=>c.active).length} active · ${totalValue.toFixed(2)} outstanding</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm rounded-xl transition-colors">
            <Plus size={15} /> Issue Gift Card
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-screen-xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Total Issued",      value: cards.length },
            { label: "Active Cards",      value: cards.filter(c => c.active).length },
            { label: "Outstanding Value", value: `$${totalValue.toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5">
              <p className="text-2xl font-bold text-stone-900">{value}</p>
              <p className="text-xs text-stone-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Issue form */}
        {showForm && (
          <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-900">Issue New Gift Card</h2>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-stone-400" /></button>
            </div>
            <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Amount ($) *</label>
                <input className={inp} type="number" min="1" required value={form.value} onChange={e => setForm(p => ({ ...p, value: parseInt(e.target.value) || 25 }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Recipient Name/Email</label>
                <input className={inp} value={form.recipient} onChange={e => setForm(p => ({ ...p, recipient: e.target.value }))} placeholder="John Smith or john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Expiry Date (optional)</label>
                <input className={inp} type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Internal Note</label>
                <input className={inp} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Birthday gift, etc." />
              </div>
              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm rounded-xl disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />} Issue Card
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cards table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-amber-400" /></div>
        ) : cards.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
            <Gift size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-semibold">No gift cards issued yet</p>
            <p className="text-stone-400 text-sm mt-1">Issue gift cards to customers as rewards or purchases.</p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>{["Code", "Recipient", "Value", "Remaining", "Issued", "Status", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {cards.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">{c.code}</span>
                        <button onClick={() => copy(c.code)} className="text-stone-400 hover:text-amber-600 transition-colors"><Copy size={11} /></button>
                        {copied === c.code && <span className="text-[10px] text-amber-600">Copied!</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-xs">{c.recipient || "—"}</td>
                    <td className="px-4 py-3 font-bold text-stone-900">${c.initialValue.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${c.balance > 0 ? "text-amber-600" : "text-stone-400"}`}>${c.balance.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400">{new Date(c.issuedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.active ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-500"}`}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggle(c.id, !c.active)} className="text-stone-400 hover:text-amber-600 transition-colors">
                          {c.active ? <ToggleRight size={18} className="text-amber-500" /> : <ToggleLeft size={18} />}
                        </button>
                        <button onClick={() => remove(c.id)} className="text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
