"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye } from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/context/CartContext";

type ProductWithVariants = Product & { _variantCount?: number };

// Light-mode image area gradients
const DEPT_GRADIENT_LIGHT: Record<string, string> = {
  BEER:      "from-amber-50 via-amber-100/60 to-stone-50",
  Wines:     "from-purple-50 via-purple-100/60 to-stone-50",
  WINE:      "from-purple-50 via-purple-100/60 to-stone-50",
  LIQUOR:    "from-blue-50 via-blue-100/60 to-stone-50",
  CBD:       "from-green-50 via-green-100/60 to-stone-50",
  CIGARS:    "from-orange-50 via-orange-100/60 to-stone-50",
  Cigarette: "from-stone-100 via-stone-200/60 to-stone-50",
  Soda:      "from-cyan-50 via-cyan-100/60 to-stone-50",
  MIXERS:    "from-teal-50 via-teal-100/60 to-stone-50",
};

// Dark-mode image area gradients
const DEPT_GRADIENT_DARK: Record<string, string> = {
  BEER:      "dark:from-amber-950/80 dark:via-amber-900/40 dark:to-stone-900",
  Wines:     "dark:from-purple-950/80 dark:via-purple-900/40 dark:to-stone-900",
  WINE:      "dark:from-purple-950/80 dark:via-purple-900/40 dark:to-stone-900",
  LIQUOR:    "dark:from-blue-950/80 dark:via-blue-900/40 dark:to-stone-900",
  CBD:       "dark:from-green-950/80 dark:via-green-900/40 dark:to-stone-900",
  CIGARS:    "dark:from-orange-950/80 dark:via-orange-900/40 dark:to-stone-900",
  Cigarette: "dark:from-stone-800/80 dark:via-stone-900/40 dark:to-stone-900",
  Soda:      "dark:from-cyan-950/80 dark:via-cyan-900/40 dark:to-stone-900",
  MIXERS:    "dark:from-teal-950/80 dark:via-teal-900/40 dark:to-stone-900",
};

// Light badge styles
const DEPT_BADGE_LIGHT: Record<string, string> = {
  BEER:      "bg-amber-100 text-amber-700 border-amber-200",
  Wines:     "bg-purple-100 text-purple-700 border-purple-200",
  WINE:      "bg-purple-100 text-purple-700 border-purple-200",
  LIQUOR:    "bg-blue-100 text-blue-700 border-blue-200",
  CBD:       "bg-green-100 text-green-700 border-green-200",
  CIGARS:    "bg-orange-100 text-orange-700 border-orange-200",
  Cigarette: "bg-stone-100 text-stone-600 border-stone-300",
  Soda:      "bg-cyan-100 text-cyan-700 border-cyan-200",
  MIXERS:    "bg-teal-100 text-teal-700 border-teal-200",
};

// Dark badge styles
const DEPT_BADGE_DARK: Record<string, string> = {
  BEER:      "dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Wines:     "dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  WINE:      "dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  LIQUOR:    "dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  CBD:       "dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  CIGARS:    "dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  Cigarette: "dark:bg-stone-700/40 dark:text-stone-400 dark:border-stone-600/30",
  Soda:      "dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20",
  MIXERS:    "dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
};

const DEPT_EMOJI: Record<string, string> = {
  BEER: "🍺", Wines: "🍷", WINE: "🍷", LIQUOR: "🥃",
  CBD: "🌿", CIGARS: "💨", Cigarette: "🚬", Soda: "🥤",
  MIXERS: "🍹", TOBACCO: "🌱", KEG: "🛢️",
};

export default function ProductCard({ product }: { product: ProductWithVariants }) {
  const { dispatch }  = useCart();
  const stock         = Number(product.CurrentStock);
  const inStock       = stock > 0;
  const lowStock      = inStock && stock <= 5;
  const imageUrl      = getProductImage(product.ItemUPC);
  const variantCount  = product._variantCount ?? 1;
  const dept          = product.Department;

  const gradientLight = DEPT_GRADIENT_LIGHT[dept] ?? "from-stone-50 to-stone-100";
  const gradientDark  = DEPT_GRADIENT_DARK[dept]  ?? "dark:from-stone-800/80 dark:via-stone-900/40 dark:to-stone-900";
  const badgeLight    = DEPT_BADGE_LIGHT[dept]    ?? "bg-stone-100 text-stone-600 border-stone-300";
  const badgeDark     = DEPT_BADGE_DARK[dept]     ?? "dark:bg-stone-700/40 dark:text-stone-400 dark:border-stone-600/30";
  const emoji         = DEPT_EMOJI[dept]          ?? "📦";

  return (
    <div className="group relative flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 rounded-2xl overflow-hidden transition-all duration-300 hover:border-stone-300 dark:hover:border-stone-600/50 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-stone-200/60 dark:hover:shadow-black/60 hover:-translate-y-0.5">

      {/* Image area */}
      <Link href={`/shop/${encodeURIComponent(product.ItemUPC)}`} className="block relative overflow-hidden">
        <div className={`relative h-44 bg-gradient-to-b ${gradientLight} ${gradientDark} flex items-center justify-center`}>

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.ItemName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-6xl group-hover:scale-110 transition-transform duration-400 select-none drop-shadow-lg">
              {emoji}
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <div className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-white/60 dark:border-white/20 rounded-xl p-2">
                <Eye size={14} className="text-stone-700 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
            {variantCount > 1 ? (
              <span className="text-[10px] font-bold bg-white/80 dark:bg-black/60 backdrop-blur-sm text-stone-700 dark:text-white border border-stone-200/60 dark:border-white/10 px-2 py-0.5 rounded-full">
                {variantCount} sizes
              </span>
            ) : <span />}

            {lowStock && (
              <span className="text-[9px] font-bold bg-orange-100 dark:bg-orange-900/80 backdrop-blur-sm text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30 px-2 py-0.5 rounded-full">
                Only {stock} left
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/65 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-xs font-semibold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-700/40 px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 gap-2.5">

        {/* Badge */}
        <span className={`self-start text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeLight} ${badgeDark}`}>
          {product.Department}
        </span>

        {/* Name */}
        <Link href={`/shop/${encodeURIComponent(product.ItemUPC)}`} className="flex-1">
          <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-yellow-400 transition-colors duration-200">
            {product.ItemName}
          </h3>
        </Link>

        {/* Size */}
        {product.Size && product.Size !== "N" && (
          <p className="text-[11px] text-stone-400 dark:text-stone-600">{product.Size}</p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800/60 mt-auto">
          <div>
            {variantCount > 1 && (
              <p className="text-[9px] text-stone-400 dark:text-stone-600 leading-none mb-0.5 uppercase tracking-wider">from</p>
            )}
            <span className="text-base font-bold text-amber-600 dark:text-yellow-400">
              ${Number(product.Price).toFixed(2)}
            </span>
          </div>

          <button
            disabled={!inStock}
            onClick={(e) => { e.preventDefault(); dispatch({ type: "ADD", product }); }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
              inStock
                ? "bg-yellow-500 hover:bg-yellow-400 text-stone-900 hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-105 active:scale-95"
                : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={12} />
            {inStock ? "Add" : "N/A"}
          </button>
        </div>
      </div>
    </div>
  );
}
