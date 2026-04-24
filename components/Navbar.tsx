"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ShoppingCart, User, Search, Phone, Mail, MapPin,
  ChevronDown, Menu, X, LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useSession, signOut } from "next-auth/react";

/* ── Mega-menu data ─────────────────────────────────────── */
/* Each entry is [label, href] */
const WINE_MENU: Record<string, [string, string][]> = {
  "By Style":    [
    ["Red",                   "/shop?dept=Wines&q=red"],
    ["White",                 "/shop?dept=Wines&q=white"],
    ["Rosé & Blush",          "/shop?dept=Wines&q=rose"],
    ["Champagne & Sparkling", "/shop?dept=Wines&q=champagne"],
    ["Dessert & Port",        "/shop?dept=Wines&q=port"],
    ["Other Wines",           "/shop?dept=Wines"],
  ],
  "By Varietal": [
    ["Cabernet Sauvignon", "/shop?dept=Wines&q=cabernet"],
    ["Chardonnay",         "/shop?dept=Wines&q=chardonnay"],
    ["Sauvignon Blanc",    "/shop?dept=Wines&q=sauvignon"],
    ["Red Blends",         "/shop?dept=Wines&q=blend"],
    ["Pinot Noir",         "/shop?dept=Wines&q=pinot+noir"],
    ["Pinot Grigio",       "/shop?dept=Wines&q=pinot+grigio"],
  ],
  "By Country": [
    ["France",        "/shop?dept=Wines&q=france"],
    ["Italy",         "/shop?dept=Wines&q=italy"],
    ["Spain",         "/shop?dept=Wines&q=spain"],
    ["Germany",       "/shop?dept=Wines&q=germany"],
    ["Argentina",     "/shop?dept=Wines&q=argentina"],
    ["United States", "/shop?dept=Wines&q=usa"],
    ["New Zealand",   "/shop?dept=Wines&q=new+zealand"],
  ],
  "Explore": [
    ["New Arrivals", "/shop?dept=Wines&sort=name"],
    ["Staff Picks",  "/shop?dept=Wines&sort=stock_desc"],
    ["On Sale",      "/shop?dept=Wines&sort=price_asc"],
    ["All Wine",     "/shop?dept=Wines"],
  ],
};

const SPIRITS_MENU: Record<string, [string, string][]> = {
  "By Type": [
    ["Vodka",             "/shop?dept=LIQUOR&q=vodka"],
    ["Whiskey",           "/shop?dept=LIQUOR&q=whiskey"],
    ["Sake",              "/shop?dept=LIQUOR&q=sake"],
    ["Tequila",           "/shop?dept=LIQUOR&q=tequila"],
    ["Rum",               "/shop?dept=LIQUOR&q=rum"],
    ["Gin",               "/shop?dept=LIQUOR&q=gin"],
    ["Brandy",            "/shop?dept=LIQUOR&q=brandy"],
    ["Liqueur",           "/shop?dept=LIQUOR&q=liqueur"],
    ["Scotch",            "/shop?dept=LIQUOR&q=scotch"],
    ["Single Malt",       "/shop?dept=LIQUOR&q=single+malt"],
  ],
  "By Country": [
    ["United States", "/shop?dept=LIQUOR&q=american"],
    ["France",        "/shop?dept=LIQUOR&q=french"],
    ["Ireland",       "/shop?dept=LIQUOR&q=irish"],
    ["Japan",         "/shop?dept=LIQUOR&q=japanese"],
    ["Italy",         "/shop?dept=LIQUOR&q=italian"],
    ["Mexico",        "/shop?dept=LIQUOR&q=tequila"],
  ],
  "Explore": [
    ["New Arrivals",  "/shop?dept=LIQUOR&sort=name"],
    ["Staff Picks",   "/shop?dept=LIQUOR&sort=stock_desc"],
    ["On Sale",       "/shop?dept=LIQUOR&sort=price_asc"],
    ["All Spirits",   "/shop?dept=LIQUOR"],
  ],
};

