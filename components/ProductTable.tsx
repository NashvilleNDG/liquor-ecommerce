"use client";

import { useState, useMemo } from "react";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, Download,
  Star, EyeOff, Pencil, ImageIcon, Tag,
} from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import type { OverridesMap, ProductOverride } from "@/lib/product-overrides";
import DepartmentBadge from "./DepartmentBadge";
import ProductEditPanel from "./ProductEditPanel";

function exportCSV(products: Product[], overrides: OverridesMap) {
  const headers = ["UPC", "Name", "Department", "Size", "Pack", "Stock", "POS Price", "Kanji Online Price", "Override Price", "Featured", "Hidden", "Label", "Image"];
  const rows = products.map((p) => {
    const ov = overrides[p.ItemUPC] ?? {};
    return [
      p.ItemUPC,
      `"${p.ItemName?.toString().replace(/"/g, '""')}"`,
      p.Department,
      p.Size,
      p.Pack,
      p.CurrentStock,
      Number(p.Price).toFixed(2),
      Number(p.OnlinePrice).toFixed(2),
      ov.onlinePrice?.toFixed(2) ?? "",
      ov.featured ? "Yes" : "",
      ov.hidden   ? "Yes" : "",
      ov.label    ?? "",
      ov.imageUrl ?? "",
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

type SortKey      = keyof Product;
type SortDir      = "asc" | "desc";
type StockFilter  = "all" | "in" | "out" | "low";
type OvFilter     = "all" | "featured" | "hidden" | "no-image" | "labeled";

interface Props {
  products:         Product[];
  initialOverrides: OverridesMap;
}

export default function ProductTable({ products, initialOverrides }: Props) {
  const [overrides,   setOverrides]   = useState<OverridesMap>(initialOverrides);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [search,      setSearch]      = useState("");
  const [dept,        setDept]        = useState("ALL");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [ovFilter,    setOvFilter]    = useState<OvFilter>("all");
  const [sortKey,     setSortKey]     = useState<SortKey>("ItemName");
  const [sortDir,     setSortDir]     = useState<SortDir>("asc");
  const [page,        setPage]        = useState(1);
  const PAGE_SIZE = 25;

  const departments = useMemo(() => {
    const set = new Set(products.map((p) => p.Department));
    return ["ALL", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let r = products;
    if (dept !== "ALL")           r = r.filter((p) => p.Department === dept);
    if (stockFilter === "in")     r = r.filter((p) => Number(p.CurrentStock) > 5);
    if (stockFilter === "out")    r = r.filter((p) => Number(p.CurrentStock) <= 0);
    if (stockFilter === "low")    r = r.filter((p) => Number(p.CurrentStock) > 0 && Number(p.CurrentStock) <= 5);
    if (ovFilter === "featured")  r = r.filter((p) => overrides[p.ItemUPC]?.featured);
    if (ovFilter === "hidden")    r = r.filter((p) => overrides[p.ItemUPC]?.hidden);
    if (ovFilter === "no-image")  r = r.filter((p) => !overrides[p.ItemUPC]?.imageUrl);
    if (ovFilter === "labeled")   r = r.filter((p) => !!overrides[p.ItemUPC]?.label);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (p) =>
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
  }, [products, dept, search, sortKey, sortDir, stockFilter, ovFilter, overrides]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={12} className="inline ml-1 text-stone-300" />;
    return sortDir === "asc"
      ? <ArrowUp   size={12} className="inline ml-1 text-amber-500" />
      : <ArrowDown size={12} className="inline ml-1 text-amber-500" />;
  }

  function handleSaved(upc: string, patch: ProductOverride) {
    setOverrides((prev) => {
      const next = { ...prev };
      if (Object.keys(patch).length === 0) delete next[upc];
      else next[upc] = patch;
      return next;
    });
  }

  const editOverride = editProduct ? (overrides[editProduct.ItemUPC] ?? {}) : {};

  return (
    <div className="space-y-4">

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, UPC, or department…"
            className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
          />
        </div>
        <button
          onClick={() => exportCSV(filtered, overrides)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-700 rounded-lg text-xs font-semibold text-white transition-all whitespace-nowrap"
        >
          <Download size={14} /> Export CSV ({filtered.length})
        </button>
      </div>

      {/* Stock filter */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: "all", label: "All Stock" },
          { id: "in",  label: "In Stock" },
          { id: "low", label: "⚠ Low (≤5)" },
          { id: "out", label: "Out of Stock" },
        ] as { id: StockFilter; label: string }[]).map(({ id, label }) => (
          <button key={id} onClick={() => { setStockFilter(id); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              stockFilter === id ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
            }`}
          >{label}</button>
        ))}
      </div>

      {/* Override filter */}
      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs text-stone-400 font-medium mr-1">Show:</span>
        {([
          { id: "all",      label: "All" },
          { id: "featured", label: "⭐ Featured" },
          { id: "hidden",   label: "🙈 Hidden" },
          { id: "no-image", label: "📷 No Image" },
          { id: "labeled",  label: "🏷 Has Label" },
        ] as { id: OvFilter; label: string }[]).map(({ id, label }) => (
          <button key={id} onClick={() => { setOvFilter(id); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              ovFilter === id ? "bg-amber-600 text-white border-amber-600" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
            }`}
          >{label}</button>
        ))}
      </div>

      {/* Dept filter */}
      <div className="flex flex-wrap gap-2">
        {departments.map((d) => (
          <button key={d} onClick={() => { setDept(d); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              dept === d ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
            }`}
          >{d}</button>
        ))}
      </div>

      <p className="text-xs text-stone-400">{filtered.length.toLocaleString()} products</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {([ ["ItemName","Product"], ["Department","Dept"], ["Size","Size"], ["CurrentStock","Stock"], ["Price","POS $"], ["OnlinePrice","Online $"] ] as [SortKey,string][]).map(([key, label]) => (
                <th key={key} onClick={() => handleSort(key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider cursor-pointer hover:text-stone-900 select-none whitespace-nowrap"
                >
                  {label}<SortIcon col={key} />
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Overrides</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paginated.map((p, i) => {
              const stock   = Number(p.CurrentStock);
              const inStock = stock > 0;
              const ov      = overrides[p.ItemUPC];
              return (
                <tr key={`${p.ItemUPC}-${i}`}
                  className={`hover:bg-stone-50 transition-colors ${ov?.hidden ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-semibold text-stone-900 truncate">{p.ItemName}</p>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">{p.ItemUPC}</p>
                  </td>
                  <td className="px-4 py-3"><DepartmentBadge dept={p.Department} /></td>
                  <td className="px-4 py-3 text-stone-500 text-xs whitespace-nowrap">{p.Size}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${!inStock ? "text-red-500" : stock <= 5 ? "text-amber-500" : "text-green-600"}`}>
                      {stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-sm">${Number(p.Price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">
                    {ov?.onlinePrice
                      ? <span className="text-amber-600 font-bold">${ov.onlinePrice.toFixed(2)}</span>
                      : <span className="text-stone-500">${Number(p.OnlinePrice).toFixed(2)}</span>
                    }
                  </td>

                  {/* Override badges */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 min-w-[120px]">
                      {ov?.featured && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          <Star size={9} /> Featured
                        </span>
                      )}
                      {ov?.hidden && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">
                          <EyeOff size={9} /> Hidden
                        </span>
                      )}
                      {ov?.imageUrl && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full">
                          <ImageIcon size={9} /> Image
                        </span>
                      )}
                      {ov?.label && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full">
                          <Tag size={9} /> {ov.label}
                        </span>
                      )}
                      {!ov && <span className="text-[10px] text-stone-300">—</span>}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditProduct(p)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="text-center py-16 text-stone-400 text-sm">No products match your filters.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-stone-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:opacity-30 hover:bg-stone-50 transition-colors"
            >Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm disabled:opacity-30 hover:bg-stone-700 transition-colors"
            >Next</button>
          </div>
        </div>
      )}

      <ProductEditPanel
        product={editProduct}
        override={editOverride}
        onClose={() => setEditProduct(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
