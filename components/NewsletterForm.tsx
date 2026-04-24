"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-green-600 dark:text-green-400 font-semibold text-sm py-3">
        You&apos;re subscribed! We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto w-full">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
      />
      <button
        type="submit"
        className="bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
