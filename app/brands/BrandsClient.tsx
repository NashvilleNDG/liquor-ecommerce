"use client";

import { useState } from "react"; // used in BrandCard
import Link from "next/link";

interface Brand { name: string; count: number; image: string | null; }

const DEPT_ICON: Record<string, string> = {
  BEER: "🍺", Wines: "🍷", WINE: "🍷",
  LIQUOR: "🥃", MIXERS: "🍹", Soda: "🥤",
};

function getInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const ACCENT_COLORS = [
  "bg-red-900",   "bg-stone-700", "bg-amber-800", "bg-emerald-800",
  "bg-indigo-800","bg-purple-800","bg-rose-800",  "bg-teal-800",
  "bg-orange-800","bg-cyan-800",
];

function getAccent(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ACCENT_COLORS[hash % ACCENT_COLORS.length];
}

/* ── Single brand card ── */
function BrandCard({ name, count, image, size = "sm" }: Brand & { size?: "sm" | "lg" }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name);
  const accent = getAccent(name);
  const isLarge = size === "lg";

  const hasImage = image && !imgFailed;

  return (
    <Link
      href={`/brands/${encodeURIComponent(name)}`}
      className={`group bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:border-stone-300 hover:-translate-y-0.5 transition-all duration-200 aspect-[3/4]`}
    >
      {/* Image / placeholder area */}
      <div className={`relative flex-1 flex items-center justify-center overflow-hidden bg-stone-50`}>
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image!}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center gap-1 ${accent}`}>
            <span className={`font-black text-white/90 tracking-tight leading-none select-none ${isLarge ? "text-4xl" : "text-3xl"}`}>
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Brand name + count footer */}
      <div className="px-3 py-2.5 border-t border-stone-100 text-center">
        <p className={`font-bold text-stone-800 leading-snug truncate group-hover:text-crimson transition-colors ${isLarge ? "text-sm" : "text-xs"}`}>
          {name}
        </p>
        <p className={`text-stone-400 mt-0.5 ${isLarge ? "text-xs" : "text-[11px]"}`}>
          {count} Products
        </p>
      </div>
    </Link>
  );
}

export default function BrandsClient({ brands }: { brands: Brand[] }) {
  const featured = brands.slice(0, 10);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* ── Featured Brands ── */}
        <section>
          <h2 className="text-lg font-bold text-stone-800 mb-5">Featured Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {featured.map(b => (
              <BrandCard key={b.name} {...b} size="lg" />
            ))}
          </div>
        </section>

        {/* ── All Brands grid ── */}
        <section>
          <h2 className="text-lg font-bold text-stone-800 mb-5">All Brands ({brands.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {brands.map(b => (
              <BrandCard key={b.name} {...b} size="sm" />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
