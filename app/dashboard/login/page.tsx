"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wine, Eye, EyeOff, Lock, Mail, User, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get("from") ?? "/dashboard";

  const [mode,     setMode]     = useState<"loading" | "setup" | "login">("loading");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);

  // Check if admin account already exists
  useEffect(() => {
    fetch("/api/dashboard/setup")
      .then((r) => r.json())
      .then((d) => setMode(d.exists ? "login" : "setup"))
      .catch(() => setMode("login"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "setup") {
      if (password !== confirm) { setError("Passwords do not match"); return; }
      if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }
      setBusy(true);
      const res = await fetch("/api/dashboard/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Setup failed"); setBusy(false); return; }
      setMode("login");
      setBusy(false);
      setError("");
      return;
    }

    // Login
    setBusy(true);
    const res = await fetch("/api/dashboard/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Login failed"); setBusy(false); return; }
    router.push(from);
    router.refresh();
  }

  if (mode === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={28} className="text-amber-500 animate-spin" />
      </div>
    );
  }

  const inp = "w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Subtle premium pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(245,158,11,0.04),transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 ring-4 ring-amber-50">
            <Wine size={26} className="text-stone-900" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Stones River</h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <ShieldCheck size={12} className="text-amber-600" />
            <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">
              {mode === "setup" ? "Admin Setup" : "Admin Portal"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-xl shadow-stone-200/40">

          <h2 className="text-lg font-bold text-stone-900 mb-1">
            {mode === "setup" ? "First-Time Setup" : "Sign In"}
          </h2>
          <p className="text-stone-500 text-xs mb-6">
            {mode === "setup" ? "Create your administrator account" : "Enter your credentials to continue"}
          </p>

          {mode === "setup" && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-xs leading-relaxed">
                No admin account found. Create one now to secure your dashboard. This can only be done once.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name — setup only */}
            {mode === "setup" && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className={inp}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@stonesriver.com"
                  className={inp}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={mode === "setup" ? "Min. 8 characters" : "Your password"}
                  className={inp + " !pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password — setup only */}
            {mode === "setup" && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="Re-enter password"
                    className={inp}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-900 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2 shadow-md shadow-amber-500/20"
            >
              {busy ? (
                <><Loader2 size={16} className="animate-spin" /> {mode === "setup" ? "Creating…" : "Signing in…"}</>
              ) : (
                mode === "setup" ? "Create Admin Account" : "Sign In to Dashboard"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-stone-400 text-xs mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck size={11} /> Secure Access · Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
