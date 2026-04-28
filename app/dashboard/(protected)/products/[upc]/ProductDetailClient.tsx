"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Upload, X, Plus, Save, ExternalLink,
  Tag, Star, EyeOff, Eye, DollarSign, Percent,
  Copy, Check, ImageIcon, Info, Pencil,
} from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import type { ProductOverride, ProductDiscount } from "@/lib/product-overrides";

// ── Preset taxonomy suggestions per department ──────────────────────────────
const TYPE_PRESETS: Record<string, string[]> = {
  LIQUOR:   ["Spirits", "Alcohol"],
  Spirits:  ["Spirits", "Alcohol"],
  BEER:     ["Beer", "Alcohol"],
  Beer:     ["Beer", "Alcohol"],
  Wines:    ["Wine", "Alcohol"],
  WINE:     ["Wine", "Alcohol"],
  Wine:     ["Wine", "Alcohol"],
  MIXERS:   ["Mixers", "Non-Alcoholic"],
  Soda:     ["Soda", "Non-Alcoholic"],
};
const SUBTYPE_PRESETS: Record<string, string[]> = {
  LIQUOR:   ["Bourbon", "Scotch", "Whiskey", "Vodka", "Tequila", "Gin", "Rum", "Cognac", "Brandy", "Mezcal"],
  Spirits:  ["Bourbon", "Scotch", "Whiskey", "Vodka", "Tequila", "Gin", "Rum", "Cognac", "Brandy", "Mezcal"],
  BEER:     ["IPA", "Stout", "Lager", "Ale", "Pilsner", "Porter", "Wheat", "Sour", "Hard Seltzer"],
  Beer:     ["IPA", "Stout", "Lager", "Ale", "Pilsner", "Porter", "Wheat", "Sour", "Hard Seltzer"],
  Wines:    ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Port", "Champagne"],
  WINE:     ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Port", "Champagne"],
  Wine:     ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Port", "Champagne"],
};
const LABELS = ["", "Staff Pick", "New Arrival", "Limited", "On Sale", "Best Seller", "Exclusive"];
const LABEL_COLORS: Record<string, string> = {
  "Staff Pick":  "bg-amber-100 text-amber-800 border-amber-200",
  "New Arrival": "bg-green-100 text-green-800 border-green-200",
  "Limited":     "bg-red-100 text-red-800 border-red-200",
  "On Sale":     "bg-crimson/10 text-crimson border-crimson/20",
  "Best Seller": "bg-stone-100 text-stone-800 border-stone-300",
  "Exclusive":   "bg-purple-100 text-purple-800 border-purple-200",
};

