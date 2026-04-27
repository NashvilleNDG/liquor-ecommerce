import { readFileSync, existsSync } from "fs";
import path from "path";
import { CreditCard, TrendingUp, ShoppingCart, Download } from "lucide-react";

export const dynamic = "force-dynamic";

interface Order {
  id: string; date: string; customer: string; email?: string;
  total: number; subtotal: number; discount: number; tax: number; delivery: number;
  status: string; mode: string; promoCode?: string;
}

function readOrders(): Order[] {
  try { const f = path.join(process.cwd(), "data", "orders.json"); if (!existsSync(f)) return []; return JSON.parse(readFileSync(f, "utf8")); }
  catch { return []; }
}

const STATUS_STYLE: Record<string, string> = {
  delivered: "bg-stone-900 text-white", out_for_delivery: "bg-amber-100 text-amber-800",
  processing: "bg-amber-50 text-amber-700", pending: "bg-stone-100 text-stone-600",
  cancelled: "bg-stone-100 text-stone-400",
};

export default function TransactionsPage() {
  const orders = readOrders().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const completed  = orders.filter(o => o.status !== "cancelled");
  const totalRev   = completed.reduce((s, o) => s + (o.total ?? 0), 0);
  const totalTax   = completed.reduce((s, o) => s + (o.tax ?? 0), 0);
  const totalDisc  = completed.reduce((s, o) => s + (o.discount ?? 0), 0);

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><CreditCard size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Transactions</h1>
              <p className="text-sm text-stone-400 mt-0.5">Complete payment history</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-screen-xl mx-auto space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: TrendingUp,   label: "Total Revenue",     value: `$${totalRev.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}` },
            { icon: ShoppingCart, label: "Transactions",      value: completed.length },
            { icon: CreditCard,   label: "Tax Collected",     value: `$${totalTax.toFixed(2)}` },
            { icon: Download,     label: "Total Discounts",   value: `-$${totalDisc.toFixed(2)}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="bg-amber-50 rounded-xl p-2.5 flex-shrink-0"><Icon size={15} className="text-amber-600" /></div>
                <div>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-bold text-stone-900 mt-1">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction log */}
        {orders.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
            <CreditCard size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-semibold">No transactions yet</p>
            <p className="text-stone-400 text-sm mt-1">Transactions will appear here after customers check out.</p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[960px]">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    {["Transaction ID","Date","Customer","Subtotal","Discount","Tax","Delivery","Total","Mode","Status"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-stone-700">#{o.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">
                        {o.date ? new Date(o.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-800 font-medium max-w-[120px] truncate">{o.customer || "Guest"}</td>
                      <td className="px-4 py-3 tabular-nums text-stone-700">${(o.subtotal??0).toFixed(2)}</td>
                      <td className="px-4 py-3 tabular-nums text-amber-600">{o.discount > 0 ? `-$${o.discount.toFixed(2)}` : "—"}</td>
                      <td className="px-4 py-3 tabular-nums text-stone-700">${(o.tax??0).toFixed(2)}</td>
                      <td className="px-4 py-3 tabular-nums text-stone-700">{o.delivery > 0 ? `$${o.delivery.toFixed(2)}` : "—"}</td>
                      <td className="px-4 py-3 font-bold text-stone-900 tabular-nums">${(o.total??0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${o.mode==="delivery" ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-600"}`}>
                          {o.mode === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status]??""}`}>
                          {o.status?.replace(/_/g," ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
