"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, X, ChevronDown, ChevronUp,
  Grid3X3, LayoutList, ArrowUpDown, Filter, Package
} from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import ProductCard from "@/components/ProductCard";
import ProductRow from "@/components/ProductRow";

interface Props {
  products: (Product & { _variantCount?: number })[];
  departments: string[];
}

const DEPT_META: Record<string, { label: string; icon: string }> = {
  BEER:             { label: "Beer",           icon: "🍺" },
  Wines:            { label: "Wine",           icon: "🍷" },
  WINE:             { label: "Wine",           icon: "🍷" },
  LIQUOR:           { label: "Spirits",        icon: "🥃" },
  CBD:              { label: "CBD",            icon: "🌿" },
  CIGARS:           { label: "Cigars",         icon: "💨" },
  Cigarette:        { label: "Cigarettes",     icon: "🚬" },
  Soda:             { label: "Soda",           icon: "🥤" },
  MIXERS:           { label: "Mixers",         icon: "🍹" },
  TOBACCO:          { label: "Tobacco",        icon: "🌱" },
  KEG:              { label: "Kegs",           icon: "🛢️" },
  "Cigar Accessory":{ label: "Accessories",   icon: "🗜️" },
};

const SORT_OPTIONS = [
  { value: "name",       label: "Name A – Z" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "stock_desc", label: "Most In Stock" },
];

const PAGE_SIZE = 48;

