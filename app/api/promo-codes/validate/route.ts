import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";
import type { PromoCode } from "../route";

const FILE = path.join(process.cwd(), "data", "promo-codes.json");

function load(): PromoCode[] {
  try {
    if (!existsSync(FILE)) return [];
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch { return []; }
}

// POST { code: string, orderAmount: number }
// Returns { valid, code, type, value, discountAmount, description } | { valid: false, error }
export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();
    if (!code) return NextResponse.json({ valid: false, error: "Please enter a promo code" });

    const promos = load();
    const promo = promos.find(
      (c) => c.code.toUpperCase() === String(code).trim().toUpperCase()
    );

    if (!promo)
      return NextResponse.json({ valid: false, error: "Invalid promo code" });
    if (!promo.active)
      return NextResponse.json({ valid: false, error: "This promo code is no longer active" });
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date())
      return NextResponse.json({ valid: false, error: "This promo code has expired" });
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses)
      return NextResponse.json({ valid: false, error: "This promo code has reached its usage limit" });

    const amount = Number(orderAmount) || 0;
    if (amount < promo.minOrder)
      return NextResponse.json({
        valid: false,
        error: `Minimum order of $${promo.minOrder.toFixed(2)} required`,
      });

    const discountAmount =
      promo.type === "percent"
        ? parseFloat((amount * (promo.value / 100)).toFixed(2))
        : parseFloat(Math.min(promo.value, amount).toFixed(2));

    return NextResponse.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discountAmount,
      description: promo.description,
    });
  } catch {
    return NextResponse.json({ valid: false, error: "Failed to validate code" });
  }
}
