import Link from "next/link";
import { fetchProducts } from "@/lib/kanji-api";
import { deduplicateByVariant } from "@/lib/product-variants";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import CountryCarousel from "@/components/CountryCarousel";
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

const PAIRINGS = [
  { name: "Cheese",           img: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=cheese"         },
  { name: "Meat",             img: "https://images.unsplash.com/photo-1558030006-450675393462?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=meat"           },
  { name: "Poultry",          img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c2?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=poultry"        },
  { name: "Fish",             img: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=fish"           },
  { name: "Fruits & Veggies", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=fruits_veggies" },
  { name: "Dessert",          img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=dessert"        },
  { name: "Italian",          img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=italian"        },
  { name: "Asian",            img: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=asian"          },
  { name: "Mexican",          img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=mexican"        },
  { name: "American",         img: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=american"       },
  { name: "Indian",           img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=indian"         },
  { name: "BBQ",              img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=300&h=300&fit=crop&q=80", href: "/shop?pairing=bbq"            },
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

      {/* ── Page wrapper ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">

        {/* ── Hero 3-tile ── */}
        <section className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Shop Wine",    img: "/shop-wine.webp",    dept: "Wines"  },
            { label: "Shop Spirits", img: "/shop-spirits.webp", dept: "LIQUOR" },
            { label: "Shop Beer",    img: "/shop-beer.webp",    dept: "BEER"   },
          ].map(({ label, img, dept }) => (
            <Link
              key={label}
              href={`/shop?dept=${dept}`}
              className="group relative bg-white flex items-center justify-center overflow-hidden rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
              style={{ aspectRatio: "1002/434" }}
            >
              <img
                src={img}
                alt={label}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-crimson scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </section>

        {/* ── Promo banner ── */}
        <div className="bg-crimson text-white text-center py-3 px-4 mt-4 rounded-lg">
          <p className="text-sm font-semibold">
            🎉 <span className="font-bold">Free Delivery</span> on orders $99+ · Same-day pickup available · Must be 21+
          </p>
        </div>

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
          <SectionHeading title="Countries" href="/shop?country=ALL" />
          <CountryCarousel />
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
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            {PAIRINGS.map(({ name, img, href }) => (
              <Link
                key={name}
                href={href}
                className="flex-shrink-0 group relative w-32 h-32 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-200"
              >
                <img
                  src={img}
                  alt={name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-2 left-0 right-0 text-center text-white text-xs font-bold drop-shadow px-1 leading-tight">
                  {name}
                </span>
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
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
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
