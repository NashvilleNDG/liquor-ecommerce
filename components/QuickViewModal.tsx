"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X, Star } from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/context/CartContext";

type ProductWithVariants = Product & { _variantCount?: number };

/* Same stable rating logic as ProductCard */
function getRating(upc: string): { rating: number; count: number } {
  let hash = 0;
  for (let i = 0; i < upc.length; i++) hash = (hash * 31 + upc.charCodeAt(i)) >>> 0;
  const rating = 3.5 + (hash % 15) / 10;
  const count  = 10 + (hash % 491);
  return { rating: Math.round(rating * 10) / 10, count };
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-bold text-stone-700">{rating.toFixed(1)}</span>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
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

interface Props {
  product: ProductWithVariants | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: Props) {
  const { dispatch } = useCart();

  if (!product) return null;

  const imageUrl = getProductImage(product.ItemUPC);
  const stock    = Number(product.CurrentStock);
  const inStock  = stock > 0;
  const lowStock = inStock && stock <= 5;
  const { rating, count } = getRating(product.ItemUPC);

  const deptEmoji =
    product.Department === "BEER"
      ? "🍺"
      : product.Department === "Wines" || product.Department === "WINE"
      ? "🍷"
      : product.Department === "LIQUOR"
      ? "🥃"
      : "📦";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Close quick view"
        >
          <X size={20} />
        </button>

        {/* Left: image */}
        <div className="bg-stone-50 flex items-center justify-center min-h-48">
          {imageUrl ? (
            <div className="relative w-full h-64 sm:h-full min-h-48">
              <Image
                src={imageUrl}
                alt={product.ItemName}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-contain p-8"
              />
            </div>
          ) : (
            <span className="text-7xl select-none">{deptEmoji}</span>
          )}
        </div>

        {/* Right: details */}
        <div className="p-6 flex flex-col gap-4">
          {/* Department badge */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-crimson bg-red-50 px-2 py-0.5 rounded-full w-fit">
            {product.Department}
          </span>

          {/* Name */}
          <h2 className="font-bold text-xl text-stone-900 leading-snug">
            {product.ItemName}
          </h2>

          {/* Size */}
          {product.Size && (
            <p className="text-sm text-stone-500">{product.Size}</p>
          )}

          {/* Stars */}
          <StarRating rating={rating} count={count} />

          {/* Price */}
          <p className="text-3xl font-extrabold text-stone-900">
            ${Number(product.Price).toFixed(2)}
          </p>

          {/* Stock status */}
          {lowStock ? (
            <span className="text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full w-fit">
              Only {stock} left
            </span>
          ) : inStock ? (
            <span className="text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full w-fit">
              In Stock
            </span>
          ) : (
            <span className="text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200 px-3 py-1 rounded-full w-fit">
              Out of Stock
            </span>
          )}

          {/* Add to Cart */}
          <button
            disabled={!inStock}
            onClick={() => dispatch({ type: "ADD", product })}
            className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
              inStock
                ? "bg-crimson hover:bg-crimson-dark text-white cursor-pointer"
                : "bg-stone-100 text-stone-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={18} />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </button>

          {/* View Full Details */}
          <Link
            href={`/shop/${encodeURIComponent(product.ItemUPC)}`}
            onClick={onClose}
            className="text-sm text-crimson hover:underline text-center"
          >
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  );
}
