"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Save, LogOut, User, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

const inp = "w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-crimson/50 transition-colors placeholder-stone-400";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName]       = useState(session?.user?.name ?? "");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), address: address.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      await update({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6">
        <h2 className="font-bold text-stone-900 text-base mb-5">Profile Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1"><User size={11} /> Full Name</span>
            </label>
            <input className={inp} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1"><Mail size={11} /> Email</span>
            </label>
            <input className={`${inp} bg-stone-50 text-stone-400 cursor-not-allowed`} value={session?.user?.email ?? ""} readOnly />
            <p className="text-xs text-stone-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1"><Phone size={11} /> Phone</span>
            </label>
            <input className={inp} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(615) 555-0100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1"><MapPin size={11} /> Default Delivery Address</span>
            </label>
            <input className={inp} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Murfreesboro, TN 37129" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                <CheckCircle size={14} /> Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Sign out */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h3 className="font-bold text-stone-900 text-sm mb-3">Account</h3>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
        >
          <LogOut size={14} /> Sign out of my account
        </button>
      </div>
    </div>
  );
}
