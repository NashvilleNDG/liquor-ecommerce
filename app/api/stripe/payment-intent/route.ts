import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { amount, currency = "usd", metadata } = await req.json();
  if (!amount || amount < 50) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    // Dev mode: return a fake client secret so the UI doesn't break
    return NextResponse.json({ clientSecret: "pi_demo_secret_test_placeholder" });
  }
  try {
    const intent = await getStripe().paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
