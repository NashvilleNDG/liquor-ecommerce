import { loadUsers } from "@/lib/users";
import { Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TIERS = [
  { name: "Platinum", min: 5000, badge: "bg-stone-900 text-white",                   icon: "💎" },
  { name: "Gold",     min: 1500, badge: "bg-amber-100 text-amber-800 border-amber-200", icon: "🥇" },
  { name: "Silver",   min: 500,  badge: "bg-stone-100 text-stone-600 border-stone-300", icon: "🥈" },
  { name: "Bronze",   min: 0,    badge: "bg-stone-50  text-stone-500 border-stone-200", icon: "🥉" },
];

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min) ?? TIERS[TIERS.length - 1];
}

export default function UsersPage() {
  const users = loadUsers().sort((a, b) => b.points - a.points);

  const tierCounts = TIERS.map((t) => ({
    ...t,
    count: users.filter((u) => getTier(u.points).name === t.name).length,
  }));

  const totalPoints = users.reduce((s, u) => s + (u.points ?? 0), 0);
  const avgPoints   = users.length ? Math.round(totalPoints / users.length) : 0;

  return (
    <div className="min-h-full bg-white">

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 rounded-xl p-2.5">
            <Users size={18} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Users</h1>
            <p className="text-sm text-stone-400 mt-0.5">{users.length} registered accounts</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-6 max-w-screen-2xl mx-auto">

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-sm transition-all">
            <p className="text-2xl font-bold text-stone-900">{users.length}</p>
            <p className="text-xs text-stone-400 mt-1">Total Users</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-sm transition-all">
            <p className="text-2xl font-bold text-amber-600">{avgPoints.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-1">Avg Loyalty Points</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-sm transition-all">
            <p className="text-2xl font-bold text-stone-900">{tierCounts[0].count}</p>
            <p className="text-xs text-stone-400 mt-1">💎 Platinum Members</p>
          </div>
          <div className="bg-white rounded-2xl border border-amber-200 p-5 hover:shadow-sm transition-all">
            <p className="text-2xl font-bold text-amber-600">{tierCounts[1].count}</p>
            <p className="text-xs text-stone-400 mt-1">🥇 Gold Members</p>
          </div>
        </div>

        {/* Tier breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
          <h2 className="text-base font-bold text-stone-900 mb-4">Loyalty Tier Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {tierCounts.map((t) => {
              const pct = users.length ? (t.count / users.length) * 100 : 0;
              return (
                <div key={t.name} className="bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-200 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-stone-900">{t.icon} {t.name}</span>
                    <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{t.min.toLocaleString()}+ pts</span>
                  </div>
                  <p className="text-3xl font-black text-stone-900">{t.count}</p>
                  <div className="mt-2">
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">{pct.toFixed(0)}% of users</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users table */}
        {users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center">
              <Users size={28} className="text-stone-400" />
            </div>
            <p className="text-stone-500 font-semibold">No users registered yet</p>
            <p className="text-stone-400 text-sm">Users will appear here after they sign up.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">User</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Joined</th>
                    <th className="text-right text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Points</th>
                    <th className="text-center text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((user) => {
                    const tier = getTier(user.points ?? 0);
                    return (
                      <tr key={user.id} className="hover:bg-stone-50 transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/users/${user.id}`} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-amber-700 text-xs font-bold">
                                {user.name?.charAt(0).toUpperCase() ?? "?"}
                              </span>
                            </div>
                            <span className="font-semibold text-stone-900 hover:text-amber-700 transition-colors">{user.name || "—"}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-stone-500 text-xs">{user.email}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-stone-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-stone-900 tabular-nums">{(user.points ?? 0).toLocaleString()}</span>
                          <span className="text-xs text-stone-400 ml-0.5">pts</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${tier.badge}`}>
                            {tier.icon} {tier.name}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
