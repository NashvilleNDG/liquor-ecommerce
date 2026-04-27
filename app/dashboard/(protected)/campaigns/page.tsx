import { readFileSync, existsSync } from "fs";
import path from "path";
import { Megaphone, Users, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function loadSubscribers(): string[] {
  try { const f = path.join(process.cwd(), "data", "subscribers.json"); if (!existsSync(f)) return []; return JSON.parse(readFileSync(f, "utf8")); }
  catch { return []; }
}
function loadUsers(): { id: string; name: string; email: string; points: number }[] {
  try { const f = path.join(process.cwd(), "data", "users.json"); if (!existsSync(f)) return []; return JSON.parse(readFileSync(f, "utf8")); }
  catch { return []; }
}

const TEMPLATES = [
  { id: "welcome",    label: "Welcome Email",       desc: "Send to new signups",            icon: "👋", audience: "New users" },
  { id: "promo",      label: "Promo Announcement",  desc: "Announce a deal or discount",    icon: "🎉", audience: "All subscribers" },
  { id: "restock",    label: "Back In Stock",        desc: "Notify about restocked products",icon: "📦", audience: "All subscribers" },
  { id: "loyalty",    label: "Loyalty Points Update",desc: "Remind customers of their points",icon: "⭐", audience: "Registered users" },
  { id: "event",      label: "Event Invitation",     desc: "Invite customers to an event",   icon: "🎊", audience: "All subscribers" },
  { id: "winback",    label: "Win-Back Campaign",    desc: "Re-engage inactive customers",   icon: "💌", audience: "Inactive users" },
];

export default function CampaignsPage() {
  const subscribers = loadSubscribers();
  const users       = loadUsers();

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 rounded-xl p-2.5"><Megaphone size={18} className="text-amber-600" /></div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Email Campaigns</h1>
            <p className="text-sm text-stone-400 mt-0.5">Reach your customers directly</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-screen-xl mx-auto space-y-6">

        {/* Audience summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: Mail,  label: "Newsletter Subscribers", value: subscribers.length, href: "/dashboard/newsletter" },
            { icon: Users, label: "Registered Users",       value: users.length,       href: "/dashboard/users"      },
            { icon: Mail,  label: "Total Reachable",        value: new Set([...subscribers, ...users.map(u=>u.email)]).size, href: null },
          ].map(({ icon: Icon, label, value, href }) => {
            const card = (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-sm transition-all flex items-start gap-3">
                <div className="bg-amber-50 rounded-xl p-2.5 flex-shrink-0"><Icon size={16} className="text-amber-600" /></div>
                <div>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
                </div>
                {href && <ArrowUpRight size={14} className="text-stone-300 ml-auto mt-1" />}
              </div>
            );
            return href ? <Link key={label} href={href}>{card}</Link> : <div key={label}>{card}</div>;
          })}
        </div>

        {/* Campaign templates */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-stone-900 mb-1">Campaign Templates</h2>
          <p className="text-xs text-stone-400 mb-5">Choose a template to prepare your campaign. Connect an email provider (e.g. Mailchimp, SendGrid) to send.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map(t => (
              <div key={t.id} className="bg-white border border-stone-200 rounded-xl p-4 hover:border-amber-300 hover:bg-amber-50/30 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <p className="font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{t.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{t.desc}</p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {t.audience}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 flex items-start gap-4">
          <div className="text-2xl">⚡</div>
          <div>
            <h3 className="font-bold text-amber-900">Connect an Email Provider to Send Campaigns</h3>
            <p className="text-sm text-amber-800 mt-1">
              Your subscriber list is ready. To send emails, connect SendGrid, Mailchimp, Resend, or any other provider
              via your <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env</code> file.
            </p>
            <div className="mt-3 flex gap-3">
              <Link href="/dashboard/newsletter" className="text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1">
                View Subscribers <ArrowUpRight size={13} />
              </Link>
              <Link href="/dashboard/settings" className="text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1">
                Store Settings <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
