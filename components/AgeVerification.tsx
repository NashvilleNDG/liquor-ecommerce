"use client";

import { useEffect, useState } from "react";
import { Wine, ShieldCheck } from "lucide-react";

const STORAGE_KEY   = "srtb_age_verified";
const EXPIRY_DAYS   = 30;

function isVerified(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (isNaN(ts)) return false;
    return Date.now() - ts < EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function AgeVerification() {
  const [show, setShow]     = useState(false);
  const [dob, setDob]       = useState("");
  const [error, setError]   = useState("");
  const [method, setMethod] = useState<"dob" | "confirm">("confirm");

  useEffect(() => {
    if (!isVerified()) setShow(true);
  }, []);

  function confirm() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
  }

  function verifyDob() {
    if (!dob) { setError("Please enter your date of birth."); return; }
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (isNaN(age) || birth > today) { setError("Please enter a valid date of birth."); return; }
    if (age < 21) {
      window.location.href = "https://www.responsibility.org/";
      return;
    }
    confirm();
  }

  function deny() {
    window.location.href = "https://www.responsibility.org/";
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center space-y-6 shadow-2xl">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-crimson rounded-full p-4">
            <Wine size={32} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Age Verification</h2>
          <p className="text-stone-500 text-sm">
            You must be <span className="text-crimson font-bold">21 years or older</span> to enter this site.
          </p>
        </div>

        {/* Method toggle */}
        <div className="flex rounded-xl overflow-hidden border border-stone-200">
          <button
            onClick={() => { setMethod("confirm"); setError(""); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${method === "confirm" ? "bg-crimson text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
          >
            I confirm I&apos;m 21+
          </button>
          <button
            onClick={() => { setMethod("dob"); setError(""); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${method === "dob" ? "bg-crimson text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
          >
            Enter Date of Birth
          </button>
        </div>

        {method === "confirm" ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={confirm}
              className="w-full bg-crimson hover:bg-crimson-dark text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} /> Yes, I am 21 or older — Enter
            </button>
            <button
              onClick={deny}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 py-3 rounded-xl transition-colors text-sm"
            >
              I am under 21 — Exit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => { setDob(e.target.value); setError(""); }}
                max={new Date().toISOString().split("T")[0]}
                className="w-full bg-stone-50 border border-stone-200 focus:border-crimson rounded-xl text-sm text-stone-900 outline-none px-4 py-3 transition-colors"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <button
              onClick={verifyDob}
              className="w-full bg-crimson hover:bg-crimson-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Verify Age
            </button>
          </div>
        )}

        <p className="text-xs text-stone-400">
          By entering you accept our Terms of Service. Verification expires after {EXPIRY_DAYS} days.
        </p>
      </div>
    </div>
  );
}