const BEER_MENU: Record<string, [string, string][]> = {
  "By Type": [
    ["IPA",          "/shop?dept=BEER&q=ipa"],
    ["Hard Seltzer", "/shop?dept=BEER&q=seltzer"],
    ["Ale",          "/shop?dept=BEER&q=ale"],
    ["Lager",        "/shop?dept=BEER&q=lager"],
    ["Pilsner",      "/shop?dept=BEER&q=pilsner"],
    ["Stout",        "/shop?dept=BEER&q=stout"],
  ],
  "Explore": [
    ["New Arrivals", "/shop?dept=BEER&sort=name"],
    ["Staff Picks",  "/shop?dept=BEER&sort=stock_desc"],
    ["On Sale",      "/shop?dept=BEER&sort=price_asc"],
    ["All Beer",     "/shop?dept=BEER"],
  ],
};

const SHOP_ALL_MENU: Record<string, [string, string][]> = {
  "Shop by Brand": [
    ["All Products",    "/shop"],
    ["Wine",            "/shop?dept=Wines"],
    ["Spirits",         "/shop?dept=LIQUOR"],
    ["Beer",            "/shop?dept=BEER"],
  ],
};

const EXPLORE_MENU: Record<string, [string, string][]> = {
  "Discover": [
    ["New Arrivals",     "/shop?sort=name"],
    ["Best Sellers",     "/shop?sort=stock_desc"],
    ["On Sale",          "/shop?sort=price_asc"],
    ["Under $20",        "/shop?max=20"],
    ["Our Deals",        "/shop?sort=price_asc"],
  ],
  "Browse": [
    ["CBD",              "/shop?dept=CBD"],
    ["Mixers",           "/shop?dept=MIXERS"],
    ["Cigars",           "/shop?dept=CIGARS"],
    ["Cigarettes",       "/shop?dept=Cigarette"],
  ],
};

type MenuData = Record<string, [string, string][]>;

