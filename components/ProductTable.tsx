"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import DepartmentBadge from "./DepartmentBadge";

function exportCSV(products: Product[]) {
  const headers = ["UPC", "Name", "Department", "Size", "Pack", "Stock", "Price", "Online Price"];
  const rows = products.map((p) => [
    p.ItemUPC,
    `"${p.ItemName?.toString().replace(/"/g, '""')}"`,
    p.Department,
    p.Size,
    p.Pack,
    p.CurrentStock,
    Number(p.Price).toFixed(2),
    Number(p.OnlinePrice).toFixed(2),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type SortKey = keyof Product;
type SortDir = "asc" | "desc";

export default function ProductTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out" | "low">("all");
  const [sortKey, setSortKey] = useState<SortKey>("ItemName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const departments = useMemo(() => {
    const set = new Set(products.map((p) => p.Department));
    return ["ALL", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;

    if (dept !== "ALL") result = result.filter((p) => p.Department === dept);

    if (stockFilter === "in")  result = result.filter((p) => Number(p.CurrentStock) > 5);
    if (stockFilter === "out") result = result.filter((p) => Number(p.CurrentStock) <= 0);
    if (stockFilter === "low") result = result.filter((p) => Number(p.CurrentStock) > 0 && Number(p.CurrentStock) <= 5);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.ItemName?.toString().toLowerCase().includes(q) ||
          p.ItemUPC?.toString().includes(q) ||
          p.Department?.toString().toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, dept, search, sortKey, sortDir, stockFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={12} className="inline ml-1 text-stone-300" />;
    return sortDir === "asc"
      ? <ArrowUp size={12} className="inline ml-1 text-amber-500" />
      : <ArrowDown size={12} className="inline ml-1 text-amber-500" />;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or UPC…"
              className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
          </div>

          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-700 rounded-lg text-xs font-semibold text-white transition-all whitespace-nowrap"
          >
            <Download size={14} />
            Export CSV ({filtered.length})
          </button>
        </div>

        {/* Stock filter */}
        <div className="flex flex-wrap gap-2">
          {([
            { id: "all", label: "All Stock" },
            { id: "in",  label: "✅ In Stock" },
            { id: "low", label: "⚠️ Low Stock (≤5)" },
            { id: "out", label: "❌ Out of Stock" },
          ] as { id: typeof stockFilter; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setStockFilter(id); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                stockFilter === id ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dept filter */}
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => { setDept(d); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                dept === d
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-stone-500">{filtered.length} products found</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {(
                [
                  ["ItemName", "Product"],
                  ["Department", "Dept"],
                  ["Size", "Size"],
                  ["Pack", "Pack"],
                  ["CurrentStock", "Stock"],
                  ["Price", "In-Store"],
                  ["OnlinePrice", "Online"],
                  ["ItemUPC", "UPC"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider cursor-pointer hover:text-stone-900 select-none whitespace-nowrap"
                >
                  {label}
                  <SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paginated.map((p, i) => {
              const inStock = Number(p.CurrentStock) > 0;
              return (
                <tr key={`${p.ItemUPC}-${i}`} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-stone-900 max-w-xs truncate">
                    {p.ItemName}
                  </td>
                  <td className="px-4 py-3">
                    <DepartmentBadge dept={p.Department} />
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{p.Size}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{p.Pack}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${inStock ? "text-green-600" : "text-red-600"}`}>
                      {Number(p.CurrentStock).toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-700 font-medium">${Number(p.Price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-yellow-600 font-semibold">${Number(p.OnlinePrice).toFixed(2)}</td>
                  <td className="px-4 py-3 text-stone-500 font-mono text-xs">{p.ItemUPC}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="text-center py-16 text-stone-500 text-sm">No products match your filter.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-stone-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:opacity-30 hover:bg-stone-50 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm disabled:opacity-30 hover:bg-stone-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
