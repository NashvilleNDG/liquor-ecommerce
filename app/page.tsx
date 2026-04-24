import Link from "next/link";
import { fetchProducts } from "@/lib/kanji-api";
import { deduplicateByVariant } from "@/lib/product-variants";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { ArrowRight, ChevronRight } from "lucide-react";

export const revalidate = 300;

/* ── Section heading ── */
function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl sm:text-2xl font-heading font-bold text-stone-900">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-sm text-crimson hover:underline font-medium">
        Show All <ChevronRight size={14} />
      </Link>
    </div>
  );
}

/* ── Horizontal scroll product row ── */
function ProductRow({ products }: { products: ReturnType<typeof deduplicateByVariant> }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      {products.map((p) => (
        <div key={p.ItemUPC} className="flex-shrink-0 w-44 sm:w-48">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

const COUNTRIES = [
  { name: "Italy",        code: "IT", bg: "from-green-700 to-red-600"   },
  { name: "France",       code: "FR", bg: "from-blue-800 to-blue-600"   },
  { name: "Spain",        code: "ES", bg: "from-yellow-500 to-red-600"  },
  { name: "USA",          code: "US", bg: "from-blue-700 to-red-700"    },
  { name: "Australia",    code: "AU", bg: "from-blue-800 to-red-500"    },
  { name: "South Africa", code: "ZA", bg: "from-green-700 to-yellow-600"},
  { name: "Argentina",    code: "AR", bg: "from-sky-500 to-sky-700"     },
  { name: "New Zealand",  code: "NZ", bg: "from-blue-900 to-red-600"    },
];

const PAIRINGS = [
  { name: "Cheese",           emoji: "🧀", color: "bg-yellow-50 border-yellow-200" },
  { name: "Meat",             emoji: "🥩", color: "bg-red-50 border-red-200" },
  { name: "Poultry",          emoji: "🍗", color: "bg-orange-50 border-orange-200" },
  { name: "Fish",             emoji: "🐟", color: "bg-blue-50 border-blue-200" },
  { name: "Fruits & Veggies", emoji: "🥦", color: "bg-green-50 border-green-200" },
  { name: "Dessert",          emoji: "🍰", color: "bg-pink-50 border-pink-200" },
  { name: "Italian",          emoji: "🍝", color: "bg-amber-50 border-amber-200" },
  { name: "Asian",            emoji: "🍜", color: "bg-rose-50 border-rose-200" },
];

const BRANDS = [
  { name: "Patrón Tequila",  count: 11, emoji: "🥃" },
  { name: "Espolòn",         count: 7,  emoji: "🥃" },
  { name: "Cruzan",          count: 20, emoji: "🍹" },
  { name: "1792",            count: 9,  emoji: "🥃" },
  { name: "Angel's Envy",    count: 5,  emoji: "🥃" },
  { name: "Grey Goose",      count: 6,  emoji: "🍸" },
  { name: "The Macallan",    count: 14, emoji: "🥃" },
  { name: "Maker's Mark",    count: 8,  emoji: "🥃" },
];

export default async function HomePage() {
  const allProducts = await fetchProducts();
  const inStock     = allProducts.filter((p) => Number(p.CurrentStock) > 0);
  const deduped     = deduplicateByVariant(inStock);

  const byDept = (dept: string) => deduped.filter((p) => p.Department === dept);

  const bestSellers   = deduped.slice(0, 12);
  const newArrivals   = [...deduped].reverse().slice(0, 12);
  const backInStock   = deduped.filter((p) => Number(p.CurrentStock) <= 5 && Number(p.CurrentStock) > 0).slice(0, 12);
  const liquor        = byDept("LIQUOR").slice(0, 12);
  const wines         = byDept("Wines").slice(0, 12);
  const beer          = byDept("BEER").slice(0, 12);
  const under20       = deduped.filter((p) => Number(p.Price) < 20).slice(0, 12);
  const exclusive     = deduped.filter((p) => Number(p.Price) >= 100).slice(0, 12);

  return (
    <>
      <Navbar />

      {/* ── Hero 3-tile ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 h-48 sm:h-64">
        {[
          { label: "Shop Wine",    emoji: "🍷", bg: "bg-gradient-to-br from-purple-800 to-red-900",   dept: "Wines"  },
          { label: "Shop Spirits", emoji: "🥃", bg: "bg-gradient-to-br from-stone-800 to-stone-950",  dept: "LIQUOR" },
          { label: "Shop Beer",    emoji: "🍺", bg: "bg-gradient-to-br from-amber-700 to-amber-900",  dept: "BEER"   },
        ].map(({ label, emoji, bg, dept }) => (
          <Link
            key={label}
            href={`/shop?dept=${dept}`}
            className={`${bg} group flex flex-col items-center justify-center gap-3 text-white transition-all hover:brightness-110 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <span className="relative text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl">{emoji}</span>
            <p className="relative font-heading font-bold text-xl sm:text-2xl tracking-wide drop-shadow">{label}</p>
          </Link>
        ))}
      </section>

      {/* ── Promo banner ── */}
      <div className="bg-crimson text-white text-center py-3 px-4">
        <p className="text-sm font-semibold">
          🎉 <span className="font-bold">Free Delivery</span> on orders $99+ · Same-day pickup available · Must be 21+
        </p>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <section>
            <SectionHeading title="Best Sellers" href="/shop?sort=stock_desc" />
            <ProductRow products={bestSellers} />
          </section>
        )}

        {/* Countries */}
        <section>
          <SectionHeading title="Shop by Country" href="/shop" />
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {COUNTRIES.map(({ name, code, bg }) => (
              <Link
                key={name}
                href="/shop"
                className={`flex-shrink-0 group flex flex-col items-center justify-center gap-1.5 w-28 h-24 rounded-xl bg-gradient-to-br ${bg} text-white shadow-md hover:shadow-xl hover:scale-105 transition-all`}
              >
                <span className="text-xl font-extrabold tracking-widest opacity-90">{code}</span>
                <span className="text-xs font-semibold">{name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section>
            <SectionHeading title="New Arrivals" href="/shop?sort=name" />
            <ProductRow products={newArrivals} />
          </section>
        )}

        {/* Back In Stock */}
        {backInStock.length > 0 && (
          <section>
            <SectionHeading title="Back In Stock" href="/shop?instock=1" />
            <ProductRow products={backInStock} />
          </section>
        )}

        {/* Pairings */}
        <section>
          <SectionHeading title="Pairings" href="/shop" />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {PAIRINGS.map(({ name, emoji, color }) => (
              <Link
                key={name}
                href="/shop"
                className={`flex-shrink-0 flex flex-col items-center gap-2 w-24 h-24 rounded-xl border ${color} hover:shadow-md hover:scale-105 transition-all justify-center`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-[11px] font-medium text-stone-600 text-center leading-tight">{name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Exclusive Vintage */}
        {exclusive.length > 0 && (
          <section>
            <SectionHeading title="Exclusive Vintage" href="/shop?sort=price_desc&min=100" />
            <ProductRow products={exclusive} />
          </section>
        )}

        {/* Spirits */}
        {liquor.length > 0 && (
          <section>
            <SectionHeading title="Spirits" href="/shop?dept=LIQUOR" />
            <ProductRow products={liquor} />
          </section>
        )}

        {/* Under $20 */}
        {under20.length > 0 && (
          <section>
            <SectionHeading title="Under $20" href="/shop?max=20" />
            <ProductRow products={under20} />
          </section>
        )}

        {/* Brands */}
        <section>
          <SectionHeading title="Brands" href="/shop" />
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {BRANDS.map(({ name, count, emoji }) => (
              <Link
                key={name}
                href="/shop"
                className="flex-shrink-0 flex flex-col items-center gap-2 w-28 bg-white border border-stone-200 rounded-xl p-4 hover:border-crimson hover:shadow-md transition-all text-center"
              >
                <span className="text-2xl">{emoji}</span>
                <p className="text-[11px] font-bold text-stone-800 leading-tight">{name}</p>
                <p className="text-[10px] text-stone-400">{count} Products</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Wines */}
        {wines.length > 0 && (
          <section>
            <SectionHeading title="Wine" href="/shop?dept=Wines" />
            <ProductRow products={wines} />
          </section>
        )}

        {/* Beer */}
        {beer.length > 0 && (
          <section>
            <SectionHeading title="Beer" href="/shop?dept=BEER" />
            <ProductRow products={beer} />
          </section>
        )}

        {/* Newsletter */}
        <section>
          <div className="bg-stone-900 rounded-2xl p-8 sm:p-12 text-center space-y-5">
            <p className="text-3xl">🎉</p>
            <h2 className="font-heading text-2xl font-bold text-white">Get Exclusive Deals</h2>
            <p className="text-stone-400 max-w-sm mx-auto text-sm leading-relaxed">
              Subscribe and be the first to hear about weekly specials, new arrivals and member-only discounts.
            </p>
            <NewsletterForm />
            <p className="text-stone-600 text-xs">Must be 21+ to subscribe. Unsubscribe anytime.</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
