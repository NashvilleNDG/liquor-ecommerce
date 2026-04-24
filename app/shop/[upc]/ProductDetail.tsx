"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, Package, Tag, Hash, Layers, Ruler, Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import { useCart } from "@/context/CartContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { getProductImage } from "@/lib/product-images";
import DepartmentBadge from "@/components/DepartmentBadge";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail({
  product,
  variants,
  related,
}: {
  product: Product;
  variants: Product[];
  related: Product[];
}) {
  const { dispatch } = useCart();
  const { addView } = useRecentlyViewed();
  const [qty, setQty] = useState(1);

  useEffect(() => { addView(product.ItemUPC); }, [product.ItemUPC]); // eslint-disable-line react-hooks/exhaustive-deps
  const inStock  = Number(product.CurrentStock) > 0;
  const imageUrl = getProductImage(product.ItemUPC);
  const maxQty   = Math.min(Number(product.CurrentStock) || 99, 99);

  const allSizes = [product, ...variants].sort(
    (a, b) => Number(a.Price) - Number(b.Price)
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 sm:space-y-12">
      {/* Back */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={14} /> Back to Shop
      </Link>

      {/* Product */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
        {/* Image */}
        <div className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center justify-center aspect-square overflow-hidden relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.ItemName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6 sm:p-8"
              priority
            />
          ) : (
            <div className="text-center space-y-3 p-8">
              <div className="bg-stone-200 dark:bg-stone-800 rounded-full p-6 inline-flex">
                <Package size={48} className="text-amber-500 dark:text-amber-400" />
              </div>
              <p className="text-stone-400 dark:text-stone-500 text-sm">No image available</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <DepartmentBadge dept={product.Department} />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-white leading-tight">
              {product.ItemName}
            </h1>
          </div>

          {/* Price block */}
          <div className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
              ${Number(product.Price).toFixed(2)}
            </span>
            <p className={`text-sm font-medium ${inStock ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
              {inStock
                ? `In stock · ${Number(product.CurrentStock).toFixed(0)} available`
                : "Out of stock"}
            </p>
          </div>

          {/* Size picker */}
          {allSizes.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                <Ruler size={14} />
                <span className="font-medium">Size</span>
                <span className="text-stone-400 dark:text-stone-600">— {allSizes.length} options</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((v) => {
                  const isCurrent   = v.ItemUPC === product.ItemUPC;
                  const sizeInStock = Number(v.CurrentStock) > 0;
                  return (
                    <Link
                      key={v.ItemUPC}
                      href={`/shop/${encodeURIComponent(v.ItemUPC)}`}
                      className={`relative flex flex-col items-center px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 min-w-[68px] text-center ${
                        isCurrent
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/40"
                          : sizeInStock
                          ? "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500"
                          : "border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 text-stone-300 dark:text-stone-600 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <span className="font-semibold">{v.Size || "—"}</span>
                      <span className="text-xs mt-0.5 text-amber-600/80 dark:text-amber-400/80">
                        ${Number(v.Price).toFixed(2)}
                      </span>
                      {!sizeInStock && (
                        <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-1 rounded-full">
                          Out
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { icon: Tag,     label: "Size",  value: product.Size },
              { icon: Layers,  label: "Pack",  value: product.Pack },
              { icon: Hash,    label: "UPC",   value: product.ItemUPC },
              { icon: Package, label: "Stock", value: Number(product.CurrentStock).toFixed(0) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3">
                <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-xs mb-1">
                  <Icon size={12} /> {label}
                </div>
                <p className="text-stone-900 dark:text-white text-sm font-medium truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Qty selector */}
          {inStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500 dark:text-stone-400 font-medium">Qty</span>
              <div className="flex items-center bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-stone-900 dark:text-white font-semibold text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  className="px-3 py-2 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-600">{maxQty} available</span>
            </div>
          )}

          {/* Add to cart */}
          <div className="flex gap-3">
            <button
              disabled={!inStock}
              onClick={() => dispatch({ type: "ADD", product, qty })}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 dark:disabled:text-stone-600 text-stone-900 font-bold py-3.5 sm:py-4 rounded-2xl text-base transition-colors"
            >
              <ShoppingCart size={18} />
              {inStock ? `Add ${qty > 1 ? `${qty} ` : ""}to Cart` : "Out of Stock"}
            </button>

            {inStock && (
              <button
                onClick={() => dispatch({ type: "ADD", product, qty: 12 })}
                title="Add a case (12 units)"
                className="flex items-center justify-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 hover:border-amber-400/50 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-semibold px-3 sm:px-4 rounded-2xl text-sm transition-all whitespace-nowrap"
              >
                <Layers size={15} />
                <span className="hidden sm:inline">Case</span> &times;12
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-white">
            You might also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {related.map((p) => (
              <ProductCard key={p.ItemUPC} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
