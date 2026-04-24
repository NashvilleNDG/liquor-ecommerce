import Link from "next/link";
import { Tag, Percent, ShoppingBag } from "lucide-react";
import { fetchProducts } from "@/lib/kanji-api";
import { deduplicateByVariant } from "@/lib/product-variants";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readFileSync, existsSync } from "fs";
import path from "path";
import type { Deal } from "@/app/api/deals/route";
import type { Discount } from "@/app/api/discounts/route";

export const revalidate = 300;

function readDeals(): Deal[] {
  const file = path.join(process.cwd(), "data", "deals.json");
  if (!existsSync(file)) return [];
  try { return JSON.parse(readFileSync(file, "utf-8")); } catch { return []; }
}

function readDiscounts(): Discount[] {
  const file = path.join(process.cwd(), "data", "discounts.json");
  if (!existsSync(file)) return [];
  try { return JSON.parse(readFileSync(file, "utf-8")); } catch { return []; }
}

function applyDiscounts(
  price: number,
  upc: string,
  dept: string,
  discounts: Discount[]
): { finalPrice: number; discountPct: number; discountLabel: string } | null {
  const active = discounts.filter(d => d.active);
  let best: { finalPrice: number; discountPct: number; discountLabel: string } | null = null;

  for (const d of active) {
    const matches =
      (d.type === "category" && d.target.toLowerCase() === dept.toLowerCase()) ||
      (d.type === "product"  && d.target === upc);
    if (!matches) continue;

    let finalPrice: number;
    if (d.discountType === "%") {
      finalPrice = price * (1 - d.value / 100);
    } else {
      finalPrice = price - d.value;
    }
    finalPrice = Math.max(0, finalPrice);
    const pct = Math.round((1 - finalPrice / price) * 100);
    const label = d.discountType === "%" ? `-${d.value}%` : `-$${d.value.toFixed(2)}`;

    if (!best || finalPrice < best.finalPrice) {
      best = { finalPrice, discountPct: pct, discountLabel: label };
    }
  }
  return best;
}

export default async function DealsPage() {
  const allProducts = await fetchProducts();
  const inStock     = allProducts.filter((p) => Number(p.CurrentStock) > 0);
  const deduped     = deduplicateByVariant(inStock);
  const discounts   = readDiscounts();

  // Products on sale via Kanji POS (OnlinePrice < Price)
  const kanjiOnSale = deduped
    .filter((p) => Number(p.OnlinePrice) > 0 && Number(p.OnlinePrice) < Number(p.Price))
    .map((p) => ({
      ...p,
      _salePrice:   Number(p.OnlinePrice),
      _discountPct: Math.round((1 - Number(p.OnlinePrice) / Number(p.Price)) * 100),
      _discountLabel: `-${Math.round((1 - Number(p.OnlinePrice) / Number(p.Price)) * 100)}%`,
    }));

  // Products discounted via admin discount rules
  const adminDiscounted = deduped
    .filter((p) => !kanjiOnSale.find(k => k.ItemUPC === p.ItemUPC))
    .flatMap((p) => {
      const result = applyDiscounts(Number(p.Price), p.ItemUPC, p.Department, discounts);
      if (!result || result.discountPct < 1) return [];
      return [{
        ...p,
        _salePrice:    result.finalPrice,
        _discountPct:  result.discountPct,
        _discountLabel: result.discountLabel,
      }];
    });

  const onSale = [...kanjiOnSale, ...adminDiscounted]
    .sort((a, b) => b._discountPct - a._discountPct)
    .slice(0, 48);

  const activeDeals = readDeals().filter((d) => d.active);

  return (
    <>
      <Navbar />

      {/* ── Page heading ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-10 pb-2 text-center">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-crimson">Our Deals!</h1>
      </div>

      <main className="space-y-0">

        {/* ── Products On Sale ── */}
        <section className="bg-stone-100 py-12">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-bold text-crimson text-center mb-8 flex items-center justify-center gap-2">
              <Percent size={22} /> Products On Sale
            </h2>

            {onSale.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-stone-200">
                <ShoppingBag size={40} className="text-stone-300" />
                <p className="text-stone-500 font-medium">There are no products on sale right now.</p>
                <p className="text-stone-400 text-sm">Please check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {onSale.map((p) => (
                  <div key={p.ItemUPC} className="relative">
                    {p._discountPct >= 1 && (
                      <div className="absolute top-2 left-2 z-10 bg-crimson text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        {p._discountLabel}
                      </div>
                    )}
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Current Deals (admin banners) ── */}
        <section className="bg-white py-12">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-bold text-crimson text-center mb-8 flex items-center justify-center gap-2">
              <Tag size={22} /> Current Deals
            </h2>

            {activeDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-stone-50 rounded-2xl border border-stone-200">
                <Tag size={40} className="text-stone-300" />
                <p className="text-stone-500 font-medium">There are no deals available right now.</p>
                <p className="text-stone-400 text-sm">Please check back soon for exciting deals!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={deal.href || "/shop"}
                    className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-stone-900 aspect-[4/3] flex flex-col justify-end"
                  >
                    {deal.imageUrl && (
                      <img
                        src={deal.imageUrl}
                        alt={deal.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70"
                      />
                    )}
                    <div className="relative z-10 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                      {deal.badge && (
                        <span className="inline-block bg-crimson text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                          {deal.badge}
                        </span>
                      )}
                      <h3 className="text-white font-bold text-lg leading-tight">{deal.title}</h3>
                      {deal.subtitle && (
                        <p className="text-stone-300 text-sm mt-1">{deal.subtitle}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="bg-stone-100 py-12">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-stone-900 text-center mb-2">Subscribe to Our Newsletter!</h2>
              <p className="text-stone-500 text-sm text-center mb-8">
                Sign up for updates about exclusive deals, events, and new arrivals.
              </p>
              <DealsNewsletter />
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

function DealsNewsletter() {
  return (
    <form
      className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-4"
    >
      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1">
          Email Address <span className="text-crimson">*</span>
        </label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
        />
      </div>

      {/* First / Last name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">First Name</label>
          <input
            type="text"
            placeholder="First"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Last Name</label>
          <input
            type="text"
            placeholder="Last"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
          />
        </div>
      </div>

      {/* SMS opt-in */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="sms-optin"
          className="mt-0.5 accent-crimson w-4 h-4 flex-shrink-0"
        />
        <label htmlFor="sms-optin" className="text-sm text-stone-600 leading-relaxed">
          I agree to receive SMS marketing messages from Stones River Total Beverages.
        </label>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1">Phone Number</label>
        <input
          type="tel"
          placeholder="(555) 000-0000"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1">Date of Birth</label>
        <input
          type="date"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-crimson transition-colors"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-crimson text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors text-sm tracking-wide"
      >
        Subscribe
      </button>

      <p className="text-stone-400 text-xs text-center">Must be 21+ to subscribe. Unsubscribe anytime.</p>
    </form>
  );
}
