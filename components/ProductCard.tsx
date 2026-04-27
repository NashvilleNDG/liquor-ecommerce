"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Heart } from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import QuickViewModal from "@/components/QuickViewModal";

type ProductWithVariants = Product & { _variantCount?: number; _imageUrl?: string | null };

export default function ProductCard({ product }: { product: ProductWithVariants }) {
  const { dispatch } = useCart();
  const { dispatch: wDispatch, isWishlisted } = useWishlist();
  const [showQuickView, setShowQuickView] = useState(false);
  const wishlisted = isWishlisted(product.ItemUPC);
  const stock = Number(product.CurrentStock);
  const inStock = stock > 0;
  const lowStock = inStock && stock <= 5;
  const variantCount = product._variantCount ?? 1;

  const [imageUrl] = useState<string | null>(product._imageUrl ?? null);

  // Stable fallback rating from UPC hash
  const fallbackRating = (() => {
    let hash = 0;
    for (let i = 0; i < product.ItemUPC.length; i++)
      hash = (hash * 31 + product.ItemUPC.charCodeAt(i)) >>> 0;
    return { rating: Math.round((3.5 + (hash % 15) / 10) * 10) / 10, count: 10 + (hash % 491) };
  })();

  const DEPT_ICON: Record<string, string> = {
    "BEER": "🍺", "Wines": "🍷", "WINE": "🍷",
    "LIQUOR": "🥃", "MIXERS": "🍹", "Soda": "🥤",
  };
  const deptIcon = DEPT_ICON[product.Department] ?? "🍾";

  const price = Number(product.Price);
  const priceDisplay = `$${price.toFixed(2)}`;

  return (
    <div className="group relative flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">

      {/* ── Image area ── */}
      <Link
        href={`/shop/${encodeURIComponent(product.ItemUPC)}`}
        className="relative block bg-white overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Product image or emoji fallback */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.ItemName}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            className="object-contain p-5 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300 select-none">{deptIcon}</span>
          </div>
        )}

        {/* Top-left: star + rating */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-stone-700">{fallbackRating.rating.toFixed(1)}</span>
        </div>

        {/* Top-right: wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); wDispatch({ type: "TOGGLE", product }); }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
            wishlisted ? "bg-crimson text-white" : "bg-white/90 text-stone-400 hover:text-crimson"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} className={wishlisted ? "fill-white" : ""} />
        </button>

        {/* Low stock badge */}
        {lowStock && (
          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
            Only {stock} left
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-xs font-semibold text-stone-500 bg-white border border-stone-300 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick view on hover */}
        <button
          onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-stone-800 text-[10px] font-bold px-3 py-1 rounded-full shadow border border-stone-200 whitespace-nowrap"
        >
          Quick View
        </button>
      </Link>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3.5 gap-1.5">

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-black text-stone-900">
            {variantCount > 1 ? <span className="text-sm font-semibold text-stone-400 mr-0.5">from</span> : null}
            {priceDisplay}
          </span>
        </div>

        {/* Size / Options | Department */}
        <p className="text-xs text-stone-400 leading-none">
          {variantCount > 1 ? `${variantCount} Options` : (product.Size || product.Department)}
          {variantCount === 1 && product.Size && product.Department && (
            <span className="text-stone-300"> · {product.Department}</span>
          )}
        </p>

        {/* Product name */}
        <Link href={`/shop/${encodeURIComponent(product.ItemUPC)}`}>
          <h3 className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2 group-hover:text-crimson transition-colors min-h-[2.5rem]">
            {product.ItemName}
          </h3>
        </Link>

        {/* Add to Cart button */}
        <button
          disabled={!inStock}
          onClick={(e) => { e.preventDefault(); dispatch({ type: "ADD", product }); }}
          className={`mt-auto w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-full transition-all ${
            inStock
              ? "bg-crimson hover:bg-crimson/90 text-white hover:shadow-md active:scale-95 cursor-pointer"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
          }`}
        >
          <ShoppingCart size={15} />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>

      <QuickViewModal product={showQuickView ? product : null} onClose={() => setShowQuickView(false)} />
    </div>
  );
}
