"use client";

import { useState, useMemo, useRef } from "react";
import { Search, Upload, Link, Trash2, Check, Image as ImageIcon } from "lucide-react";
import type { Product } from "@/lib/kanji-api";

interface Props {
  products: Pick<Product, "ItemUPC" | "ItemName" | "Department" | "Price">[];
  initialCache: Record<string, string | null>;
}

export default function ImagesAdminClient({ products, initialCache }: Props) {
  const [cache, setCache]           = useState(initialCache);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<typeof products[0] | null>(null);
  const [urlInput, setUrlInput]     = useState("");
  const [uploading, setUploading]   = useState(false);
  const [saved, setSaved]           = useState(false);
  const [tab, setTab]               = useState<"file" | "url">("file");
  const fileRef                     = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products
      .filter(p => p.ItemName.toLowerCase().includes(q) || p.ItemUPC.includes(q))
      .slice(0, 10);
  }, [products, search]);

  const withImages = useMemo(() =>
    products.filter(p => cache[p.ItemUPC]),
    [products, cache]
  );

  async function upload(file?: File) {
    if (!selected) return;
    if (tab === "file" && !file) return;
    if (tab === "url" && !urlInput.trim()) return;

    setUploading(true);
    setSaved(false);

    const fd = new FormData();
    fd.append("upc", selected.ItemUPC);
    if (tab === "file" && file) fd.append("image", file);
    if (tab === "url") fd.append("url", urlInput.trim());

    const res  = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const data = await res.json();

    if (data.ok) {
      setCache(c => ({ ...c, [selected.ItemUPC]: data.imageUrl }));
      setSaved(true);
      setUrlInput("");
      if (fileRef.current) fileRef.current.value = "";
    }
    setUploading(false);
  }

  async function remove(upc: string) {
    await fetch("/api/admin/upload-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upc }),
    });
    setCache(c => { const n = { ...c }; delete n[upc]; return n; });
    if (selected?.ItemUPC === upc) setSaved(false);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <ImageIcon size={20} className="text-crimson" /> Product Images
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {withImages.length} images uploaded · {products.length} total products
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Search & select product */}
        <div className="space-y-4">
          <h2 className="font-semibold text-stone-700">1. Find a product</h2>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setSelected(null); setSaved(false); }}
              placeholder="Search by product name or UPC…"
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
            />
          </div>

          {/* Results */}
          {filtered.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              {filtered.map(p => (
                <button
                  key={p.ItemUPC}
                  onClick={() => { setSelected(p); setSearch(p.ItemName); setSaved(false); setUrlInput(""); }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-0 ${selected?.ItemUPC === p.ItemUPC ? "bg-red-50" : ""}`}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg bg-stone-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {cache[p.ItemUPC] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cache[p.ItemUPC]!} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon size={16} className="text-stone-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{p.ItemName}</p>
                    <p className="text-xs text-stone-400">{p.Department} · UPC: {p.ItemUPC}</p>
                  </div>
                  {cache[p.ItemUPC] && <Check size={14} className="text-green-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* Products with images */}
          {withImages.length > 0 && !search && (
            <div>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Products with images ({withImages.length})</h3>
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                {withImages.slice(0, 20).map(p => (
                  <div key={p.ItemUPC} className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 last:border-0">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex-shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cache[p.ItemUPC]!} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{p.ItemName}</p>
                      <p className="text-xs text-stone-400">{p.Department}</p>
                    </div>
                    <button
                      onClick={() => remove(p.ItemUPC)}
                      className="text-stone-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Upload panel */}
        <div className="space-y-4">
          <h2 className="font-semibold text-stone-700">2. Upload image</h2>

          {!selected ? (
            <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center py-20 gap-3 text-stone-400">
              <ImageIcon size={40} className="text-stone-300" />
              <p className="text-sm">Search and select a product first</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-crimson rounded-2xl p-6 space-y-5">
              {/* Selected product info */}
              <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                <div className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {cache[selected.ItemUPC] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cache[selected.ItemUPC]!} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon size={24} className="text-stone-300" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-stone-900 text-sm">{selected.ItemName}</p>
                  <p className="text-xs text-stone-500">{selected.Department} · ${Number(selected.Price).toFixed(2)}</p>
                  <p className="text-xs text-stone-400">UPC: {selected.ItemUPC}</p>
                </div>
              </div>

              {/* Tab toggle */}
              <div className="flex border border-stone-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setTab("file")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${tab === "file" ? "bg-crimson text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
                >
                  <Upload size={14} /> Upload File
                </button>
                <button
                  onClick={() => setTab("url")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors border-l border-stone-200 ${tab === "url" ? "bg-crimson text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
                >
                  <Link size={14} /> Paste URL
                </button>
              </div>

              {/* File upload */}
              {tab === "file" && (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="img-file"
                    onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }}
                  />
                  <label
                    htmlFor="img-file"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-xl py-10 gap-3 cursor-pointer hover:border-crimson hover:bg-red-50 transition-colors"
                  >
                    <Upload size={28} className="text-stone-300" />
                    <p className="text-sm text-stone-500">Click to choose image</p>
                    <p className="text-xs text-stone-400">JPG, PNG, WEBP supported</p>
                  </label>
                </div>
              )}

              {/* URL input */}
              {tab === "url" && (
                <div className="space-y-3">
                  <input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://example.com/product.jpg"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
                  />
                  {urlInput && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urlInput} alt="preview" className="w-full h-48 object-contain rounded-xl bg-stone-50 border border-stone-200" onError={e => (e.currentTarget.style.display = "none")} />
                  )}
                  <button
                    onClick={() => upload()}
                    disabled={uploading || !urlInput.trim()}
                    className="w-full bg-crimson text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {uploading ? "Saving…" : "Save Image URL"}
                  </button>
                </div>
              )}

              {/* Status */}
              {saved && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm font-semibold">
                  <Check size={16} /> Image saved successfully!
                </div>
              )}

              {/* Remove */}
              {cache[selected.ItemUPC] && (
                <button
                  onClick={() => remove(selected.ItemUPC)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-stone-400 hover:text-red-500 transition-colors py-1"
                >
                  <Trash2 size={14} /> Remove current image
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
