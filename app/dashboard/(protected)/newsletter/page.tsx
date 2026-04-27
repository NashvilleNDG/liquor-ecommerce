import { readFileSync, existsSync } from "fs";
import path from "path";
import { Mail, Users, Download } from "lucide-react";

export const dynamic = "force-dynamic";

function loadSubscribers(): string[] {
  try {
    const file = path.join(process.cwd(), "data", "subscribers.json");
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch { return []; }
}

export default function NewsletterPage() {
  const subscribers = loadSubscribers();

  const domains = subscribers.reduce<Record<string, number>>((acc, email) => {
    const domain = email.split("@")[1] ?? "unknown";
    acc[domain] = (acc[domain] ?? 0) + 1;
    return acc;
  }, {});
  const topDomains = Object.entries(domains).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="min-h-full bg-white">

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5">
              <Mail size={18} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Newsletter</h1>
              <p className="text-sm text-stone-400 mt-0.5">{subscribers.length} subscribers</p>
            </div>
          </div>
          {subscribers.length > 0 && (
            <a
              href={`data:text/plain,${encodeURIComponent(subscribers.join("\n"))}`}
              download="newsletter-subscribers.txt"
              className="flex items-center gap-2 text-sm font-semibold bg-stone-900 hover:bg-stone-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Download size={14} /> Export
            </a>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-6 max-w-screen-2xl mx-auto">

        {/* Stats — unified theme */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-sm transition-all">
            <div className="flex items-start gap-4">
              <div className="bg-amber-50 rounded-xl p-2.5 flex-shrink-0">
                <Mail size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{subscribers.length}</p>
                <p className="text-xs text-stone-400 mt-0.5">Total Subscribers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-sm transition-all">
            <div className="flex items-start gap-4">
              <div className="bg-amber-50 rounded-xl p-2.5 flex-shrink-0">
                <Users size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{topDomains.length}</p>
                <p className="text-xs text-stone-400 mt-0.5">Email Domains</p>
              </div>
            </div>
          </div>
          {topDomains[0] && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="bg-amber-50 rounded-xl p-2.5 flex-shrink-0">
                  <Mail size={18} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-stone-900 truncate">@{topDomains[0][0]}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Most Common Domain</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Domain breakdown */}
          {topDomains.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
              <h2 className="text-base font-bold text-stone-900 mb-4">Top Email Domains</h2>
              <div className="space-y-3">
                {topDomains.map(([domain, count]) => {
                  const pct = subscribers.length ? (count / subscribers.length) * 100 : 0;
                  return (
                    <div key={domain}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-700 font-medium">@{domain}</span>
                        <span className="text-stone-400 tabular-nums">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subscriber list */}
          <div className={`bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 ${topDomains.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <h2 className="text-base font-bold text-stone-900 mb-4">Subscriber List</h2>
            {subscribers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
                  <Mail size={22} className="text-stone-400" />
                </div>
                <p className="text-stone-400 text-sm text-center">No subscribers yet.<br/>Add a newsletter form to your homepage.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {subscribers.map((email, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-stone-200 hover:border-amber-200 transition-colors">
                    <div className="w-7 h-7 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 text-[11px] font-bold">{email[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-stone-700 truncate">{email}</span>
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
