"use client";

import { useState, useMemo } from "react";
import { Search, Save, Check, Tag } from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import { PAIRING_CATEGORIES, type PairingTagsMap } from "@/lib/pairing-categories";

interface Props {
  products: Product[];
  initialTags: PairingTagsMap;
}

export default function PairingsClient({ products, initialTags }: Props) {
  const [tags, setTags]     = useState<PairingTagsMap>(initialTags);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [dirty, setDirty]   = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.ItemName.toLowerCase().includes(q) || p.Department.toLowerCase().includes(q)
    );
  }, [products, search]);

  function toggle(upc: string, pairingId: string) {
    setTags((prev) => {
      const cur  = prev[upc] ?? [];
      const next = cur.includes(pairingId) ? cur.filter((t) => t !== pairingId) : [...cur, pairingId];
      return { ...prev, [upc]: next };
    });
    setDirty(true);
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/pairing-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tags),
    });
    setSaving(false);
    setSaved(true);
    setDirty(false);
  }

  const taggedCount = Object.values(tags).filter((arr) => arr.length > 0).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Tag size={20} className="text-crimson" />
              Pairing Tags
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {taggedCount} of {products.length} products tagged · {Object.values(tags).flat().length} total tags
            </p>
          </div>

          <button
            onClick={save}
            disabled={saving || !dirty}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              saved && !dirty
                ? "bg-green-100 text-green-700 border border-green-200"
                : dirty
                ? "bg-crimson text-white hover:bg-red-700 shadow-md"
                : "bg-stone-100 text-stone-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <span className="animate-spin">⏳</span>
            ) : saved && !dirty ? (
              <><Check size={14} /> Saved</>
            ) : (
              <><Save size={14} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Search + legend */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-crimson transition-colors shadow-sm"
            />
          </div>
          <p className="text-xs text-stone-400">
            Showing {filtered.length} of {products.length} products
          </p>
        </div>

        {/* Category legend */}
        <div className="flex flex-wrap gap-2">
          {PAIRING_CATEGORIES.map((c) => (
            <span key={c.id} className="text-xs bg-white border border-stone-200 rounded-full px-2.5 py-1 text-stone-600 shadow-sm">
              {c.emoji} {c.label}
            </span>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider min-w-[260px]">
                    Product
                  </th>
                  {PAIRING_CATEGORIES.map((c) => (
                    <th
                      key={c.id}
                      title={c.label}
                      className="px-2 py-3 text-center text-lg min-w-[40px] cursor-default"
                    >
                      {c.emoji}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={PAIRING_CATEGORIES.length + 1} className="text-center py-16 text-stone-400 text-sm">
                      No products match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const productTags = tags[p.ItemUPC] ?? [];
                    const hasAny = productTags.length > 0;
                    return (
                      <tr
                        key={p.ItemUPC}
                        className={`transition-colors hover:bg-stone-50 ${hasAny ? "bg-red-50/30" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-stone-800 leading-tight text-sm">{p.ItemName}</p>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            {p.Department} · {p.Size} · ${Number(p.Price).toFixed(2)}
                          </p>
                        </td>
                        {PAIRING_CATEGORIES.map((c) => {
                          const checked = productTags.includes(c.id);
                          return (
                            <td key={c.id} className="px-2 py-3 text-center">
                              <button
                                onClick={() => toggle(p.ItemUPC, c.id)}
                                title={`Toggle "${c.label}" for ${p.ItemName}`}
                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                  checked
                                    ? "bg-crimson border-crimson text-white"
                                    : "border-stone-200 hover:border-stone-400 bg-white"
                                }`}
                              >
                                {checked && <Check size={12} />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom save */}
        {dirty && (
          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-crimson text-white hover:bg-red-700 shadow-md transition-all"
            >
              {saving ? "Saving…" : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
