"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ChevronRight, MapPin, Truck, Star, Package, ChevronDown, ChevronUp, Share2, Facebook, Link2 } from "lucide-react";
import type { Product } from "@/lib/kanji-api";
import type { CityHiveProductDetails } from "@/lib/cityhive-api";
import { inferOrigin, COUNTRY_FLAG } from "@/lib/product-origin";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import ProductCard from "@/components/ProductCard";

const STORE_ADDRESS = "208 North Thompson Lane, Murfreesboro, TN 37129";

function StarsRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? "text-crimson fill-crimson" : "text-stone-200 fill-stone-200"}
        />
      ))}
    </div>
  );
}

function normalizeAbv(content?: string): number | null {
  if (!content || content === "N/A") return null;
  const num = parseFloat(content.replace("%", ""));
  return isNaN(num) ? null : num;
}

// Generate a product description when CityHive doesn't provide one
function generateFallbackDescription(
  name: string,
  dept: string,
  size: string,
  country: string | null,
  state: string | null
): string {
  const n = name.toLowerCase();
  const origin = state ? `${state}, ${country}` : country;
  const originStr = origin ? ` from ${origin}` : "";
  const sizeStr = size ? ` Available in ${size}.` : "";

  // Bourbon
  if (n.includes("bourbon")) {
    return `${name} is a premium American straight bourbon whiskey${originStr}, crafted using a traditional mash bill rich in corn, rye, and malted barley. Aged in new charred American oak barrels, it develops its signature notes of caramel, vanilla, and toasted oak. With a warm, lingering finish, it's exceptional sipped neat, on the rocks, or in classic cocktails like an Old Fashioned or Manhattan.${sizeStr}`;
  }

  // Tennessee Whiskey
  if (n.includes("tennessee") || (n.includes("whiskey") && state === "Tennessee")) {
    return `${name} is a distinguished Tennessee whiskey${originStr}, mellowed through the traditional Lincoln County Process — filtered through sugar maple charcoal before aging in charred American oak barrels. This extra step gives it an exceptionally smooth, mellow character with notes of vanilla, caramel, and a hint of smokiness. Perfect neat, over ice, or as the base of a whiskey sour.${sizeStr}`;
  }

  // Scotch Whisky
  if (n.includes("scotch") || n.includes("highland") || n.includes("speyside") || n.includes("islay") || n.includes("single malt")) {
    return `${name} is a distinguished Scotch whisky${originStr}, aged in oak casks to develop its complex character of dried fruits, malt, and subtle smoke. Produced under the strict regulations of Scotch Whisky Associations, it carries the authentic heritage of Scottish distilling tradition. Best appreciated neat or with a splash of still water to open up its nuanced aromas and flavors.${sizeStr}`;
  }

  // Irish Whiskey
  if (n.includes("irish whiskey") || country === "Ireland") {
    return `${name} is a smooth and approachable Irish whiskey${originStr}, triple-distilled for exceptional purity and a characteristically light, fruity, and mellow flavor profile. Its gentle notes of vanilla, honey, and light spice make it one of the world's most enjoyable whiskies — ideal for sipping straight, over ice, or as the star ingredient in an Irish Coffee.${sizeStr}`;
  }

  // Japanese Whisky
  if (country === "Japan" || n.includes("japanese whisky") || n.includes("suntory") || n.includes("nikka")) {
    return `${name} is an elegant Japanese whisky${originStr}, crafted with meticulous attention to balance and harmony. Drawing on both Scottish traditions and Japanese precision, it delivers delicate floral and fruity notes alongside subtle oak influence and a silky smooth finish. A superb choice for contemplative sipping, and an essential addition to any whisky collection.${sizeStr}`;
  }

  // Vodka
  if (n.includes("vodka")) {
    const usaNote = country === "United States" ? " Made with high-quality American ingredients," : "";
    return `${name} is a premium, ultra-smooth vodka${originStr}.${usaNote} distilled multiple times for exceptional purity and a clean, crisp finish. Its neutral yet refined character makes it the perfect base for virtually any cocktail — from a classic Martini and Moscow Mule to a simple vodka soda. Enjoy it chilled and neat to appreciate its full smoothness.${sizeStr}`;
  }

  // Tequila
  if (n.includes("tequila")) {
    const type = n.includes("reposado") ? "reposado" : n.includes("añejo") || n.includes("anejo") ? "añejo" : n.includes("extra añejo") ? "extra añejo" : n.includes("blanco") || n.includes("silver") ? "blanco" : "premium";
    return `${name} is a ${type} tequila crafted${originStr} from 100% blue Weber agave plants, slow-roasted in traditional ovens and distilled in copper pot stills. ${type === "reposado" ? "Rested in oak barrels for a minimum of two months, it gains subtle wood, caramel, and spice notes while preserving the bright agave character." : type === "blanco" ? "Unaged and bottled fresh, it showcases the pure, vibrant flavors of agave with hints of citrus and pepper." : "Aged for extended periods in American and French oak barrels, developing rich complexity with layers of caramel, dried fruit, and warm spice."} Perfect for sipping or mixing into a premium margarita.${sizeStr}`;
  }

  // Mezcal
  if (n.includes("mezcal")) {
    return `${name} is a handcrafted artisanal mezcal${originStr}, produced using traditional methods passed down through generations of Oaxacan mezcaleros. Made from agave hearts (piñas) that are slow-roasted in earthen pits over hot rocks and mesquite, it delivers the signature smoky, earthy complexity that sets mezcal apart. Sip it slowly neat in a copita glass to fully appreciate its depth and character.${sizeStr}`;
  }

  // Rum
  if (n.includes("rum")) {
    const style = n.includes("dark") ? "dark" : n.includes("spiced") ? "spiced" : n.includes("white") || n.includes("light") || n.includes("silver") ? "light" : "premium";
    return `${name} is a ${style} rum${originStr}, distilled from fermented sugarcane molasses or fresh sugarcane juice and aged to perfection. Its ${style === "dark" ? "rich, full-bodied character features notes of molasses, tropical fruits, and warm spices" : style === "spiced" ? "warm, aromatic profile combines natural rum with a blend of exotic spices and vanilla" : "clean, versatile character makes it ideal for mixing into your favorite cocktails"}. A must-have for any home bar.${sizeStr}`;
  }

  // Gin
  if (n.includes("gin")) {
    return `${name} is a craft gin${originStr}, distilled with a carefully selected blend of botanical ingredients including juniper berries, coriander, citrus peel, and other aromatic herbs and spices. Its bright, complex flavor profile features fresh juniper at the forefront, followed by floral and citrus notes with a clean, dry finish. Outstanding in a classic gin and tonic, a dry Martini, or a refreshing Negroni.${sizeStr}`;
  }

  // Cognac / Brandy
  if (n.includes("cognac") || n.includes("brandy") || n.includes("armagnac")) {
    return `${name} is a refined cognac and brandy${originStr}, crafted from Ugni Blanc grapes that are double-distilled in traditional copper pot stills and aged in French Limousin oak casks. This patient aging process develops layers of complexity — dried fruits, vanilla, warm spices, and oak — creating a spirit of remarkable depth and elegance. Ideal as an after-dinner digestif, sipped neat or over a single large ice cube.${sizeStr}`;
  }

  // Wine — Red
  if ((dept === "Wines" || dept === "WINE") && (n.includes("red") || n.includes("cabernet") || n.includes("merlot") || n.includes("pinot noir") || n.includes("malbec") || n.includes("shiraz") || n.includes("syrah") || n.includes("zinfandel"))) {
    return `${name} is a full-bodied red wine${originStr}, crafted from carefully selected grapes harvested at optimal ripeness. Aged in oak barrels to develop structure and complexity, it presents rich aromas of dark berries, plum, and spice, with a smooth, velvety finish. An exceptional pairing with red meats, hearty pasta dishes, and aged cheeses. Serve at room temperature or slightly chilled.${sizeStr}`;
  }

  // Wine — White
  if ((dept === "Wines" || dept === "WINE") && (n.includes("white") || n.includes("chardonnay") || n.includes("sauvignon blanc") || n.includes("riesling") || n.includes("pinot grigio") || n.includes("moscato"))) {
    return `${name} is a crisp, refreshing white wine${originStr}, showcasing the vibrant character of its grape variety. With lively aromas of fresh citrus, stone fruit, and floral notes, it delivers a bright, clean palate with well-balanced acidity. An excellent companion to seafood, light pasta, salads, and soft cheeses. Best served well chilled at 45–50°F.${sizeStr}`;
  }

  // Wine — Rosé or generic
  if (dept === "Wines" || dept === "WINE") {
    return `${name} is a carefully crafted wine${originStr}, produced from grapes selected for their exceptional quality and expression of terroir. Its elegant aromatics and well-balanced character make it a versatile choice for a wide variety of occasions and food pairings. Serve at the appropriate temperature to best enjoy its full complexity and character.${sizeStr}`;
  }

  // Beer
  if (dept === "BEER") {
    const style = n.includes("ipa") ? "India Pale Ale (IPA)" : n.includes("lager") ? "lager" : n.includes("stout") ? "stout" : n.includes("porter") ? "porter" : n.includes("wheat") ? "wheat beer" : n.includes("sour") ? "sour ale" : n.includes("pilsner") ? "pilsner" : "craft beer";
    return `${name} is a premium ${style}${originStr}, brewed with quality malted barley, select hops, and pure water using time-honored brewing traditions. ${style.includes("IPA") ? "Its bold hop character delivers bright aromas of citrus and pine, balanced by a clean malt backbone and a satisfying bitter finish." : style === "stout" ? "Rich and full-bodied with roasted coffee and dark chocolate flavors, it has a creamy texture and a smooth, warming finish." : style === "lager" || style === "pilsner" ? "Crisp, clean, and refreshing with a balanced malt character and subtle hop bitterness — the perfect all-occasion beer." : "Crafted with passion and attention to detail, it delivers a well-balanced flavor experience that showcases the brewer's artistry."} Best enjoyed ice-cold in a chilled glass.${sizeStr}`;
  }

  // Generic spirits fallback
  if (dept === "LIQUOR") {
    return `${name} is a premium spirit${originStr}, crafted with care and expertise using the finest ingredients available. Produced using traditional methods and aged to perfection, it delivers a complex, rewarding flavor profile that appeals to both casual drinkers and connoisseurs alike. Enjoy it neat, on the rocks, or as the cornerstone of your favorite cocktail.${sizeStr}`;
  }

  // Generic fallback
  return `${name} is a quality beverage${originStr} available in ${size || "various sizes"}. Visit Stones River Total Beverages in Murfreesboro, TN, to explore our full selection — over 7,000 products available for in-store pickup or local delivery.`;
}

