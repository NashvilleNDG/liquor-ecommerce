"use client";

import { useState } from "react";
import type { Product } from "@/lib/kanji-api";
import { Download, Search } from "lucide-react";

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
  const [dept, setDept] = useState("ALL");

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
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or UPC…"
            className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
          />
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-medium text-gray-300 hover:text-amber-400 transition-all"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Dept filter */}
      <div className="flex flex-wrap gap-2">
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => setDept(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              dept === d ? "bg-yellow-500 text-stone-900" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="text-xs text-stone-600">{filtered.length} products</p>

      {/* Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-800 text-stone-500 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Size</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {filtered.map((p) => {
              const stock = Number(p.CurrentStock);
              const status =
                stock <= 2 ? { label: "Critical", cls: "bg-red-900/70 text-red-400" } :
                stock <= 5 ? { label: "Warning",  cls: "bg-orange-900/70 text-orange-400" } :
                             { label: "Notice",   cls: "bg-yellow-900/70 text-yellow-400" };
              return (
                <tr key={p.ItemUPC} className="hover:bg-stone-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-100 max-w-xs truncate">{p.ItemName}</p>
                    <p className="text-[10px] text-stone-600 font-mono">{p.ItemUPC}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{p.Department}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{p.Size}</td>
                  <td className="px-4 py-3 text-right text-amber-400 font-semibold">${Number(p.Price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-stone-600">No products match your filter.</div>
        )}
      </div>
    </div>
  );
}
