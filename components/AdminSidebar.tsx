"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wine, LayoutDashboard, Package, BarChart2,
  AlertTriangle, ShoppingBag, ArrowLeft, X
} from "lucide-react";

const NAV = [
  { href: "/dashboard",            icon: LayoutDashboard, label: "Overview"   },
  { href: "/dashboard/inventory",  icon: Package,         label: "Inventory"  },
  { href: "/dashboard/analytics",  icon: BarChart2,       label: "Analytics"  },
  { href: "/dashboard/low-stock",  icon: AlertTriangle,   label: "Low Stock"  },
];

interface Props {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: Props) {
  const path = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-stone-950 border-r border-stone-800 flex flex-col h-full min-h-screen">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-stone-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 rounded-lg p-1.5">
            <Wine size={16} className="text-stone-900" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">LiquorStore</p>
            <p className="text-stone-600 text-[10px]">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-stone-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-stone-800"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                  : "text-stone-400 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-stone-800 space-y-1">
        <Link
          href="/shop"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-all"
        >
          <ShoppingBag size={16} />
          View Store
        </Link>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </aside>
  );
}
