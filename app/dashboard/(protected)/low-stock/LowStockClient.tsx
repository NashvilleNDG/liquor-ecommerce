"use client";

import { useState } from "react";
import type { Product } from "@/lib/kanji-api";
import { Download, Search, X } from "lucide-react";

function exportCSV(products: Product[]) {
  const headers = ["UPC", "Name", "Department", "Size", "Stock", "Price"];
  const rows = products.map((p) => [
    p.ItemUPC,
    `"${p.ItemName?.toString().replace(/"/g, '""')}"`,
    p.Department,
    p.Size,
    p.CurrentStock,
    Number(p.Price).toFixed(2),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `low-stock-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LowStockClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [dept, setDept]     = useState("ALL");

  const departments = ["ALL", ...Array.from(new Set(products.map((p) => p.Department))).sort()];

  const filtered = products.filter((p) => {
    if (dept !== "ALL" && p.Department !== dept) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.ItemName?.toString().toLowerCase().includes(q) || p.ItemUPC?.toString().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or UPC…"
            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-9 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-700 rounded-xl text-xs font-semibold text-white transition-all"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Dept filter chips */}
      <div className="flex flex-wrap gap-2">
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => setDept(d)}
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

      <p className="text-xs text-stone-400">{filtered.length} products</p>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Product</th>
              <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Department</th>
              <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Size</th>
              <th className="text-right text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Price</th>
              <th className="text-right text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Stock</th>
              <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((p) => {
              const stock = Number(p.CurrentStock);
              const status =
                stock <= 2 ? { label: "Critical", cls: "bg-stone-900 text-white"        } :
                stock <= 5 ? { label: "Warning",  cls: "bg-amber-100 text-amber-800"    } :
                             { label: "Notice",   cls: "bg-stone-100 text-stone-700"    };
              return (
                <tr key={p.ItemUPC} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-stone-900 max-w-xs truncate">{p.ItemName}</p>
                    <p className="text-[10px] text-stone-400 font-mono">{p.ItemUPC}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs hidden sm:table-cell">{p.Department}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs hidden md:table-cell">{p.Size}</td>
                  <td className="px-4 py-3 text-right font-semibold text-stone-800">${Number(p.Price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-stone-900">{stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-stone-400 text-sm">No products match your filter.</div>
        )}
      </div>
    </div>
  );
}
