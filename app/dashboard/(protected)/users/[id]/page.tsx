import { loadUsers } from "@/lib/users";
import { readFileSync, existsSync } from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Mail, Calendar, Star, ShoppingCart, DollarSign, Package } from "lucide-react";

export const dynamic = "force-dynamic";

interface Order {
  id: string; date: string; customer: string; email?: string;
  total: number; status: string; items: { name: string; qty: number; price: number }[];
}

function readOrders(): Order[] {
  try {
    const f = path.join(process.cwd(), "data", "orders.json");
    if (!existsSync(f)) return [];
    return JSON.parse(readFileSync(f, "utf8"));
  } catch { return []; }
}

const TIERS = [
  { name: "Platinum", min: 5000, badge: "bg-stone-900 text-white" },
  { name: "Gold",     min: 1500, badge: "bg-amber-100 text-amber-800 border border-amber-200" },
  { name: "Silver",   min: 500,  badge: "bg-stone-100 text-stone-600 border border-stone-300" },
  { name: "Bronze",   min: 0,    badge: "bg-stone-50 text-stone-500 border border-stone-200" },
];
function getTier(pts: number) { return TIERS.find(t => pts >= t.min) ?? TIERS[TIERS.length - 1]; }

const STATUS_STYLE: Record<string, string> = {
  delivered: "bg-stone-900 text-white", out_for_delivery: "bg-amber-100 text-amber-800",
  processing: "bg-amber-50 text-amber-700", pending: "bg-stone-100 text-stone-600",
  cancelled: "bg-stone-100 text-stone-400",
};

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const user = loadUsers().find(u => u.id === params.id);
  if (!user) notFound();

  const allOrders   = readOrders();
  const userOrders  = allOrders.filter(o =>
    o.email?.toLowerCase() === user.email.toLowerCase() ||
    o.customer?.toLowerCase() === user.name?.toLowerCase()
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tier            = getTier(user.points ?? 0);
  const totalSpent      = userOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total ?? 0), 0);
  const completedOrders = userOrders.filter(o => o.status === "delivered").length;
  const avgOrderValue   = completedOrders ? totalSpent / completedOrders : 0;

  // Favourite product
  const productMap = new Map<string, number>();
  for (const o of userOrders) for (const item of o.items ?? []) {
    productMap.set(item.name, (productMap.get(item.name) ?? 0) + item.qty);
  }
  const favProduct = [...productMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/users" className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-amber-700 font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">{user.name}</h1>
            <p className="text-sm text-stone-400">{user.email}</p>
          </div>
          <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${tier.badge}`}>
            {tier.name}
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-screen-xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: DollarSign, label: "Total Spent",     value: `$${totalSpent.toFixed(2)}` },
            { icon: ShoppingCart, label: "Orders",        value: userOrders.length },
            { icon: Star,        label: "Loyalty Points", value: (user.points ?? 0).toLocaleString() + " pts" },
            { icon: Package,     label: "Avg Order",      value: `$${avgOrderValue.toFixed(2)}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="bg-amber-50 rounded-xl p-2 flex-shrink-0"><Icon size={15} className="text-amber-600" /></div>
                <div>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-bold text-stone-900 mt-0.5">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile info */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 space-y-4">
            <h2 className="font-bold text-stone-900">Profile</h2>
            {[
              { icon: User,     label: "Name",    value: user.name },
              { icon: Mail,     label: "Email",   value: user.email },
              { icon: Calendar, label: "Joined",  value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Unknown" },
              { icon: Star,     label: "Points",  value: `${(user.points ?? 0).toLocaleString()} pts (${tier.name})` },
              ...(favProduct ? [{ icon: Package,  label: "Favourite", value: favProduct }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="bg-stone-50 rounded-lg p-1.5 flex-shrink-0 mt-0.5"><Icon size={13} className="text-stone-500" /></div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">{label}</p>
                  <p className="text-sm text-stone-800 font-medium mt-0.5 break-all">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order history */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="font-bold text-stone-900">Order History ({userOrders.length})</h2>
            </div>
            {userOrders.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-sm">No orders yet</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {userOrders.map(order => (
                  <div key={order.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors">
                    <div>
                      <p className="font-mono text-xs font-bold text-stone-700">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{order.date ? new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
                    </div>
                    <div className="flex-1 min-w-0 px-4">
                      <p className="text-xs text-stone-500 truncate">{(order.items ?? []).map(i => i.name).join(", ")}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-stone-900 text-sm">${(order.total ?? 0).toFixed(2)}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLE[order.status] ?? "bg-stone-100 text-stone-500"}`}>
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
