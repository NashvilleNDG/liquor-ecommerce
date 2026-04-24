"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchResult {
  upc: string;
  name: string;
  dept: string;
  price: number;
}

export default function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: SearchResult[] = await res.json();
      setResults(data);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetchResults(val.trim());
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setOpen(false);
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleResultClick = (upc: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/shop/${encodeURIComponent(upc)}`);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input row */}
      <div className="flex items-center bg-white border border-stone-300 rounded-full px-4 py-2 gap-2 shadow-sm">
        <Search size={15} className="text-stone-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search spirits, beer, wine..."
          className="flex-1 bg-transparent text-stone-800 placeholder-stone-400 text-sm outline-none"
        />
        {loading && (
          <span className="w-4 h-4 border-2 border-crimson border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
        {query && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="text-stone-400 hover:text-stone-600 flex-shrink-0 transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden z-50">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-stone-400 text-center">No products found</p>
          ) : (
            results.map((item) => (
              <div
                key={item.upc}
                onClick={() => handleResultClick(item.upc)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-stone-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{item.dept}</p>
                </div>
                <span className="text-crimson font-bold text-xs flex-shrink-0">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
