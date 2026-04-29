"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Heart, Settings, Star } from "lucide-react";

const NAV = [
  { href: "/account",          label: "Overview",       icon: User },
  { href: "/account/orders",   label: "My Orders",      icon: ShoppingBag },
  { href: "/account/wishlist", label: "Wishlist",       icon: Heart },
  { href: "/account/reviews",  label: "My Reviews",     icon: Star },
  { href: "/account/profile",  label: "Profile",        icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/account");
  }, [status, router]);

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!session) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900">My Account</h1>
            <p className="text-stone-500 text-sm mt-0.5">Welcome back, {session.user?.name}</p>
          </div>

          <div className="flex gap-6 items-start">
            {/* Sidebar nav */}
            <nav className="hidden md:flex flex-col gap-1 w-48 flex-shrink-0">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-crimson text-white"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile nav */}
            <div className="md:hidden w-full overflow-x-auto -mx-4 px-4 pb-2 mb-2">
              <div className="flex gap-2 min-w-max">
                {NAV.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        active ? "bg-crimson text-white" : "bg-white border border-stone-200 text-stone-600"
                      }`}
                    >
                      <Icon size={13} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Page content */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
