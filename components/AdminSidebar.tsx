"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, AlertTriangle, BarChart2,
  ShoppingCart, Tag, Percent, CalendarDays,
  ImageIcon, Utensils, Users, Mail, X,
  ArrowLeft, ShoppingBag, Wine, LogOut,
  Settings, Truck, Gift, Star, Image,
  Megaphone, CreditCard, FileText, UserCog, TicketPercent,
  TrendingUp,
} from "lucide-react";

const NAV_GROUPS: {
  label: string;
  items: { href: string; icon: React.ElementType; label: string; exact?: boolean }[];
}[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard", exact: true },
    ],
  },
  {
    label: "Orders",
    items: [
      { href: "/dashboard/orders",       icon: ShoppingCart, label: "All Orders"   },
      { href: "/dashboard/transactions", icon: CreditCard,   label: "Transactions" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/dashboard/inventory",  icon: Package,       label: "Products"       },
      { href: "/dashboard/low-stock",  icon: AlertTriangle, label: "Low Stock"      },
      { href: "/dashboard/images",     icon: ImageIcon,     label: "Product Images" },
      { href: "/dashboard/pairings",   icon: Utensils,      label: "Food Pairings"  },
    ],
  },
  {
    label: "Promotions",
    items: [
      { href: "/dashboard/deals",       icon: Tag,            label: "Deals"        },
      { href: "/dashboard/discounts",   icon: Percent,        label: "Discounts"    },
      { href: "/dashboard/promo-codes", icon: TicketPercent,  label: "Promo Codes"  },
      { href: "/dashboard/gift-cards",  icon: Gift,           label: "Gift Cards"   },
      { href: "/dashboard/events",      icon: CalendarDays,   label: "Events"       },
      { href: "/dashboard/banners",     icon: Image,          label: "Banners"      },
    ],
  },
  {
    label: "Customers",
    items: [
      { href: "/dashboard/users",      icon: Users,          label: "Users"      },
      { href: "/dashboard/reviews",    icon: ShoppingBag,    label: "Reviews"    },
      { href: "/dashboard/newsletter", icon: Mail,           label: "Newsletter" },
      { href: "/dashboard/campaigns",  icon: Megaphone,      label: "Campaigns"  },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
      { href: "/dashboard/delivery", icon: Truck,    label: "Delivery" },
      { href: "/dashboard/loyalty",  icon: Star,     label: "Loyalty"  },
    ],
  },
  {
    label: "Reports",
    items: [
      { href: "/dashboard/analytics", icon: BarChart2,  label: "Analytics"       },
      { href: "/dashboard/reports",   icon: TrendingUp, label: "Revenue Reports" },
    ],
  },
  {
    label: "Team",
    items: [
      { href: "/dashboard/team", icon: UserCog, label: "Team Members" },
    ],
  },
];

interface Props { onClose?: () => void; onLogout?: () => void }

export default function AdminSidebar({ onClose, onLogout }: Props) {
  const path = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? path === href : path === href || path.startsWith(href + "/");
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-stone-950 flex flex-col h-full min-h-screen select-none">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-stone-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wine size={15} className="text-stone-900" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">Stones River</p>
            <p className="text-stone-500 text-[10px] tracking-wide uppercase">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-stone-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-stone-800 flex-shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label, exact }) => {
                const active = isActive(href, exact);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-amber-500/15 text-amber-400"
                          : "text-stone-400 hover:text-white hover:bg-stone-800/80"
                      }`}
                    >
                      <Icon size={15} className={active ? "text-amber-400" : "text-stone-500"} />
                      {label}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-stone-800 space-y-0.5">
        <Link
          href="/shop"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-200 hover:bg-stone-800/80 transition-all"
        >
          <ShoppingBag size={15} />
          View Store
        </Link>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-200 hover:bg-stone-800/80 transition-all"
        >
          <ArrowLeft size={15} />
          Back to Home
        </Link>
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
