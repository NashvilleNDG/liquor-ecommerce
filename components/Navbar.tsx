"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ShoppingCart, LayoutDashboard, Wine, Menu, X, Sun, Moon } from "lucide-react";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/shop",   label: "Shop" },
  { href: "/shop",   label: "Beer" },
  { href: "/shop",   label: "Wine" },
  { href: "/shop",   label: "Spirits" },
];

export default function Navbar() {
  const { state, dispatch } = useCart();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const count    = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isHome = pathname === "/";
  const isDark = resolvedTheme === "dark";

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${
      scrolled || !isHome
        ? "bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800/60 shadow-sm dark:shadow-xl dark:shadow-black/20"
        : "bg-transparent"
    }`}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="bg-yellow-500 rounded-xl p-1.5 shadow-lg shadow-yellow-500/20">
            <Wine size={17} className="text-stone-900" />
          </div>
          <span className="font-heading font-bold text-stone-900 dark:text-white text-lg tracking-tight">LiquorStore</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="px-4 py-2 rounded-xl text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-all duration-150 font-medium"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-all"
          >
            <LayoutDashboard size={13} />
            Admin
          </Link>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700/60 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all duration-150 cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Cart */}
          <button
            onClick={() => dispatch({ type: "TOGGLE_CART" })}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700/60 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all duration-150 cursor-pointer"
            aria-label="Cart"
          >
            <ShoppingCart size={17} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-stone-900 text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700/60 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all cursor-pointer"
            aria-label="Menu"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/98 dark:bg-stone-950/98 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800/60 px-4 pb-5 pt-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
          <div className="h-px bg-stone-200 dark:bg-stone-800 my-2" />
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-stone-500 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <LayoutDashboard size={14} />
            Admin Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