export default function ProductDetail({
  product,
  variants,
  related,
  cityhive,
}: {
  product: Product;
  variants: Product[];
  related: Product[];
  cityhive: CityHiveProductDetails | null;
}) {
  const { dispatch } = useCart();
  const { dispatch: wDispatch, isWishlisted } = useWishlist();
  const { addView } = useRecentlyViewed();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showVariants, setShowVariants] = useState(true);
  const descRef = useRef<HTMLDivElement>(null);
  const [descOverflows, setDescOverflows] = useState(false);

  useEffect(() => { addView(product.ItemUPC); }, [product.ItemUPC]); // eslint-disable-line

  useEffect(() => {
    if (descRef.current) {
      setDescOverflows(descRef.current.scrollHeight > 200);
    }
  }); // eslint-disable-line

  const wishlisted = isWishlisted(product.ItemUPC);
  const inStock = Number(product.CurrentStock) > 0;
  const maxQty = Math.min(Number(product.CurrentStock) || 99, 99);

  // All size variants sorted by price
  const allSizes = [product, ...variants].sort((a, b) => Number(a.Price) - Number(b.Price));

  // Images
  const primaryImage = cityhive?.images?.primary?.large || cityhive?.images?.primary?.original || null;
  const moreImages: string[] = (cityhive?.images?.more_images || [])
    .map((img) => img.large || img.original)
    .filter(Boolean) as string[];
  const allImages = [primaryImage, ...moreImages].filter(Boolean) as string[];
  const thumbImages: string[] = [
    cityhive?.images?.primary?.medium || primaryImage,
    ...(cityhive?.images?.more_images || []).map((img) => img.medium || img.thumbnail || img.small).filter(Boolean),
  ].filter(Boolean) as string[];

  // Product attributes (from CityHive, with name-based inference as fallback)
  const ap = cityhive?.additional_properties || {};
  const abv = normalizeAbv(ap.content);
  const brand = ap.brands && ap.brands !== "N/A" ? ap.brands : null;
  const subtype = ap.subtype && ap.subtype !== "N/A" ? ap.subtype : null;
  const basicCat = ap.basic_category && ap.basic_category !== "N/A" ? ap.basic_category : null;
  const productType = ap.type && ap.type !== "N/A" ? ap.type : null;
  const region = ap.region && ap.region !== "N/A" ? ap.region : null;

  // Use CityHive country/state when available, otherwise infer from product name
  const chCountry = ap.country && ap.country !== "N/A" ? ap.country : null;
  const chState = ap.state && ap.state !== "N/A" ? ap.state : null;
  const inferred = (!chCountry && !chState) ? inferOrigin(product.ItemName, product.Department) : { country: null, state: null };
  const country = chCountry ?? inferred.country;
  const state = chState ?? inferred.state;

  const dept = product.Department;
  const deptLabel =
    dept === "BEER" ? "Beer" :
    dept === "Wines" || dept === "WINE" ? "Wine" :
    dept === "LIQUOR" ? "Spirits" : dept;

  // Description: prefer CityHive, fall back to generated
  const description = cityhive?.description ||
    generateFallbackDescription(product.ItemName, product.Department, product.Size || "", country, state);

  // Badges: country + state flags
  const badges: { icon: string; label: string }[] = [];
  if (state) badges.push({ icon: COUNTRY_FLAG["United States"] || "🌎", label: `Products From ${state}` });
  if (country) badges.push({ icon: COUNTRY_FLAG[country] || "🌍", label: `Products From ${country}` });

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center flex-wrap gap-1 text-xs text-stone-400">
        <Link href="/shop" className="hover:text-crimson transition-colors">Shop</Link>
        {deptLabel && <><ChevronRight size={10} /><span className="text-stone-500">{deptLabel}</span></>}
        {subtype && <><ChevronRight size={10} /><span className="text-stone-500 capitalize">{subtype}</span></>}
        {country && <><ChevronRight size={10} /><span className="text-stone-500">{country}</span></>}
        {state && <><ChevronRight size={10} /><span className="text-stone-500">{state}</span></>}
        {region && <><ChevronRight size={10} /><span className="text-stone-500">{region}</span></>}
      </nav>

      {/* ── Product Title ── */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white leading-tight">
          {product.ItemName}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
          {brand && <span className="text-crimson font-semibold">{brand}</span>}
          {brand && <span className="text-stone-300">|</span>}
          <span className="font-medium text-stone-700 dark:text-stone-300">{product.Size}</span>
          <span className="text-stone-300">|</span>
          <span className={inStock ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
            {inStock ? "Available" : "Out of Stock"}
          </span>
          {allSizes.length > 1 && (
            <>
              <span className="text-stone-300">|</span>
              <button
                onClick={() => setShowVariants((v) => !v)}
                className="text-stone-400 hover:text-crimson underline underline-offset-2 transition-colors"
              >
                {showVariants ? "Hide more options" : "Show more options"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Size Variant Grid ── */}
      {allSizes.length > 1 && showVariants && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {allSizes.map((v) => {
            const isCurrent = v.ItemUPC === product.ItemUPC;
            const sizeInStock = Number(v.CurrentStock) > 0;
            return (
              <Link
                key={v.ItemUPC}
                href={`/shop/${encodeURIComponent(v.ItemUPC)}`}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? "border-crimson bg-white dark:bg-stone-900 ring-1 ring-crimson/40 shadow-sm"
                    : sizeInStock
                    ? "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-400 hover:shadow-sm"
                    : "border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm font-bold leading-tight ${isCurrent ? "text-stone-900 dark:text-white" : "text-stone-700 dark:text-stone-300"}`}>
                    {v.Size}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${sizeInStock ? "text-green-600" : "text-stone-400"}`}>
                    {sizeInStock ? "Available" : "Out of Stock"}
                  </p>
                </div>
                <span className={`text-sm font-bold ml-3 flex-shrink-0 ${isCurrent ? "text-crimson" : "text-crimson"}`}>
                  ${Number(v.Price).toFixed(2)}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Main Layout: image + purchase ── */}
      <div className="grid md:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-start">

        {/* LEFT: Image gallery */}
        <div className="space-y-3">
          {/* Rating above image */}
          {cityhive && cityhive.product_rating > 0 && (
            <div className="flex items-center gap-2">
              <StarsRow rating={cityhive.product_rating} />
              <span className="text-sm font-bold text-stone-600 dark:text-stone-400">
                {cityhive.product_rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Main image */}
          <div className="relative aspect-square bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
            {allImages.length > 0 ? (
              <Image
                src={allImages[activeImage] ?? allImages[0]}
                alt={product.ItemName}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-6"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package size={72} className="text-stone-300" />
              </div>
            )}

            {/* Wishlist button overlay */}
            <button
              onClick={() => wDispatch({ type: "TOGGLE", product })}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md border transition-all ${
                wishlisted
                  ? "bg-crimson border-crimson text-white"
                  : "bg-white/90 border-stone-200 text-stone-400 hover:text-crimson"
              }`}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg width="14" height="14" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Thumbnails */}
          {thumbImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {thumbImages.slice(0, 6).map((thumb, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden bg-white transition-all ${
                    activeImage === i ? "border-crimson" : "border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <img src={thumb} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-stone-400 italic">* Actual product may differ from image.</p>
        </div>

        {/* RIGHT: Purchase panel */}
        <div className="space-y-5">

          {/* Size + Price header */}
          <div className="flex items-end justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
            <span className="text-2xl font-bold text-crimson">{product.Size}</span>
            <span className="text-4xl font-extrabold text-crimson">${Number(product.Price).toFixed(2)}</span>
          </div>

          {/* Qty + Add to Cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-stone-300 dark:border-stone-600 rounded-xl overflow-hidden h-12">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-11 h-full flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xl font-bold"
              >
                −
              </button>
              <span className="w-10 text-center text-stone-900 dark:text-white font-semibold text-base">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="w-11 h-full flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xl font-bold"
              >
                +
              </button>
            </div>
            <button
              disabled={!inStock}
              onClick={() => dispatch({ type: "ADD", product, qty })}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-crimson hover:bg-crimson/90 disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 text-white font-bold rounded-xl transition-colors text-sm"
            >
              <ShoppingCart size={16} />
              {inStock ? "Add To Cart" : "Out of Stock"}
            </button>
          </div>

          {/* Add a Case */}
          {inStock && (
            <button
              onClick={() => dispatch({ type: "ADD", product, qty: 6 })}
              className="w-full flex items-center justify-center gap-2 border-2 border-crimson text-crimson hover:bg-crimson/5 font-bold h-12 rounded-xl transition-colors text-sm"
            >
              <ShoppingCart size={16} />
              Add a Case
              <span className="text-xs font-normal text-stone-400 ml-0.5">6 units</span>
            </button>
          )}

          {/* Pickup + Delivery */}
          <div className="space-y-3 py-4 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-start gap-3">
              <MapPin size={15} className="text-stone-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-bold text-stone-700 dark:text-stone-300">Pickup at: </span>
                <span className="text-stone-600 dark:text-stone-400">{STORE_ADDRESS}</span>
                <div className="text-green-600 font-bold mt-0.5">FREE</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck size={15} className="text-stone-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-bold text-stone-700 dark:text-stone-300">Delivery: </span>
                <span className="text-stone-600 dark:text-stone-400">1 hour delivery</span>
                <div className="text-stone-400 text-xs mt-0.5">$5.00 + $0.50/mile ($19.99 order min)</div>
              </div>
            </div>
          </div>

          {/* Attribute badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-5 py-4 border-t border-stone-200 dark:border-stone-800">
              {abv !== null && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <span className="text-sm font-bold text-stone-700 dark:text-stone-300">{abv}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium">ABV%</span>
                </div>
              )}
              {badges.map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xl">
                    {b.icon}
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium text-center leading-tight max-w-[72px]">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="space-y-2 py-4 border-t border-stone-200 dark:border-stone-800">
              <p className="text-sm font-bold text-crimson">Description:</p>
              <div
                ref={descRef}
                className={`text-sm text-stone-600 dark:text-stone-400 leading-relaxed overflow-hidden transition-all duration-300 ${showFullDesc ? "" : "max-h-[200px]"}`}
                dangerouslySetInnerHTML={{ __html: description }}
              />
              {descOverflows && (
                <button
                  onClick={() => setShowFullDesc((v) => !v)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-crimson transition-colors font-medium"
                >
                  {showFullDesc ? <><ChevronUp size={12} /> Show Less</> : <><ChevronDown size={12} /> Show More</>}
                </button>
              )}
            </div>
          )}

          {/* Product Rating */}
          {cityhive && cityhive.number_of_product_ratings > 0 && (
            <div className="flex items-center justify-between py-4 border-t border-stone-200 dark:border-stone-800">
              <p className="text-sm font-bold text-crimson">Product Rating:</p>
              <div className="flex items-center gap-2">
                <StarsRow rating={cityhive.product_rating} size={18} />
                <span className="text-sm text-stone-500">
                  {cityhive.number_of_product_ratings} {cityhive.number_of_product_ratings === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
          )}

          {/* Product Details */}
          {(basicCat || productType || abv !== null || country || state || region) && (
            <div className="space-y-3 py-4 border-t border-stone-200 dark:border-stone-800">
              <p className="text-sm font-bold text-crimson">Product Details</p>

              {(basicCat || productType || abv !== null) && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-stone-200 dark:border-stone-700 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{basicCat || productType || deptLabel}</p>
                    {subtype && <p className="text-xs text-stone-400 capitalize mt-0.5">{subtype}</p>}
                  </div>
                  {abv !== null && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-base">💧</span>
                      <span className="text-sm font-bold text-stone-700 dark:text-stone-300">{abv}</span>
                    </div>
                  )}
                </div>
              )}

              {(country || state || region) && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-stone-400 flex-shrink-0 mt-0.5" />
                  <div>
                    {country && <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{country}</p>}
                    {state && <p className="text-xs text-stone-500 mt-0.5">{state}</p>}
                    {region && <p className="text-xs text-stone-400">{region}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-3 py-4 border-t border-stone-200 dark:border-stone-800">
            <span className="text-sm font-bold text-crimson">Share on:</span>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")}
              className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="Share on Facebook"
            >
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.ItemName)}`, "_blank")}
              className="w-9 h-9 rounded-full bg-stone-900 dark:bg-stone-700 flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="Share on X"
            >
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="Copy link"
            >
              <Link2 size={14} className="text-stone-600 dark:text-stone-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">You might also like</h2>
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
