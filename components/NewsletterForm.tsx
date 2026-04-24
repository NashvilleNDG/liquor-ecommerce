"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-green-600 dark:text-green-400 font-semibold text-sm py-3">
        You&apos;re subscribed! We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto w-full">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          required
          disabled={loading}
          className="flex-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-crimson text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-crimson hover:bg-crimson-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          {loading ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs text-center">{error}</p>
      )}
    </form>
  );
}
