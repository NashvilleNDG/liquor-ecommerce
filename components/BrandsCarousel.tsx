"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Brand {
  name: string;
  count: number;
  img: string;
}

export default function BrandsCarousel({ brands }: { brands: Brand[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 480 : -480, behavior: "smooth" });
  };

  return (
    <div className="relative group/carousel">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
          w-9 h-9 rounded-full bg-white border border-stone-200 shadow-lg
          flex items-center justify-center text-stone-700
          hover:bg-crimson hover:text-white hover:border-crimson
          transition-all duration-200
          opacity-0 group-hover/carousel:opacity-100"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        {brands.map(({ name, count, img }) => (
          <Link
            key={name}
            href={`/shop?q=${encodeURIComponent(name)}`}
            className="flex-shrink-0 group relative w-44 h-28 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Background image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/90 transition-all duration-300" />
            {/* Crimson accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-crimson scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            {/* Text */}
            <div className="absolute inset-0 flex flex-col justify-end p-3">
              <p className="text-white font-bold text-sm leading-tight drop-shadow">{name}</p>
              <p className="text-white/60 text-[10px] mt-0.5">{count} Products</p>
            </div>
          </Link>
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
          opacity-0 group-hover/carousel:opacity-100"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