function FilterSection({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-200 dark:border-stone-800 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white transition-colors mb-0"
      >
        {title}
        {open ? <ChevronUp size={14} className="text-stone-400 dark:text-stone-500" /> : <ChevronDown size={14} className="text-stone-400 dark:text-stone-500" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function ShopClient({ products, departments }: Props) {
  const searchParams = useSearchParams();

  const [search, setSearch]           = useState(searchParams.get("q") ?? "");
  const [dept, setDept]               = useState(searchParams.get("dept") ?? "ALL");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("instock") === "1");
  const [sort, setSort]               = useState(searchParams.get("sort") ?? "name");
  const [minPrice, setMinPrice]       = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice]       = useState(searchParams.get("max") ?? "");
  const [page, setPage]               = useState(1);
  const [view, setView]               = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state whenever URL params change (e.g. clicking a nav link)
  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setDept(searchParams.get("dept") ?? "ALL");
    setInStockOnly(searchParams.get("instock") === "1");
    setSort(searchParams.get("sort") ?? "name");
    setMinPrice(searchParams.get("min") ?? "");
    setMaxPrice(searchParams.get("max") ?? "");
    setPage(1);
  }, [searchParams]);

  // Reset page on manual filter change
  useEffect(() => { setPage(1); }, [search, dept, inStockOnly, sort, minPrice, maxPrice]);

  const filtered = useMemo(() => {
    let r = products;
    if (dept !== "ALL")  r = r.filter((p) => p.Department === dept);
    if (inStockOnly)     r = r.filter((p) => Number(p.CurrentStock) > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((p) =>
        p.ItemName?.toString().toLowerCase().includes(q) ||
        p.ItemUPC?.toString().includes(q)
      );
    }
    const lo = parseFloat(minPrice), hi = parseFloat(maxPrice);
    if (!isNaN(lo)) r = r.filter((p) => Number(p.Price) >= lo);
    if (!isNaN(hi)) r = r.filter((p) => Number(p.Price) <= hi);

    return [...r].sort((a, b) => {
      if (sort === "price_asc")  return Number(a.Price) - Number(b.Price);
      if (sort === "price_desc") return Number(b.Price) - Number(a.Price);
      if (sort === "stock_desc") return Number(b.CurrentStock) - Number(a.CurrentStock);
      return (a.ItemName?.toString() ?? "").localeCompare(b.ItemName?.toString() ?? "");
    });
  }, [products, dept, inStockOnly, search, sort, minPrice, maxPrice]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || dept !== "ALL" || inStockOnly || sort !== "name" || minPrice || maxPrice;

  function resetAll() {
    setSearch(""); setDept("ALL"); setInStockOnly(false);
    setSort("name"); setMinPrice(""); setMaxPrice(""); setPage(1);
  }

  function scrollTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }

  // Department counts for sidebar
  const deptCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.Department, (map.get(p.Department) ?? 0) + 1);
    return map;
  }, [products]);

  const SidebarFilters = () => (
    <aside className="w-full space-y-0">
      {/* Department */}
      <FilterSection title="Category">
        <ul className="space-y-0.5">
          {[{ key: "ALL", label: "All Categories", count: products.length }, ...departments.map((d) => ({
            key: d,
            label: DEPT_META[d]?.label ?? d,
            count: deptCounts.get(d) ?? 0,
          }))].map(({ key, label, count }) => (
            <li key={key}>
              <button
                onClick={() => { setDept(key); scrollTop(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                  dept === key
                    ? "bg-amber-50 dark:bg-gold/10 text-amber-700 dark:text-yellow-400 font-semibold border border-amber-200 dark:border-gold/20"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  {key !== "ALL" && <span className="text-xs">{DEPT_META[key]?.icon}</span>}
                  {label}
                </span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${dept === key ? "bg-amber-100 dark:bg-yellow-400/20 text-amber-700 dark:text-yellow-400" : "bg-stone-100 dark:bg-stone-800 text-stone-500"}`}>
                  {count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">Min ($)</label>
              <input
                type="number" min="0" placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 dark:focus:border-yellow-500 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">Max ($)</label>
              <input
                type="number" min="0" placeholder="∞"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 dark:focus:border-yellow-500 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 outline-none transition-colors"
              />
            </div>
          </div>
          {/* Quick price presets */}
          <div className="flex flex-wrap gap-1.5">
            {[["Under $15","","15"], ["$15–$30","15","30"], ["$30–$60","30","60"], ["$60+","60",""]].map(([lbl, mn, mx]) => (
              <button
                key={lbl}
                onClick={() => { setMinPrice(mn); setMaxPrice(mx); }}
                className={`text-[11px] px-2 py-1 rounded-full border transition-all cursor-pointer ${
                  minPrice === mn && maxPrice === mx
                    ? "bg-amber-50 dark:bg-yellow-500/10 border-amber-300 dark:border-yellow-500/40 text-amber-700 dark:text-yellow-400"
                    : "border-stone-200 dark:border-stone-700 text-stone-500 hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setInStockOnly((v) => !v)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${inStockOnly ? "bg-yellow-500" : "bg-stone-200 dark:bg-stone-700"}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${inStockOnly ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-stone-600 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">In stock only</span>
        </label>
      </FilterSection>

      {hasFilters && (
        <div className="pt-3">
          <button
            onClick={resetAll}
            className="w-full flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 border border-stone-200 dark:border-stone-700 hover:border-red-300 dark:hover:border-red-500/40 rounded-lg py-2 transition-all cursor-pointer"
          >
            <X size={13} /> Clear all filters
          </button>
        </div>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0C0A09]">

      {/* ── Page header ── */}
      <div className="border-b border-stone-200 dark:border-stone-800/60 bg-white/80 dark:bg-stone-900/40 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-stone-900 dark:text-white">Browse Products</h1>
              <p className="text-stone-500 text-sm mt-0.5">
                {products.length.toLocaleString()} products across {departments.length} categories
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-80 lg:w-96">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search spirits, beer, wine…"
                className="w-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-amber-500 dark:focus:border-yellow-600/60 rounded-xl pl-10 pr-9 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 outline-none transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-white transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 lg:gap-8">

          {/* ── Left sidebar (desktop) ── */}
          <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="sticky top-20 space-y-1">
              <p className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest px-1 mb-3">
                Filters
              </p>
              <SidebarFilters />
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setSidebarOpen((o) => !o)}
                  className="lg:hidden flex items-center gap-1.5 text-sm bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  <Filter size={14} />
                  Filters
                  {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                </button>

                <span className="text-sm text-stone-500">
                  <span className="text-stone-900 dark:text-stone-200 font-semibold">{filtered.length.toLocaleString()}</span> results
                  {dept !== "ALL" && <span className="text-amber-600 dark:text-yellow-500 ml-1">in {DEPT_META[dept]?.label ?? dept}</span>}
                </span>

                {hasFilters && (
                  <button onClick={resetAll} className="text-xs text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer">
                    <X size={11} /> Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 shadow-sm">
                  <ArrowUpDown size={12} className="text-stone-400 dark:text-stone-500" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-transparent text-xs text-stone-700 dark:text-stone-300 outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* View toggle */}
                <div className="flex items-center bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setView("grid")}
                    className={`p-2 transition-colors cursor-pointer ${view === "grid" ? "bg-yellow-500/15 text-amber-600 dark:text-yellow-400" : "text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}
                  >
                    <Grid3X3 size={14} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-2 transition-colors cursor-pointer ${view === "list" ? "bg-yellow-500/15 text-amber-600 dark:text-yellow-400" : "text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}
                  >
                    <LayoutList size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile filter drawer */}
            {sidebarOpen && (
              <div className="lg:hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">Filters</p>
                  <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <SidebarFilters />
              </div>
            )}

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2">
                {dept !== "ALL" && (
                  <span className="flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-yellow-500/10 border border-amber-200 dark:border-yellow-500/25 text-amber-700 dark:text-yellow-400 px-3 py-1 rounded-full">
                    {DEPT_META[dept]?.icon} {DEPT_META[dept]?.label ?? dept}
                    <button onClick={() => setDept("ALL")} className="hover:text-amber-900 dark:hover:text-yellow-200 cursor-pointer"><X size={10} /></button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="flex items-center gap-1.5 text-xs bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                    In stock only
                    <button onClick={() => setInStockOnly(false)} className="hover:text-green-900 dark:hover:text-green-200 cursor-pointer"><X size={10} /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
                    ${minPrice || "0"} – ${maxPrice || "∞"}
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="hover:text-blue-900 dark:hover:text-blue-200 cursor-pointer"><X size={10} /></button>
                  </span>
                )}
                {search && (
                  <span className="flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-stone-700/60 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 px-3 py-1 rounded-full">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => setSearch("")} className="hover:text-stone-900 dark:hover:text-white cursor-pointer"><X size={10} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Product grid / list */}
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <Package size={28} className="text-stone-400 dark:text-stone-600" />
                </div>
                <div className="text-center">
                  <p className="text-stone-700 dark:text-stone-300 font-semibold mb-1">No products found</p>
                  <p className="text-stone-500 dark:text-stone-600 text-sm">Try adjusting your filters</p>
                </div>
                <button
                  onClick={resetAll}
                  className="text-sm text-amber-600 dark:text-yellow-500 hover:text-amber-500 dark:hover:text-yellow-400 border border-amber-300 dark:border-yellow-500/30 hover:border-amber-400 dark:hover:border-yellow-500/60 px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {paginated.map((p) => (
                  <ProductCard key={p.ItemUPC} product={p} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {paginated.map((p) => (
                  <ProductRow key={p.ItemUPC} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
                <p className="text-sm text-stone-500">
                  Page <span className="text-stone-700 dark:text-stone-300 font-medium">{page}</span> of {totalPages}
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => { setPage((p) => p - 1); scrollTop(); }}
                    className="px-4 py-2 rounded-xl text-sm bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 7) p = i + 1;
                    else if (page <= 4) p = i + 1;
                    else if (page >= totalPages - 3) p = totalPages - 6 + i;
                    else p = page - 3 + i;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => { setPage(p); scrollTop(); }}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          p === page
                            ? "bg-yellow-500 text-stone-900 font-bold shadow-lg shadow-yellow-500/20"
                            : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    disabled={page === totalPages}
                    onClick={() => { setPage((p) => p + 1); scrollTop(); }}
                    className="px-4 py-2 rounded-xl text-sm bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
