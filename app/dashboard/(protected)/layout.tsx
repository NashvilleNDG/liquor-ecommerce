"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Wine, LogOut } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/dashboard/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full transition-transform duration-300 lg:transition-none
        lg:static lg:translate-x-0 lg:flex lg:flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between gap-3 px-4 h-14 bg-white border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-stone-600 hover:text-stone-900 transition-colors p-1.5 rounded-lg hover:bg-stone-100"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 rounded-lg p-1.5">
                <Wine size={13} className="text-stone-900" />
              </div>
              <span className="text-stone-900 font-bold text-sm">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