/* ── MegaMenu component ─────────────────────────────────── */
function MegaMenu({ data }: { data: MenuData }) {
  return (
    <div className="absolute top-full left-0 z-50 bg-white border-t-2 border-crimson shadow-2xl min-w-max">
      <div className="flex gap-10 p-8">
        {Object.entries(data).map(([group, items]) => (
          <div key={group} className="min-w-[140px]">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">{group}</p>
            <ul className="space-y-1.5">
              {items.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-stone-700 hover:text-crimson transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── NavItem with dropdown ──────────────────────────────── */
function NavItem({ label, menu, href }: { label: string; menu?: MenuData; href?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!menu) {
    return (
      <Link
        href={href ?? "/shop"}
        className="px-3 py-5 text-sm font-medium text-stone-700 hover:text-crimson border-b-2 border-transparent hover:border-crimson transition-all whitespace-nowrap"
      >
        {label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`flex items-center gap-1 px-3 py-5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
          open
            ? "text-crimson border-crimson"
            : "text-stone-700 hover:text-crimson border-transparent hover:border-crimson"
        }`}
      >
        {label}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <MegaMenu data={menu} />}
    </div>
  );
}

/* ── Main Navbar ────────────────────────────────────────── */
export default function Navbar() {
  const { state, dispatch } = useCart();
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  return (
    <>
      {/* ── Top contact bar ── */}
      <div className="bg-black text-white text-xs">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-0">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-0.5">
            <a href="tel:6158951888" className="flex items-center gap-1.5 hover:text-crimson transition-colors">
              <Phone size={11} /> (615) 895-1888
            </a>
            <a href="mailto:stonesrivertotalbeverage@gmail.com" className="flex items-center gap-1.5 hover:text-crimson transition-colors">
              <Mail size={11} /> stonesrivertotalbeverage@gmail.com
            </a>
            <span className="hidden sm:flex items-center gap-1.5 text-stone-400">
              <MapPin size={11} /> 208 North Thompson Lane, Murfreesboro, TN 37129
            </span>
          </div>
          <Link href="/dashboard" className="hidden sm:flex items-center gap-1 text-stone-400 hover:text-white transition-colors">
            <LayoutDashboard size={11} /> Admin
          </Link>
        </div>
      </div>

      {/* ── Main header ── */}
      <div className="bg-black sticky top-0 z-40 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20 gap-4">

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden text-white hover:text-stone-300 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-white font-heading font-extrabold text-xl sm:text-2xl tracking-wide leading-tight">
                  STONES RIVER
                </div>
                <div className="text-crimson text-[10px] font-bold tracking-[0.25em] uppercase">
                  TOTAL BEVERAGES
                </div>
              </div>
            </Link>

            {/* Right: Login + Cart + Search */}
            <div className="flex items-center gap-3">
              {session ? (
                <div ref={userMenuRef} className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 text-white text-sm hover:text-stone-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-crimson border-2 border-crimson flex items-center justify-center text-white text-xs font-bold">
                      {session.user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <span className="text-xs hidden md:block">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50">
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-crimson transition-colors"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-crimson transition-colors border-t border-stone-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 text-white text-sm hover:text-stone-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-stone-600 flex items-center justify-center">
                    <User size={15} />
                  </div>
                  <span className="text-xs hidden md:block">Login/Sign Up</span>
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => dispatch({ type: "TOGGLE_CART" })}
                className="relative w-9 h-9 rounded-full border-2 border-stone-600 hover:border-crimson flex items-center justify-center text-white transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={15} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-crimson text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>

              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen((o) => !o)}
                className="w-9 h-9 rounded-full border-2 border-stone-600 hover:border-crimson flex items-center justify-center text-white transition-colors"
                aria-label="Search"
              >
                <Search size={15} />
              </button>
            </div>
          </div>

          {/* Search bar (expandable) */}
          {searchOpen && (
            <div className="pb-3 max-w-2xl mx-auto w-full">
              <SearchAutocomplete />
            </div>
          )}
        </div>
      </div>

      {/* ── Mega nav bar (desktop) ── */}
      <nav className="hidden lg:block bg-white border-b border-stone-200 sticky top-20 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center">
          <NavItem label="Home" href="/" />
          <NavItem label="Shop All" menu={SHOP_ALL_MENU} />
          <NavItem label="Wine" menu={WINE_MENU} />
          <NavItem label="Spirits" menu={SPIRITS_MENU} />
          <NavItem label="Beer" menu={BEER_MENU} />
          <NavItem label="Our Deals" href="/shop?sort=price_asc" />
          <NavItem label="Staff Picks" href="/shop?sort=stock_desc" />
          <NavItem label="On Sale" href="/shop?sort=price_asc&max=30" />
          <NavItem label="Delivery" href="/delivery" />
          <NavItem label="Explore" menu={EXPLORE_MENU} />
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="bg-white w-80 max-w-full h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="bg-black px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-white font-heading font-extrabold text-lg">STONES RIVER</div>
                <div className="text-crimson text-[9px] font-bold tracking-widest">TOTAL BEVERAGES</div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white">
                <X size={22} />
              </button>
            </div>

            <div className="p-4 space-y-1 flex-1">
              {[
                { label: "Home",              href: "/" },
                { label: "Shop All",          href: "/shop" },
                { label: "Wine",              href: "/shop?dept=Wines" },
                { label: "Spirits",           href: "/shop?dept=LIQUOR" },
                { label: "Beer",              href: "/shop?dept=BEER" },
                { label: "Our Deals",         href: "/shop?sort=price_asc" },
                { label: "Staff Picks",       href: "/shop?sort=stock_desc" },
                { label: "On Sale",           href: "/shop?sort=price_asc&max=30" },
                { label: "New Arrivals",      href: "/shop?sort=name" },
                { label: "Under $20",         href: "/shop?max=20" },
                { label: "CBD & Mixers",      href: "/shop?dept=CBD" },
                { label: "Cigars",            href: "/shop?dept=CIGARS" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-stone-700 hover:text-crimson hover:bg-red-50 rounded-lg transition-colors border-b border-stone-100"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="border-t border-stone-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Phone size={14} className="text-crimson" /> (615) 895-1888
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Mail size={14} className="text-crimson" /> stonesrivertotalbeverage@gmail.com
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-crimson transition-colors"
              >
                <LayoutDashboard size={14} /> Admin Dashboard
              </Link>
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
