"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X, Star, EyeOff, Eye, ImageIcon, Tag, DollarSign,
  Upload, RotateCcw, Save, Info,
} from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import type { ProductOverride } from "@/lib/product-overrides";

const LABELS = ["", "Staff Pick", "New Arrival", "Limited", "On Sale", "Best Seller", "Exclusive"];

const DEPT_EMOJI: Record<string, string> = {
  BEER: "🍺", Wines: "🍷", WINE: "🍷", LIQUOR: "🥃",
  Spirits: "🥃", Wine: "🍷", Beer: "🍺",
};

interface Props {
  product: Product | null;
  override: ProductOverride;
  onClose: () => void;
  onSaved: (upc: string, override: ProductOverride) => void;
}

function Toggle({
  on, onToggle, labelOn, labelOff, colorOn,
}: {
  on: boolean;
  onToggle: () => void;
  labelOn: string;
  labelOff: string;
  colorOn: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
        on ? `${colorOn}` : "bg-stone-50 border-stone-200 text-stone-500"
      }`}
    >
      <span className="text-sm font-semibold">{on ? labelOn : labelOff}</span>
      <div className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-current" : "bg-stone-300"}`}>
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
            on ? "left-4" : "left-0.5"
          }`}
        />
      </div>
    </button>
  );
}

export default function ProductEditPanel({ product, override, onClose, onSaved }: Props) {
  const [hidden,      setHidden]      = useState(override.hidden      ?? false);
  const [featured,    setFeatured]    = useState(override.featured    ?? false);
  const [label,       setLabel]       = useState(override.label       ?? "");
  const [imageUrl,    setImageUrl]    = useState(override.imageUrl    ?? "");
  const [priceInput,  setPriceInput]  = useState(override.onlinePrice?.toString() ?? "");
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  if (!product) return null;

  const emoji  = DEPT_EMOJI[product.Department] ?? "🍾";
  const posPrice    = Number(product.Price).toFixed(2);
  const kanjiPrice  = Number(product.OnlinePrice).toFixed(2);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch(`/api/products/image/${product!.ItemUPC}`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.imageUrl) setImageUrl(data.imageUrl);
      else setError(data.error ?? "Upload failed");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const patch: ProductOverride = {};
    if (hidden)                                        patch.hidden      = true;
    if (featured)                                      patch.featured    = true;
    if (label)                                         patch.label       = label;
    if (imageUrl.trim())                               patch.imageUrl    = imageUrl.trim();
    if (priceInput && !isNaN(Number(priceInput)))      patch.onlinePrice = Number(priceInput);

    try {
      const res = await fetch("/api/products/overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upc: product!.ItemUPC, ...patch }),
      });
      if (!res.ok) throw new Error();
      onSaved(product!.ItemUPC, patch);
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await fetch("/api/products/overrides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upc: product!.ItemUPC }),
      });
      onSaved(product!.ItemUPC, {});
      onClose();
    } catch {
      setError("Failed to reset.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white border-l border-stone-200 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-stone-200">
          <div className="min-w-0 pr-3">
            <h2 className="font-bold text-stone-900 text-sm">Edit Product</h2>
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-2 leading-snug">{product.ItemName}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors flex-shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Image */}
          <section>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-2">
              <ImageIcon size={13} /> Product Image
            </label>
            <div className="w-full aspect-video bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-center mb-3 overflow-hidden relative">
              {imageUrl ? (
                <Image src={imageUrl} alt={product.ItemName} fill sizes="320px" className="object-contain p-4" unoptimized />
              ) : (
                <span className="text-5xl opacity-30">{emoji}</span>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL…"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400"
              />
              <label className="flex items-center justify-center gap-2 w-full border border-stone-200 rounded-lg py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors">
                <Upload size={13} />
                {uploading ? "Uploading…" : "Upload from computer"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={handleUpload} disabled={uploading} />
              </label>
              {imageUrl && (
                <button type="button" onClick={() => setImageUrl("")} className="text-xs text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1">
                  <X size={11} /> Clear image
                </button>
              )}
            </div>
          </section>

          {/* Featured */}
          <section>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-2">
              <Star size={13} /> Featured Product
            </label>
            <button
              type="button"
              onClick={() => setFeatured(!featured)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                featured
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-stone-50 border-stone-200 text-stone-500"
              }`}
            >
              <span className="text-sm font-semibold">{featured ? "Featured on homepage" : "Not featured"}</span>
              <div className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${featured ? "bg-amber-400" : "bg-stone-300"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${featured ? "left-4" : "left-0.5"}`} />
              </div>
            </button>
          </section>

          {/* Hidden */}
          <section>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-2">
              <EyeOff size={13} /> Hide from Website
            </label>
            <button
              type="button"
              onClick={() => setHidden(!hidden)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                hidden
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-stone-50 border-stone-200 text-stone-500"
              }`}
            >
              <span className="text-sm font-semibold flex items-center gap-2">
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                {hidden ? "Hidden — not visible to customers" : "Visible on shop (default)"}
              </span>
              <div className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${hidden ? "bg-red-400" : "bg-stone-300"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${hidden ? "left-4" : "left-0.5"}`} />
              </div>
            </button>
            {hidden && (
              <p className="text-xs text-red-500 mt-1.5">This product will not appear in the shop until you turn this off.</p>
            )}
          </section>

          {/* Label */}
          <section>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-2">
              <Tag size={13} /> Product Label
            </label>
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 bg-white"
            >
              {LABELS.map((l) => <option key={l} value={l}>{l || "No label"}</option>)}
            </select>
            {label && (
              <p className="text-xs text-stone-400 mt-1.5">
                Label <span className="font-semibold text-stone-600">"{label}"</span> will appear as a badge on the product.
              </p>
            )}
          </section>

          {/* Online price override */}
          <section>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1">
              <DollarSign size={13} /> Online Price Override
            </label>
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
              <Info size={11} />
              POS: <strong className="text-stone-600">${posPrice}</strong>
              · Kanji online: <strong className="text-stone-600">${kanjiPrice}</strong>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder={kanjiPrice}
                className="w-full border border-stone-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400"
              />
            </div>
            {priceInput && !isNaN(Number(priceInput)) && (
              <p className="text-xs text-green-600 mt-1.5 font-medium">
                Customers will see: ${Number(priceInput).toFixed(2)}
              </p>
            )}
            {priceInput && (
              <button type="button" onClick={() => setPriceInput("")} className="text-xs text-stone-400 hover:text-red-500 mt-1 transition-colors flex items-center gap-1">
                <X size={11} /> Clear override
              </button>
            )}
          </section>

          {/* Product info */}
          <section className="bg-stone-50 rounded-xl px-4 py-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Product Info</p>
            {[
              ["UPC",   product.ItemUPC,      "font-mono"],
              ["Dept",  product.Department,   ""],
              ["Size",  product.Size,         ""],
              ["Stock", String(product.CurrentStock), ""],
            ].map(([k, v, cls]) => (
              <p key={k} className="text-xs text-stone-500">
                {k}: <span className={`font-semibold text-stone-700 ${cls}`}>{v}</span>
              </p>
            ))}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-5 py-4 space-y-2">
          {error && <p className="text-xs text-red-500 pb-1">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 text-stone-400 hover:text-red-500 text-xs py-1.5 transition-colors"
          >
            <RotateCcw size={12} /> Reset all overrides for this product
          </button>
        </div>
      </aside>
    </>
  );
}