// ── Reusable section wrapper ────────────────────────────────────────────────
function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
        <h2 className="font-bold text-stone-900 text-sm">{title}</h2>
        {hint && <span className="text-xs text-stone-400">{hint}</span>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Tag input ───────────────────────────────────────────────────────────────
function TagInput({
  tags, onAdd, onRemove, placeholder, presets,
}: {
  tags: string[];
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
  placeholder: string;
  presets?: string[];
}) {
  const [input, setInput] = useState("");

  function add(val: string) {
    const v = val.trim();
    if (v && !tags.includes(v)) onAdd(v);
    setInput("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold px-2.5 py-1 rounded-full">
            {t}
            <button onClick={() => onRemove(t)} className="text-stone-400 hover:text-red-500 transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-xs text-stone-400 italic">No tags added</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(input); } }}
          placeholder={placeholder}
          className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400"
        />
        <button onClick={() => add(input)} className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors">
          <Plus size={14} />
        </button>
      </div>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.filter((p) => !tags.includes(p)).map((p) => (
            <button
              key={p}
              onClick={() => onAdd(p)}
              className="text-[11px] font-medium text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 bg-white px-2 py-0.5 rounded-full transition-all"
            >
              + {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
interface Props {
  product:          Product;
  initialOverride:  ProductOverride;
  cachedImageUrl?:  string | null;
}

export default function ProductDetailClient({ product, initialOverride, cachedImageUrl }: Props) {
  // Content
  const [websiteName,  setWebsiteName]  = useState(initialOverride.websiteName  ?? "");
  const [subtitle,     setSubtitle]     = useState(initialOverride.subtitle     ?? "");
  const [description,  setDescription]  = useState(initialOverride.description  ?? "");
  // Images
  const [imageUrl,     setImageUrl]     = useState(initialOverride.imageUrl ?? cachedImageUrl ?? "");
  const [addlImages,   setAddlImages]   = useState<string[]>(initialOverride.additionalImages ?? []);
  const [imageUrlDraft,setImageUrlDraft]= useState("");
  // Taxonomy
  const [types,        setTypes]        = useState<string[]>(initialOverride.types    ?? []);
  const [subTypes,     setSubTypes]     = useState<string[]>(initialOverride.subTypes ?? []);
  const [brand,        setBrand]        = useState(initialOverride.brand    ?? "");
  const [country,      setCountry]      = useState(initialOverride.country  ?? "");
  const [region,       setRegion]       = useState(initialOverride.region   ?? "");
  const [varietal,     setVarietal]     = useState(initialOverride.varietal ?? "");
  // Merchandising
  const [hidden,       setHidden]       = useState(initialOverride.hidden    ?? false);
  const [featured,     setFeatured]     = useState(initialOverride.featured  ?? false);
  const [label,        setLabel]        = useState(initialOverride.label     ?? "");
  const [onlinePrice,  setOnlinePrice]  = useState(initialOverride.onlinePrice?.toString() ?? "");
  const [discount,     setDiscount]     = useState<ProductDiscount | null>(initialOverride.discount ?? null);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(initialOverride.discount?.type ?? "percent");
  const [discountVal,  setDiscountVal]  = useState(initialOverride.discount?.value?.toString() ?? "");

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [copied,  setCopied]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const posPrice    = Number(product.Price);
  const basePrice   = onlinePrice && !isNaN(Number(onlinePrice)) ? Number(onlinePrice) : posPrice;
  const hasDiscount = discountVal && !isNaN(Number(discountVal)) && Number(discountVal) > 0;
  const finalPrice  = hasDiscount
    ? discountType === "percent"
      ? basePrice * (1 - Number(discountVal) / 100)
      : Math.max(0, basePrice - Number(discountVal))
    : basePrice;

  const productUrl = typeof window !== "undefined"
    ? `${window.location.origin}/shop/${encodeURIComponent(product.ItemUPC)}`
    : `/shop/${encodeURIComponent(product.ItemUPC)}`;

  const typePresets    = TYPE_PRESETS[product.Department]    ?? [];
  const subtypePresets = SUBTYPE_PRESETS[product.Department] ?? [];

  // ── Image upload ────────────────────────────────────────────────────────
  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch(`/api/products/image/${product.ItemUPC}`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.imageUrl) setImageUrl(data.imageUrl);
      else setError(data.error ?? "Upload failed");
    } catch { setError("Upload failed"); }
    finally   { setUploading(false); }
  }

  function addAdditionalImage() {
    const url = imageUrlDraft.trim();
    if (url && !addlImages.includes(url)) {
      setAddlImages((prev) => [...prev, url]);
      setImageUrlDraft("");
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const patch: ProductOverride = {};
    if (websiteName.trim())  patch.websiteName  = websiteName.trim();
    if (subtitle.trim())     patch.subtitle     = subtitle.trim();
    if (description.trim())  patch.description  = description.trim();
    if (imageUrl.trim())     patch.imageUrl     = imageUrl.trim();
    if (addlImages.length)   patch.additionalImages = addlImages;
    if (types.length)        patch.types        = types;
    if (subTypes.length)     patch.subTypes     = subTypes;
    if (brand.trim())        patch.brand        = brand.trim();
    if (country.trim())      patch.country      = country.trim();
    if (region.trim())       patch.region       = region.trim();
    if (varietal.trim())     patch.varietal     = varietal.trim();
    if (hidden)              patch.hidden       = true;
    if (featured)            patch.featured     = true;
    if (label)               patch.label        = label;
    if (onlinePrice && !isNaN(Number(onlinePrice))) patch.onlinePrice = Number(onlinePrice);
    if (hasDiscount) patch.discount = { type: discountType, value: Number(discountVal) };

    try {
      const res = await fetch("/api/products/overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upc: product.ItemUPC, ...patch }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Failed to save. Please try again."); }
    finally   { setSaving(false); }
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const DEPT_EMOJI: Record<string, string> = {
    BEER: "🍺", Wines: "🍷", WINE: "🍷", LIQUOR: "🥃", Spirits: "🥃",
    Wine: "🍷", Beer: "🍺", MIXERS: "🍹", Soda: "🥤",
  };

  return (
    <div className="min-h-full bg-stone-50">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200 px-4 sm:px-6 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard/inventory"
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft size={16} /> Products
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-sm font-semibold text-stone-700 truncate max-w-xs">
            {initialOverride.websiteName || product.ItemName}
          </span>
          <span className="ml-1 font-mono text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 hidden sm:inline">
            {product.ItemUPC}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {error   && <p className="text-xs text-red-500">{error}</p>}
            {saved   && <span className="flex items-center gap-1 text-xs text-green-600 font-semibold"><Check size={14} /> Saved</span>}
            <Link
              href={`/shop/${encodeURIComponent(product.ItemUPC)}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <ExternalLink size={13} /> View in Shop
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 bg-stone-900 hover:bg-stone-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* POS read-only info bar */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-amber-700">
          <span className="flex items-center gap-1"><Info size={11} /> <strong>POS Data (read-only)</strong></span>
          <span>Name: <strong>{product.ItemName}</strong></span>
          <span>Size: <strong>{product.Size || "—"}</strong></span>
          <span>Pack: <strong>{product.Pack || "—"}</strong></span>
          <span>Dept: <strong>{product.Department}</strong></span>
          <span>POS Price: <strong>${posPrice.toFixed(2)}</strong></span>
          <span>Stock: <strong>{product.CurrentStock}</strong></span>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column — images */}
          <div className="space-y-5">

            {/* Primary image */}
            <Section title="Primary Image" hint="Shown everywhere">
              <div className="aspect-square bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-center overflow-hidden relative mb-4">
                {imageUrl ? (
                  <Image src={imageUrl} alt={product.ItemName} fill sizes="300px" className="object-contain p-4" unoptimized />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <span className="text-6xl">{DEPT_EMOJI[product.Department] ?? "🍾"}</span>
                    <p className="text-xs text-stone-500">No image yet</p>
                  </div>
                )}
                {imageUrl && (
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-red-500 shadow-sm transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <p className="text-[11px] text-stone-400 mb-2">⚠ Use images without backgrounds or trademarks for best quality</p>

              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL…"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400"
                />
                <input type="file" ref={fileRef} accept="image/*" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 border border-stone-200 rounded-lg py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <Upload size={13} /> {uploading ? "Uploading…" : "Upload from computer"}
                </button>
              </div>
            </Section>

            {/* Additional images */}
            <Section title="Additional Images" hint="Gallery photos">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {addlImages.map((url, i) => (
                  <div key={i} className="aspect-square bg-stone-100 rounded-lg relative overflow-hidden border border-stone-200">
                    <Image src={url} alt="" fill sizes="80px" className="object-contain p-1" unoptimized />
                    <button
                      onClick={() => setAddlImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-red-500 shadow-sm"
                    >
                      <X size={9} />
                    </button>
                  </div>
                ))}
                {/* Add slot */}
                <div className="aspect-square bg-stone-50 border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
                  onClick={() => document.getElementById("addlUrlInput")?.focus()}
                >
                  <Plus size={18} className="text-stone-400" />
                  <span className="text-[10px] text-stone-400">Add</span>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  id="addlUrlInput"
                  type="url"
                  value={imageUrlDraft}
                  onChange={(e) => setImageUrlDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAdditionalImage()}
                  placeholder="Paste image URL and press Enter…"
                  className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400"
                />
                <button onClick={addAdditionalImage} className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
                  <Plus size={14} className="text-stone-600" />
                </button>
              </div>
            </Section>
          </div>

          {/* Right column — content + taxonomy */}
          <div className="lg:col-span-2 space-y-5">

            {/* Website name + subtitle */}
            <Section title="Product Name" hint="Website only — does not update POS">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    Display Name <span className="text-stone-400 font-normal">(leave blank to use POS name)</span>
                  </label>
                  <input
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder={product.ItemName}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">Subtitle / Tagline</label>
                  <input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Aged 12 years · Single Barrel · Tennessee"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50"
                  />
                </div>
              </div>
            </Section>

            {/* Description */}
            <Section title="Description" hint="Shown on product page">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a compelling description for this product. Include tasting notes, origin, and pairing suggestions…"
                rows={5}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 resize-none leading-relaxed"
              />
              <p className="text-[11px] text-stone-400 mt-1.5">{description.length} characters</p>
            </Section>

            {/* Types + Sub Types */}
            <Section title="Types & Sub Types" hint="Help customers find this product">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-2">Types</label>
                  <TagInput
                    tags={types}
                    onAdd={(t) => setTypes((p) => [...p, t])}
                    onRemove={(t) => setTypes((p) => p.filter((x) => x !== t))}
                    placeholder="e.g. Spirits, Alcohol…"
                    presets={typePresets}
                  />
                </div>
                <div className="border-t border-stone-100 pt-5">
                  <label className="block text-xs font-semibold text-stone-600 mb-2">Sub Types</label>
                  <TagInput
                    tags={subTypes}
                    onAdd={(t) => setSubTypes((p) => [...p, t])}
                    onRemove={(t) => setSubTypes((p) => p.filter((x) => x !== t))}
                    placeholder="e.g. Bourbon, Single Barrel…"
                    presets={subtypePresets}
                  />
                </div>
              </div>
            </Section>

            {/* Properties */}
            <Section title="Properties">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Brand",    val: brand,    set: setBrand },
                  { label: "Country",  val: country,  set: setCountry },
                  { label: "Region",   val: region,   set: setRegion },
                  { label: "Varietal", val: varietal, set: setVarietal },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">{label}</label>
                    <input
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={`Enter ${label.toLowerCase()}…`}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* ── Stock actions ── */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-bold text-stone-900 text-sm">Stock Actions</h2>
            <p className="text-xs text-stone-400 mt-0.5">Pricing and merchandising controls — website only</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">

            {/* Website price */}
            <div className="px-6 py-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-3">
                <DollarSign size={13} /> Website Price
              </label>
              <p className="text-[11px] text-stone-400 mb-2">
                POS: <strong>${posPrice.toFixed(2)}</strong>
                {Number(product.OnlinePrice) !== posPrice && (
                  <> · Kanji: <strong>${Number(product.OnlinePrice).toFixed(2)}</strong></>
                )}
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input
                  type="number" step="0.01" min="0"
                  value={onlinePrice}
                  onChange={(e) => setOnlinePrice(e.target.value)}
                  placeholder={posPrice.toFixed(2)}
                  className="w-full border border-stone-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400"
                />
              </div>
              {onlinePrice && !isNaN(Number(onlinePrice)) && (
                <p className="text-xs text-amber-600 mt-1.5 font-semibold">Customers see: ${Number(onlinePrice).toFixed(2)}</p>
              )}
            </div>

            {/* Discount */}
            <div className="px-6 py-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-3">
                <Percent size={13} /> Discount
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setDiscountType("percent")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${discountType === "percent" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"}`}
                >
                  % Off
                </button>
                <button
                  onClick={() => setDiscountType("fixed")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${discountType === "fixed" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"}`}
                >
                  $ Off
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                  {discountType === "percent" ? "%" : "$"}
                </span>
                <input
                  type="number" step="0.01" min="0"
                  value={discountVal}
                  onChange={(e) => setDiscountVal(e.target.value)}
                  placeholder="0"
                  className="w-full border border-stone-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400"
                />
              </div>
              {hasDiscount && (
                <div className="mt-1.5 space-y-0.5">
                  <p className="text-xs text-stone-400 line-through">${basePrice.toFixed(2)}</p>
                  <p className="text-xs text-green-600 font-bold">Sale: ${finalPrice.toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Label */}
            <div className="px-6 py-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-3">
                <Tag size={13} /> Product Label
              </label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 bg-white mb-3"
              >
                {LABELS.map((l) => <option key={l} value={l}>{l || "No label"}</option>)}
              </select>
              {label && (
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${LABEL_COLORS[label] ?? "bg-stone-100 text-stone-700 border-stone-200"}`}>
                  {label}
                </span>
              )}
            </div>

            {/* Visibility + Featured */}
            <div className="px-6 py-5 space-y-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-3">
                <EyeOff size={13} /> Visibility
              </label>

              {/* Featured */}
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors text-sm font-semibold ${
                  featured ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-stone-50 border-stone-200 text-stone-500"
                }`}
              >
                <span className="flex items-center gap-2"><Star size={14} /> {featured ? "Featured" : "Not featured"}</span>
                <div className={`w-8 h-4 rounded-full relative flex-shrink-0 ${featured ? "bg-amber-400" : "bg-stone-300"}`}>
                  <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${featured ? "left-4" : "left-0.5"}`} />
                </div>
              </button>

              {/* Hide */}
              <button
                type="button"
                onClick={() => setHidden(!hidden)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors text-sm font-semibold ${
                  hidden ? "bg-red-50 border-red-300 text-red-700" : "bg-stone-50 border-stone-200 text-stone-500"
                }`}
              >
                <span className="flex items-center gap-2">
                  {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  {hidden ? "Hidden" : "Visible"}
                </span>
                <div className={`w-8 h-4 rounded-full relative flex-shrink-0 ${hidden ? "bg-red-400" : "bg-stone-300"}`}>
                  <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${hidden ? "left-4" : "left-0.5"}`} />
                </div>
              </button>
              {hidden && <p className="text-[11px] text-red-500">Hidden from shop until turned off.</p>}
            </div>
          </div>
        </div>

        {/* ── Product URL ── */}
        <div className="bg-white rounded-2xl border border-stone-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-semibold text-stone-700 mb-1">Product URL</p>
            <p className="text-sm text-stone-500 font-mono break-all">{productUrl}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
            >
              {copied ? <><Check size={13} className="text-green-500" /> Copied!</> : <><Copy size={13} /> Copy URL</>}
            </button>
            <Link
              href={`/shop/${encodeURIComponent(product.ItemUPC)}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors"
            >
              <ExternalLink size={13} /> Open Page
            </Link>
          </div>
        </div>

        {/* Bottom save */}
        <div className="flex justify-end gap-3 pb-6">
          {error && <p className="text-sm text-red-500 self-center">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-bold px-6 py-3 bg-stone-900 hover:bg-stone-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-lg"
          >
            <Save size={16} /> {saving ? "Saving…" : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
