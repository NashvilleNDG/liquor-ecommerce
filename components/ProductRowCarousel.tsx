"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/kanji-api";

type ProductWithVariants = Product & { _variantCount?: number; _imageUrl?: string | null };

export default function ProductRowCarousel({ products }: { products: ProductWithVariants[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 600 : -600, behavior: "smooth" });
  };

  return (
    <div className="relative group/row">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
          w-9 h-9 rounded-full bg-white border border-stone-200 shadow-lg
          flex items-center justify-center text-stone-700
          hover:bg-crimson hover:text-white hover:border-crimson
          transition-all duration-200
          opacity-0 group-hover/row:opacity-100"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        {products.map((p) => (
          <div key={p.ItemUPC} className="flex-shrink-0 w-44 sm:w-48">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
          w-9 h-9 rounded-full bg-white border border-stone-200 shadow-lg
          flex items-center justify-center text-stone-700
          hover:bg-crimson hover:text-white hover:border-crimson
          transition-all duration-200
          opacity-0 group-hover/row:opacity-100"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
