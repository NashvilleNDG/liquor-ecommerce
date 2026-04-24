"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Lock, CreditCard } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

function PaymentForm({ onSuccess, submitting }: { onSuccess: () => void; submitting: boolean }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
      redirect: "if_required",
    });
    if (result.error) {
      setError(result.error.message ?? "Payment failed");
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading || submitting}
        className="w-full flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-dark disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <><CreditCard size={18} /> Pay Now</>
        )}
      </button>
    </form>
  );
}

export default function StripeCheckout({
  amount,
  onSuccess,
  submitting,
}: {
  amount: number;
  onSuccess: () => void;
  submitting: boolean;
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  useEffect(() => {
    if (amount < 0.5) return;
    fetch("/api/stripe/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(amount * 100) }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.clientSecret) setClientSecret(d.clientSecret);
        else setError(d.error ?? "Failed to initialize payment");
      })
      .catch(() => setError("Could not connect to payment service"))
      .finally(() => setLoading(false));
  }, [amount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-stone-400">
        <span className="w-5 h-5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Preparing secure checkout…</span>
      </div>
    );
  }

  if (error || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    // Fallback: show card brand badges + "Coming Soon" message when keys not configured
    return (
      <div className="space-y-3">
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs">
            <Lock size={11} /> Secure Checkout
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {["VISA", "MC", "AMEX", "DISC"].map((c) => (
              <span key={c} className="text-[10px] font-bold bg-white border border-stone-200 text-stone-500 px-2 py-0.5 rounded">{c}</span>
            ))}
          </div>
          <p className="text-[11px] text-stone-400">
            {error || "Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local to enable card payments"}
          </p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-dark disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><CreditCard size={18} /> Place Order</>
          )}
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <PaymentForm onSuccess={onSuccess} submitting={submitting} />
    </Elements>
  );
}
