import Link from "next/link";
import { fetchProducts } from "@/lib/kanji-api";
import { deduplicateByVariant } from "@/lib/product-variants";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { ArrowRight, Truck, ShieldCheck, Clock, Star } from "lucide-react";

export const revalidate = 300;

const FEATURED_DEPTS = [
  { key: "BEER",   label: "Beer",    emoji: "🍺", gradient: "from-amber-600/90 to-amber-800",   desc: "Craft, domestic & imported" },
  { key: "Wines",  label: "Wine",    emoji: "🍷", gradient: "from-purple-700/90 to-pink-800",   desc: "Red, white & rosé" },
  { key: "LIQUOR", label: "Spirits", emoji: "🥃", gradient: "from-blue-700/90 to-indigo-800",   desc: "Whiskey, vodka, rum & more" },
  { key: "CBD",    label: "CBD",     emoji: "🌿", gradient: "from-green-700/90 to-emerald-800", desc: "Oils, gummies & topicals" },
  { key: "MIXERS", label: "Mixers",  emoji: "🍹", gradient: "from-teal-700/90 to-cyan-800",     desc: "Sodas, juices & bitters" },
  { key: "CIGARS", label: "Cigars",  emoji: "💨", gradient: "from-orange-700/90 to-red-800",    desc: "Premium hand-rolled" },
];

const PERKS = [
  { icon: Truck,       title: "Free Delivery",   desc: "On orders over $99" },
  { icon: ShieldCheck, title: "Age Verified",    desc: "21+ only — always" },
  { icon: Clock,       title: "Same-Day Pickup", desc: "Order by 4 PM" },
  { icon: Star,        title: "7,000+ Products", desc: "Largest local selection" },
];

export default async function HomePage() {
  const allProducts = await fetchProducts();
  const inStock = allProducts.filter((p) => Number(p.CurrentStock) > 0);
  const deduped = deduplicateByVariant(inStock);

  const featured: typeof deduped = [];
  for (const dept of ["LIQUOR", "BEER", "Wines", "MIXERS"]) {
    featured.push(...deduped.filter((p) => p.Department === dept).slice(0, 2));
  }

  return (
    <>
      <Navbar />

      {/* Hero — always dark for visual impact */}
      <section className="relative overflow-hidden bg-[#0C0A09] min-h-[90vh] flex items-center">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-8 py-16 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">

          {/* Left copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs font-semibold tracking-widest uppercase font-heading">Now open · Same-day pickup</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
              Your Favorite<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400">
                Spirits &amp; More
              </span><br />
              Delivered Fast
            </h1>

            <p className="text-stone-400 text-lg max-w-md leading-relaxed font-light">
              Browse over {allProducts.length.toLocaleString()}{" "}products — beer, wine, spirits,
              CBD &amp; cigars. Free delivery on orders $99+.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-heading font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-[1.03] shadow-xl shadow-yellow-500/20 active:scale-95"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all backdrop-blur-sm"
              >
                Browse Beer 🍺
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              {["21+ Verified", "Free Returns", "Secure Checkout"].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-stone-500">
                  <ShieldCheck size={12} className="text-green-500" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — product showcase tiles */}
          <div className="hidden lg:grid grid-cols-3 gap-3">
            {[
              { emoji: "🥃", label: "Whiskey",  sub: "from $18", offset: "" },
              { emoji: "🍷", label: "Wine",     sub: "from $9",  offset: "mt-8" },
              { emoji: "🍺", label: "Beer",     sub: "from $4",  offset: "" },
              { emoji: "🌿", label: "CBD",      sub: "from $12", offset: "-mt-4" },
              { emoji: "🍹", label: "Mixers",   sub: "from $3",  offset: "mt-6" },
              { emoji: "💨", label: "Cigars",   sub: "from $6",  offset: "" },
            ].map((item) => (
              <Link
                key={item.label}
                href="/shop"
                className={`group glass glass-hover rounded-2xl p-5 flex flex-col items-center gap-2.5 text-center ${item.offset} cursor-pointer`}
              >
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{item.emoji}</span>
                <p className="text-white text-sm font-heading font-semibold">{item.label}</p>
                <p className="text-stone-500 text-[11px]">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Perks bar */}
      <section className="bg-stone-100 dark:bg-stone-900/60 border-y border-stone-200 dark:border-stone-800/60 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="bg-yellow-500/10 rounded-xl p-2.5 flex-shrink-0 border border-yellow-500/20">
                <Icon size={18} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-stone-900 dark:text-white text-sm font-heading font-semibold">{title}</p>
                <p className="text-stone-500 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-8 py-20 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-amber-600 dark:text-yellow-500 text-xs font-semibold uppercase tracking-widest mb-2 font-heading">Explore</p>
            <h2 className="font-heading text-3xl font-bold text-stone-900 dark:text-white">Shop by Category</h2>
          </div>
          <Link href="/shop" className="text-sm text-stone-500 hover:text-amber-600 dark:hover:text-yellow-400 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_DEPTS.map((dept) => (
            <Link
              key={dept.key}
              href="/shop"
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${dept.gradient} p-5 flex flex-col gap-3 hover:scale-[1.03] transition-all duration-200 shadow-xl cursor-pointer`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <span className="relative text-4xl group-hover:scale-110 transition-transform duration-200 drop-shadow-lg">{dept.emoji}</span>
              <div className="relative">
                <p className="text-white font-heading font-bold text-sm">{dept.label}</p>
                <p className="text-white/60 text-[10px] mt-0.5 leading-tight">{dept.desc}</p>
              </div>
              <ArrowRight size={13} className="relative text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all mt-auto" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-stone-100/80 dark:bg-stone-900/30 py-20 border-y border-stone-200 dark:border-stone-800/40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-amber-600 dark:text-yellow-500 text-xs font-semibold uppercase tracking-widest mb-2 font-heading">In Stock Now</p>
              <h2 className="font-heading text-3xl font-bold text-stone-900 dark:text-white">Featured Products</h2>
            </div>
            <Link href="/shop" className="text-sm text-stone-500 hover:text-amber-600 dark:hover:text-yellow-400 flex items-center gap-1 transition-colors">
              See all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.ItemUPC} product={p} />
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-heading font-bold px-8 py-3.5 rounded-2xl transition-all hover:scale-[1.03] shadow-lg shadow-yellow-500/20"
            >
              Browse All {allProducts.length.toLocaleString()} Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-8 py-20">
        <div className="glass rounded-3xl p-6 sm:p-12 text-center space-y-6 border border-yellow-500/10">
          <p className="text-5xl">🎉</p>
          <h2 className="font-heading text-2xl font-bold text-stone-900 dark:text-white">Get Exclusive Deals</h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-sm mx-auto text-sm leading-relaxed">
            Subscribe and be the first to hear about weekly specials, new arrivals and member-only discounts.
          </p>
          <NewsletterForm />
          <p className="text-stone-400 dark:text-stone-700 text-xs">Must be 21+ to subscribe. Unsubscribe anytime.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
