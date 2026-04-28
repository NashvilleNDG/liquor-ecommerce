"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Download, Star, EyeOff, Pencil,
  ImageIcon, Tag, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import type { OverridesMap, ProductOverride } from "@/lib/product-overrides";
import ProductEditPanel from "./ProductEditPanel";

type ImageCache = Record<string, string | null>;

// ── helpers ────────────────────────────────────────────────────────────────────

const DEPT_EMOJI: Record<string, string> = {
  BEER: "🍺", Wines: "🍷", WINE: "🍷", LIQUOR: "🥃", Spirits: "🥃",
  Wine: "🍷", Beer: "🍺", MIXERS: "🍹", Soda: "🥤", CBD: "🌿",
  CIGARS: "💨", Cigarette: "🚬",
};

const DEPT_LABEL: Record<string, string> = {
  BEER: "Beer", Wines: "Wine", WINE: "Wine", LIQUOR: "Spirits",
  Spirits: "Spirits", Wine: "Wine", Beer: "Beer", MIXERS: "Mixers",
  Soda: "Soda", CBD: "CBD", CIGARS: "Cigars", Cigarette: "Cigarettes",
};

function exportCSV(products: Product[], overrides: OverridesMap) {
  const headers = ["UPC", "Name", "Department", "Size", "Pack", "Stock",
    "POS Price", "Online Price", "Override Price", "Featured", "Hidden", "Label", "Image"];
  const rows = products.map((p) => {
    const ov = overrides[p.ItemUPC] ?? {};
    return [
      p.ItemUPC,
      `"${p.ItemName?.toString().replace(/"/g, '""')}"`,
      p.Department, p.Size, p.Pack, p.CurrentStock,
      Number(p.Price).toFixed(2), Number(p.OnlinePrice).toFixed(2),
      ov.onlinePrice?.toFixed(2) ?? "",
      ov.featured ? "Yes" : "", ov.hidden ? "Yes" : "",
      ov.label ?? "", ov.imageUrl ?? "",
    ];
  });
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type SortKey = "ItemName" | "Price" | "CurrentStock" | "Department";
type SortDir = "asc" | "desc";
type Tab     = "all" | "featured" | "hidden" | "no-image" | "low-stock" | "out-of-stock";

const TABS: { id: Tab; label: string }[] = [
  { id: "all",         label: "All Products" },
  { id: "featured",    label: "⭐ Featured" },
  { id: "hidden",      label: "🙈 Hidden" },
  { id: "no-image",    label: "📷 No Image" },
  { id: "low-stock",   label: "⚠ Low Stock" },
  { id: "out-of-stock",label: "❌ Out of Stock" },
];

const PAGE_SIZES = [20, 50, 100];

interface Props {
  products:         Product[];
  initialOverrides: OverridesMap;
  imageCache?:      ImageCache;
}

// ── component ──────────────────────────────────────────────────────────────────

export default function ProductTable({ products, initialOverrides, imageCache = {} }: Props) {
  const [overrides,   setOverrides]   = useState<OverridesMap>(initialOverrides);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [search,      setSearch]      = useState("");
  const [dept,        setDept]        = useState("ALL");
  const [tab,         setTab]         = useState<Tab>("all");
  const [sortKey,     setSortKey]     = useState<SortKey>("ItemName");
  const [sortDir,     setSortDir]     = useState<SortDir>("asc");
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(20);

  const departments = useMemo(() => {
    const set = new Set(products.map((p) => p.Department));
    return ["ALL", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let r = products;
    if (dept !== "ALL")            r = r.filter((p) => p.Department === dept);
    if (tab === "featured")        r = r.filter((p) => overrides[p.ItemUPC]?.featured);
    if (tab === "hidden")          r = r.filter((p) => overrides[p.ItemUPC]?.hidden);
    if (tab === "no-image")        r = r.filter((p) => !overrides[p.ItemUPC]?.imageUrl);
    if (tab === "low-stock")       r = r.filter((p) => Number(p.CurrentStock) > 0 && Number(p.CurrentStock) <= 5);
    if (tab === "out-of-stock")    r = r.filter((p) => Number(p.CurrentStock) <= 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((p) =>
        p.ItemName?.toString().toLowerCase().includes(q) ||
        p.ItemUPC?.toString().includes(q) ||
        p.Department?.toString().toLowerCase().includes(q)
      );
    }
    return [...r].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, dept, search, sortKey, sortDir, tab, overrides]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allOnPageSelected = paginated.length > 0 && paginated.every((p) => selected.has(p.ItemUPC));

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) paginated.forEach((p) => next.delete(p.ItemUPC));
      else paginated.forEach((p) => next.add(p.ItemUPC));
      return next;
    });
  }

  function toggleSelect(upc: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(upc) ? next.delete(upc) : next.add(upc);
      return next;
    });
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={13} className="text-stone-300 ml-1" />;
    return sortDir === "asc"
      ? <ArrowUp   size={13} className="text-stone-600 ml-1" />
      : <ArrowDown size={13} className="text-stone-600 ml-1" />;
  }

  function handleSaved(upc: string, patch: ProductOverride) {
    setOverrides((prev) => {
      const next = { ...prev };
      if (Object.keys(patch).length === 0) delete next[upc];
      else next[upc] = patch;
      return next;
    });
  }

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }

  const editOverride = editProduct ? (overrides[editProduct.ItemUPC] ?? {}) : {};

  // Page number pills (max 7 visible)
  const pageNums = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  }, [page, totalPages]);

  return (
    <div className="flex flex-col gap-0">

      {/* ── Top bar: tabs + search + dept + export ── */}
      <div className="flex flex-col gap-3 mb-5">

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-stone-200 overflow-x-auto">
          {TABS.map((t) => {
            const count =
              t.id === "all"          ? products.length :
              t.id === "featured"     ? Object.values(overrides).filter((o) => o.featured).length :
              t.id === "hidden"       ? Object.values(overrides).filter((o) => o.hidden).length :
              t.id === "no-image"     ? products.filter((p) => !overrides[p.ItemUPC]?.imageUrl).length :
              t.id === "low-stock"    ? products.filter((p) => Number(p.CurrentStock) > 0 && Number(p.CurrentStock) <= 5).length :
              products.filter((p) => Number(p.CurrentStock) <= 0).length;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setPage(1); }}
                className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
                }`}
              >
                {t.label}
                <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
                }`}>{count.toLocaleString()}</span>
              </button>
            );
          })}
        </div>

        {/* Search + Dept + Export */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, UPC, or department…"
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
            />
          </div>
          <select
            value={dept}
            onChange={(e) => { setDept(e.target.value); setPage(1); }}
            className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:border-stone-400 min-w-[160px]"
          >
            {departments.map((d) => <option key={d} value={d}>{d === "ALL" ? "All Departments" : d}</option>)}
          </select>
          <button
            onClick={() => exportCSV(filtered, overrides)}
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 hover:border-stone-300 bg-white rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-all whitespace-nowrap"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Bulk action bar — only shown when items selected */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm">
            <span className="font-semibold">{selected.size} selected</span>
            <div className="h-4 w-px bg-white/20" />
            <button
              onClick={() => {
                selected.forEach((upc) => {
                  fetch("/api/products/overrides", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ upc, hidden: true }),
                  });
                  handleSaved(upc, { ...overrides[upc], hidden: true });
                });
                setSelected(new Set());
              }}
              className="hover:underline"
            >Hide selected</button>
            <button
              onClick={() => {
                selected.forEach((upc) => {
                  fetch("/api/products/overrides", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ upc }),
                  });
                  handleSaved(upc, {});
                });
                setSelected(new Set());
              }}
              className="hover:underline"
            >Reset overrides</button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-white/60 hover:text-white">
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* ── Table header ── */}
      <div className="grid grid-cols-[32px_80px_1fr_120px_100px_110px_80px] items-center gap-4 px-4 py-2 bg-stone-50 border border-stone-200 rounded-t-xl text-xs font-semibold text-stone-500 uppercase tracking-wide">
        <input
          type="checkbox"
          checked={allOnPageSelected}
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded accent-stone-800 cursor-pointer"
        />
        <span />
        <button onClick={() => handleSort("ItemName")} className="flex items-center text-left hover:text-stone-900 transition-colors">
          Name <SortIcon col="ItemName" />
        </button>
        <button onClick={() => handleSort("Department")} className="flex items-center hover:text-stone-900 transition-colors">
          Type <SortIcon col="Department" />
        </button>
        <button onClick={() => handleSort("Price")} className="flex items-center hover:text-stone-900 transition-colors">
          Price <SortIcon col="Price" />
        </button>
        <button onClick={() => handleSort("CurrentStock")} className="flex items-center hover:text-stone-900 transition-colors">
          Stock <SortIcon col="CurrentStock" />
        </button>
        <span className="text-right">Edit</span>
      </div>

      {/* ── Rows ── */}
      <div className="border-x border-b border-stone-200 rounded-b-xl overflow-hidden divide-y divide-stone-100">
        {paginated.length === 0 ? (
          <div className="py-20 text-center text-stone-400 text-sm">No products match your filters.</div>
        ) : paginated.map((p) => {
          const ov       = overrides[p.ItemUPC];
          const stock    = Number(p.CurrentStock);
          const inStock  = stock > 0;
          const lowStock = inStock && stock <= 5;
          const imageUrl = ov?.imageUrl ?? imageCache[p.ItemUPC] ?? null;
          const emoji    = DEPT_EMOJI[p.Department] ?? "🍾";
          const isSelected = selected.has(p.ItemUPC);
          const displayPrice = ov?.onlinePrice ?? Number(p.OnlinePrice);

          return (
            <div
              key={p.ItemUPC}
              className={`grid grid-cols-[32px_80px_1fr_120px_100px_110px_80px] items-center gap-4 px-4 py-4 transition-colors ${
                isSelected ? "bg-amber-50/60" : "bg-white hover:bg-stone-50/80"
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(p.ItemUPC)}
                className="w-4 h-4 rounded accent-stone-800 cursor-pointer"
              />

              {/* Image — links to detail page */}
              <Link href={`/dashboard/products/${encodeURIComponent(p.ItemUPC)}`} className="w-[72px] h-[90px] rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden relative flex-shrink-0 hover:border-amber-300 hover:shadow-sm transition-all">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={p.ItemName}
                    fill
                    sizes="72px"
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl opacity-50">{emoji}</span>
                )}
              </Link>

              {/* Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Link
                    href={`/dashboard/products/${encodeURIComponent(p.ItemUPC)}`}
                    className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 hover:text-amber-700 transition-colors"
                  >
                    {ov?.websiteName || p.ItemName}
                  </Link>
                  {ov?.featured && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      <Star size={8} /> Featured
                    </span>
                  )}
                  {ov?.hidden && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      <EyeOff size={8} /> Hidden
                    </span>
                  )}
                  {ov?.label && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      <Tag size={8} /> {ov.label}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-0.5 mt-1.5">
                  {[
                    ["Size",   p.Size      || "—"],
                    ["Pack",   p.Pack      || "—"],
                    ["UPC",    p.ItemUPC],
                  ].map(([label, val]) => (
                    <p key={label} className="text-xs text-stone-400">
                      <span className="text-stone-400">{label} </span>
                      <span className={`font-medium text-stone-600 ${label === "UPC" ? "font-mono" : ""}`}>{val}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div>
                <p className="text-sm font-medium text-stone-700">{DEPT_LABEL[p.Department] ?? p.Department}</p>
                <p className="text-xs text-stone-400 mt-0.5">{emoji}</p>
              </div>

              {/* Price */}
              <div>
                <p className={`text-base font-bold ${ov?.onlinePrice ? "text-amber-600" : "text-stone-900"}`}>
                  ${displayPrice.toFixed(2)}
                </p>
                {ov?.onlinePrice && (
                  <p className="text-[11px] text-stone-400 line-through">${Number(p.OnlinePrice).toFixed(2)}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <p className={`text-base font-bold ${!inStock ? "text-red-500" : lowStock ? "text-amber-500" : "text-green-600"}`}>
                  {stock}
                </p>
                <p className="text-[11px] text-stone-400">
                  {!inStock ? "Out of stock" : lowStock ? "Low stock" : "In stock"}
                </p>
              </div>

              {/* Edit — full detail page */}
              <div className="flex justify-end">
                <Link
                  href={`/dashboard/products/${encodeURIComponent(p.ItemUPC)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-stone-100 hover:bg-amber-50 hover:border-amber-300 border border-transparent hover:text-amber-700 text-stone-600 transition-all"
                >
                  <Pencil size={12} /> Edit
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 text-sm text-stone-500">
        <div className="flex items-center gap-2">
          <span>Results per page:</span>
          {PAGE_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => { setPageSize(s); setPage(1); }}
              className={`w-9 h-8 rounded-lg text-xs font-semibold border transition-colors ${
                pageSize === s
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 transition-colors text-xs font-semibold"
          >
            <ChevronLeft size={14} /> Prev
          </button>

          {pageNums.map((n, i) =>
            n === "…" ? (
              <span key={`ellipsis-${i}`} className="px-1 text-stone-300">…</span>
            ) : (
              <button
                key={n}
                onClick={() => goToPage(Number(n))}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${
                  page === n
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                }`}
              >
                {n}
              </button>
            )
          )}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 transition-colors text-xs font-semibold"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>

        <p className="text-xs text-stone-400 tabular-nums">
          {((page - 1) * pageSize + 1).toLocaleString()}–{Math.min(page * pageSize, filtered.length).toLocaleString()} of {filtered.length.toLocaleString()}
        </p>
      </div>

      {/* Edit panel */}
      <ProductEditPanel
        product={editProduct}
        override={editOverride}
        onClose={() => setEditProduct(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
