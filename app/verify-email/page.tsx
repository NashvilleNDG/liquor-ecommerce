"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Wine, CheckCircle, RefreshCw } from "lucide-react";

function VerifyForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const email        = params.get("email") ?? "";
  const password     = params.get("pw") ?? ""; // passed from register page for auto-signin
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent]   = useState(false);
  const [done, setDone]       = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Invalid code"); return; }
      setDone(true);
      // Auto sign-in if password was passed
      if (password) {
        await signIn("credentials", { email, password, redirect: false });
      }
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true); setResent(false);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResending(false); setResent(true);
    setTimeout(() => setResent(false), 4000);
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-2xl p-10 shadow-sm text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-900 mb-2">Email Verified!</h2>
        <p className="text-stone-500 text-sm">Redirecting you to the shop…</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-full bg-crimson flex items-center justify-center mb-4">
          <Wine size={28} className="text-white" />
        </div>
        <h1 className="font-bold text-2xl text-stone-900">Check your email</h1>
        <p className="text-stone-500 text-sm mt-1 text-center">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-full text-center text-3xl font-mono tracking-widest bg-stone-50 border border-stone-200 focus:border-crimson focus:outline-none rounded-xl px-4 py-4 transition-colors"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-crimson hover:bg-crimson/90 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Verify Email"}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>

      <div className="mt-6 text-center">
        <p className="text-stone-500 text-sm">Didn&apos;t get a code?</p>
        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-1 text-sm text-crimson font-medium hover:underline flex items-center gap-1 mx-auto"
        >
          <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
          {resending ? "Sending…" : resent ? "Sent! Check your inbox." : "Resend code"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white py-16 px-4">
        <Suspense fallback={<div className="max-w-md mx-auto text-center text-stone-400 py-16">Loading…</div>}>
          <VerifyForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
