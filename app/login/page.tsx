"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Wine } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-full bg-crimson flex items-center justify-center mb-4">
          <Wine size={28} className="text-white" />
        </div>
        <h1 className="font-bold text-2xl text-stone-900">Welcome Back</h1>
        <p className="text-stone-500 text-sm mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full bg-stone-50 border border-stone-200 focus:border-crimson focus:outline-none rounded-xl px-4 py-3 text-sm transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-stone-50 border border-stone-200 focus:border-crimson focus:outline-none rounded-xl px-4 py-3 text-sm transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-crimson hover:bg-crimson-dark text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
          ) : "Sign In"}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-crimson font-medium hover:underline">Sign Up</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-50 py-16 px-4">
        <Suspense fallback={<div className="max-w-md mx-auto text-center text-stone-400 py-16">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
