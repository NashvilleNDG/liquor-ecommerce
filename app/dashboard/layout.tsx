"use client";

import { useState } from "react";
import { Menu, Wine } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-950 flex">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — overlay on mobile, static on md+ */}
      <div
        className={`fixed md:static top-0 left-0 z-50 h-full transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex md:flex-col`}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 bg-stone-900 border-b border-stone-800 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-stone-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-stone-800"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-500 rounded-lg p-1">
              <Wine size={13} className="text-stone-900" />
            </div>
            <span className="text-white font-bold text-sm">Admin Panel</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
