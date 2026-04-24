"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/context/CartContext";

type ProductWithVariants = Product & { _variantCount?: number };

const DEPT_COLORS_LIGHT: Record<string, string> = {
  BEER:      "text-amber-700 bg-amber-100 border-amber-200",
  Wines:     "text-purple-700 bg-purple-100 border-purple-200",
  WINE:      "text-purple-700 bg-purple-100 border-purple-200",
  LIQUOR:    "text-blue-700 bg-blue-100 border-blue-200",
  CBD:       "text-green-700 bg-green-100 border-green-200",
  CIGARS:    "text-orange-700 bg-orange-100 border-orange-200",
  Cigarette: "text-stone-600 bg-stone-100 border-stone-300",
  Soda:      "text-cyan-700 bg-cyan-100 border-cyan-200",
  MIXERS:    "text-teal-700 bg-teal-100 border-teal-200",
};

const DEPT_COLORS_DARK: Record<string, string> = {
  BEER:      "dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  Wines:     "dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20",
  WINE:      "dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20",
  LIQUOR:    "dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  CBD:       "dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
  CIGARS:    "dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20",
  Cigarette: "dark:text-stone-400 dark:bg-stone-500/10 dark:border-stone-500/20",
  Soda:      "dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20",
  MIXERS:    "dark:text-teal-400 dark:bg-teal-500/10 dark:border-teal-500/20",
};

const DEPT_EMOJI: Record<string, string> = {
  BEER: "🍺", Wines: "🍷", WINE: "🍷", LIQUOR: "🥃",
  CBD: "🌿", CIGARS: "💨", Cigarette: "🚬", Soda: "🥤", MIXERS: "🍹",
};

export default function ProductRow({ product }: { product: ProductWithVariants }) {
  const { dispatch } = useCart();
  const stock        = Number(product.CurrentStock);
  const inStock      = stock > 0;
  const lowStock     = inStock && stock <= 5;
  const imageUrl     = getProductImage(product.ItemUPC);
  const variantCount = product._variantCount ?? 1;
  const dept         = product.Department;
  const deptLight    = DEPT_COLORS_LIGHT[dept] ?? "text-stone-600 bg-stone-100 border-stone-300";
  const deptDark     = DEPT_COLORS_DARK[dept]  ?? "dark:text-stone-400 dark:bg-stone-500/10 dark:border-stone-500/20";
  const emoji        = DEPT_EMOJI[dept] ?? "📦";

  return (
    <div className="group flex items-center gap-4 bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-600/60 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-2xl px-4 py-3 transition-all duration-200 cursor-pointer hover:shadow-md dark:hover:shadow-none">

      {/* Image */}
      <Link href={`/shop/${encodeURIComponent(product.ItemUPC)}`} className="flex-shrink-0">
        <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden relative">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.ItemName} fill sizes="56px" className="object-contain p-1.5" />
          ) : (
            <span className="text-2xl">{emoji}</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${deptLight} ${deptDark}`}>
            {product.Department}
          </span>
          {variantCount > 1 && (
            <span className="text-[10px] text-stone-400 dark:text-stone-500">{variantCount} sizes</span>
          )}
        </div>
        <Link href={`/shop/${encodeURIComponent(product.ItemUPC)}`}>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-yellow-400 transition-colors truncate">
            {product.ItemName}
          </p>
        </Link>
        <p className="text-xs text-stone-400 dark:text-stone-600 mt-0.5">{product.Size} · UPC {product.ItemUPC}</p>
      </div>

      {/* Stock */}
      <div className="flex-shrink-0 text-center hidden sm:block w-20">
        {!inStock ? (
          <span className="text-xs text-red-500 dark:text-red-400 font-medium">Out of stock</span>
        ) : lowStock ? (
          <span className="text-xs text-orange-500 dark:text-orange-400 font-medium">Only {stock} left</span>
        ) : (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">{stock} in stock</span>
        )}
      </div>

      {/* Price */}
      <div className="flex-shrink-0 text-right w-20">
        {variantCount > 1 && <p className="text-[10px] text-stone-400 dark:text-stone-600 leading-none mb-0.5">from</p>}
        <p className="text-base font-bold text-amber-600 dark:text-yellow-400">${Number(product.Price).toFixed(2)}</p>
      </div>

      {/* Add to cart */}
      <button
        disabled={!inStock}
        onClick={() => dispatch({ type: "ADD", product })}
        className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
          inStock
            ? "bg-yellow-500 hover:bg-yellow-400 text-stone-900 hover:shadow-lg hover:shadow-yellow-500/20"
            : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed"
        }`}
      >
        <ShoppingCart size={13} />
        {inStock ? "Add" : "N/A"}
      </button>
    </div>
  );
}
