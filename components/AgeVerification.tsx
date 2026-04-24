"use client";

import { useEffect, useState } from "react";
import { Wine } from "lucide-react";

export default function AgeVerification() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("age_verified");
    if (!verified) setShow(true);
  }, []);

  function confirm() {
    localStorage.setItem("age_verified", "1");
    setShow(false);
  }

  function deny() {
    window.location.href = "https://www.responsibility.org/";
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
        <div className="flex justify-center">
          <div className="bg-yellow-500 rounded-full p-4">
            <Wine size={32} className="text-stone-900" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Age Verification</h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            You must be <span className="text-amber-600 dark:text-amber-400 font-semibold">21 years or older</span> to
            enter this site. Please confirm your age.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={confirm}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold py-3 rounded-xl transition-colors"
          >
            I am 21 or older — Enter
          </button>
          <button
            onClick={deny}
            className="w-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 py-3 rounded-xl transition-colors text-sm"
          >
            I am under 21 — Exit
          </button>
        </div>
        <p className="text-xs text-stone-400 dark:text-stone-600">
          By entering you accept our Terms of Service. We support responsible drinking.
        </p>
      </div>
    </div>
  );
}
