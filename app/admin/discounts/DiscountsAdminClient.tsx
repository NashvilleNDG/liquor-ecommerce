"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Save, Check, ToggleLeft, ToggleRight, Percent, DollarSign, Tag, Search } from "lucide-react";
import type { Discount } from "@/app/api/discounts/route";
import type { Product } from "@/lib/kanji-api";

interface Props {
  initialDiscounts: Discount[];
  products: Pick<Product, "ItemUPC" | "ItemName" | "Department" | "Price">[];
}

const DEPARTMENTS = ["BEER", "Wines", "LIQUOR", "CBD", "MIXERS", "CIGARS", "Cigarette", "Soda", "KEG"];

const EMPTY = {
  name: "", type: "category" as "category" | "product",
  target: "Wines", targetName: "Wines",
  discountType: "%" as "%" | "$", value: 10,
};

export default function DiscountsAdminClient({ initialDiscounts, products }: Props) {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [dirty, setDirty]         = useState(false);
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState({ ...EMPTY });
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Pick<Product, "ItemUPC" | "ItemName" | "Department" | "Price"> | null>(null);

  function mark() { setDirty(true); setSaved(false); }

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return products.filter(p =>
      p.ItemName.toLowerCase().includes(q) || p.Department.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [products, productSearch]);

  function toggle(id: string) {
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
    mark();
  }

  function remove(id: string) { setDiscounts(prev => prev.filter(d => d.id !== id)); mark(); }

  function addDiscount() {
    if (!form.name.trim()) return;
    if (form.type === "product" && !selectedProduct) return;

    const newDiscount: Discount = {
      id: `disc-${Date.now()}`,
      name: form.name,
      type: form.type,
      target: form.type === "category" ? form.target : selectedProduct!.ItemUPC,
      targetName: form.type === "category" ? form.target : selectedProduct!.ItemName,
      discountType: form.discountType,
      value: Number(form.value),
      active: true,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setDiscounts(prev => [newDiscount, ...prev]);
    setForm({ ...EMPTY }); setProductSearch(""); setSelectedProduct(null); setAdding(false); mark();
  }

  async function save() {
    setSaving(true);
    await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discounts),
    });
    setSaving(false); setSaved(true); setDirty(false);
  }

  const activeCount = discounts.filter(d => d.active).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Tag size={20} className="text-crimson" /> Discounts
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {activeCount} active · {discounts.length} total rules
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setAdding(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-700 transition-all"
            >
              <Plus size={14} /> Add Discount
            </button>
            <button
              onClick={save} disabled={saving || !dirty}
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

        {/* Add discount form */}
        {adding && (
          <div className="bg-white border-2 border-crimson rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-stone-900 text-lg">New Discount Rule</h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Discount Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Weekend Wine Sale"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Apply To</label>
              <div className="flex gap-3">
                {(["category", "product"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setForm(f => ({ ...f, type: t })); setSelectedProduct(null); setProductSearch(""); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${
                      form.type === t ? "border-crimson bg-red-50 text-crimson" : "border-stone-200 text-stone-500 hover:border-stone-400"
                    }`}
                  >
                    {t === "category" ? "🗂 Category" : "📦 Specific Product"}
                  </button>
                ))}
              </div>
            </div>

            {/* Category selector */}
            {form.type === "category" && (
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={form.target}
                  onChange={e => setForm(f => ({ ...f, target: e.target.value, targetName: e.target.value }))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            {/* Product search */}
            {form.type === "product" && (
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Search Product *</label>
                {selectedProduct ? (
                  <div className="flex items-center justify-between bg-red-50 border border-crimson rounded-xl px-4 py-3">
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">{selectedProduct.ItemName}</p>
                      <p className="text-xs text-stone-500">{selectedProduct.Department} · ${Number(selectedProduct.Price).toFixed(2)}</p>
                    </div>
                    <button onClick={() => { setSelectedProduct(null); setProductSearch(""); }} className="text-stone-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search by product name…"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
                    />
                    {filteredProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-20 max-h-60 overflow-y-auto">
                        {filteredProducts.map(p => (
                          <button
                            key={p.ItemUPC}
                            onClick={() => { setSelectedProduct(p); setProductSearch(p.ItemName); }}
                            className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-0"
                          >
                            <p className="text-sm font-medium text-stone-800">{p.ItemName}</p>
                            <p className="text-xs text-stone-400">{p.Department} · ${Number(p.Price).toFixed(2)}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Discount type + value */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Discount Amount</label>
              <div className="flex gap-3 items-center">
                {/* Toggle % / $ */}
                <div className="flex border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setForm(f => ({ ...f, discountType: "%" }))}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors ${
                      form.discountType === "%" ? "bg-crimson text-white" : "bg-white text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <Percent size={13} /> Percent
                  </button>
                  <button
                    onClick={() => setForm(f => ({ ...f, discountType: "$" }))}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors border-l border-stone-200 ${
                      form.discountType === "$" ? "bg-crimson text-white" : "bg-white text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <DollarSign size={13} /> Dollar
                  </button>
                </div>
                {/* Value input */}
                <div className="relative flex-1 max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-sm">
                    {form.discountType === "%" ? "%" : "$"}
                  </span>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
                  />
                </div>
                {/* Preview */}
                <div className="bg-stone-100 rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-700">
                  {form.discountType === "%" ? `-${form.value}%` : `-$${Number(form.value).toFixed(2)}`} off
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={addDiscount} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-crimson text-white hover:bg-red-700 transition-all">
                <Plus size={14} /> Add Discount
              </button>
              <button onClick={() => { setAdding(false); setForm({ ...EMPTY }); setProductSearch(""); setSelectedProduct(null); }} className="px-4 py-2.5 rounded-xl text-sm text-stone-500 hover:text-stone-900 border border-stone-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Discounts list */}
        {discounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-stone-200">
            <Tag size={40} className="text-stone-300" />
            <p className="text-stone-500 font-medium">No discounts yet.</p>
            <p className="text-stone-400 text-sm">Click &ldquo;Add Discount&rdquo; to create your first rule.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {discounts.map(d => {
              const badge = d.discountType === "%" ? `-${d.value}%` : `-$${Number(d.value).toFixed(2)}`;
              return (
                <div key={d.id} className={`bg-white rounded-2xl border shadow-sm flex items-center gap-4 px-5 py-4 transition-all ${d.active ? "border-stone-200" : "border-stone-100 opacity-60"}`}>
                  {/* Badge */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center font-extrabold text-white text-base leading-tight shadow-md ${d.discountType === "%" ? "bg-crimson" : "bg-emerald-600"}`}>
                    {d.discountType === "%" ? <Percent size={18} /> : <DollarSign size={18} />}
                    <span className="text-xs mt-0.5">{d.value}{d.discountType}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-900">{d.name}</p>
                    <p className="text-sm text-stone-500">
                      {d.type === "category" ? `All products in "${d.targetName}"` : d.targetName}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mr-2 ${d.type === "category" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
                        {d.type === "category" ? "Category" : "Product"}
                      </span>
                      {badge} off · Added {d.createdAt}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => { toggle(d.id); }}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg ${d.active ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-stone-100 text-stone-400 hover:bg-stone-200"}`}
                    >
                      {d.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      {d.active ? "Active" : "Inactive"}
                    </button>
                    <button onClick={() => remove(d.id)} className="text-stone-300 hover:text-red-500 transition-colors p-1.5">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
