"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Heart } from "lucide-react";
import type { Product } from "@/lib/kanji-api";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import QuickViewModal from "@/components/QuickViewModal";

type ProductWithVariants = Product & { _variantCount?: number; _imageUrl?: string | null };

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{rating.toFixed(1)}</span>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={11}
            className={
              i < full
                ? "text-crimson fill-crimson"
                : i === full && half
                ? "text-crimson fill-crimson/30"
                : "text-stone-200 fill-stone-200"
            }
          />
        ))}
      </div>
      <span className="text-[10px] text-stone-400">({count})</span>
    </div>
  );
}

export default function ProductCard({ product }: { product: ProductWithVariants }) {
  const { dispatch } = useCart();
  const { dispatch: wDispatch, isWishlisted } = useWishlist();
  const [showQuickView, setShowQuickView] = useState(false);
  const wishlisted = isWishlisted(product.ItemUPC);
  const stock = Number(product.CurrentStock);
  const inStock = stock > 0;
  const lowStock = inStock && stock <= 5;
  const variantCount = product._variantCount ?? 1;

  const [imageUrl, setImageUrl] = useState<string | null>(product._imageUrl ?? null);
  const [rating, setRating] = useState<{ rating: number; count: number } | null>(null);


  // Stable fallback rating from UPC hash
  const fallbackRating = (() => {
    let hash = 0;
    for (let i = 0; i < product.ItemUPC.length; i++)
      hash = (hash * 31 + product.ItemUPC.charCodeAt(i)) >>> 0;
    return { rating: Math.round((3.5 + (hash % 15) / 10) * 10) / 10, count: 10 + (hash % 491) };
  })();

  const displayRating = rating ?? fallbackRating;

  const DEPT_ICON: Record<string, string> = {
    "BEER": "🍺", "Wines": "🍷", "WINE": "🍷",
    "LIQUOR": "🥃", "MIXERS": "🍹", "Soda": "🥤",
  };
  const deptIcon = DEPT_ICON[product.Department] ?? "🍾";

  return (
    <div className="group relative flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-stone-300 dark:hover:border-stone-700 hover:-translate-y-0.5">

      {/* Image area */}
      <Link href={`/shop/${encodeURIComponent(product.ItemUPC)}`} className="block relative overflow-hidden bg-stone-50 dark:bg-stone-800/50">
        <div className="relative h-44 flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.ItemName}
              fill
              sizes="(max-width: 640px) 50vw, 200px"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 w-full h-full bg-stone-50">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none">{deptIcon}</span>
              <span className="text-[10px] text-stone-300 font-medium uppercase tracking-widest">{product.Department}</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {variantCount > 1 ? (
              <span className="text-[9px] font-bold bg-stone-800/80 text-white px-2 py-0.5 rounded-full">
                {variantCount} Options
              </span>
            ) : <span />}
            <div className="flex flex-col items-end gap-1">
              {lowStock && (
                <span className="text-[9px] font-bold bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                  Only {stock} left
                </span>
              )}
              <button
                onClick={(e) => { e.preventDefault(); wDispatch({ type: "TOGGLE", product }); }}
                className={`w-6 h-6 rounded-full flex items-center justify-center shadow transition-colors ${wishlisted ? "bg-crimson text-white" : "bg-white/90 text-stone-400 hover:text-crimson"}`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={11} className={wishlisted ? "fill-white" : ""} />
              </button>
            </div>
          </div>

          {!inStock && (
            <div className="absolute inset-0 bg-white/75 dark:bg-stone-900/75 flex items-center justify-center">
              <span className="text-xs font-semibold text-stone-500 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          <button
            onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-stone-800 text-[10px] font-bold px-3 py-1 rounded-full shadow border border-stone-200 whitespace-nowrap"
          >
            Quick View
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <StarRating rating={displayRating.rating} count={displayRating.count} />

        <p className="text-[10px] text-stone-400 leading-none">
          {variantCount > 1 ? `${variantCount} Options` : product.Size || ""}
          {product.Department && <span className="text-stone-300"> · {product.Department}</span>}
        </p>

        <Link href={`/shop/${encodeURIComponent(product.ItemUPC)}`} className="flex-1">
          <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-crimson transition-colors">
            {product.ItemName}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-stone-100 dark:border-stone-800">
          <div>
            {variantCount > 1 && (
              <p className="text-[9px] text-stone-400 uppercase tracking-wider leading-none mb-0.5">from</p>
            )}
            <span className="text-base font-bold text-stone-900 dark:text-stone-100">
              ${Number(product.Price).toFixed(2)}
            </span>
          </div>

          <button
            disabled={!inStock}
            onClick={(e) => { e.preventDefault(); dispatch({ type: "ADD", product }); }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              inStock
                ? "bg-crimson hover:bg-crimson/90 text-white hover:shadow-md active:scale-95 cursor-pointer"
                : "bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={12} />
            {inStock ? "Add" : "N/A"}
          </button>
        </div>
      </div>

      <QuickViewModal product={showQuickView ? product : null} onClose={() => setShowQuickView(false)} />
    </div>
  );
}
