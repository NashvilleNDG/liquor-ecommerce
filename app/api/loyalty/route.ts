import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "loyalty-config.json");

export interface LoyaltyConfig {
  enabled:        boolean;
  pointsPerDollar: number;   // points earned per $1 spent
  redemptionRate:  number;   // points needed per $1 discount
  tiers: {
    name:   string;
    min:    number;
    bonus:  number;   // bonus % on top of base rate
    perks:  string;
  }[];
  bonusEvents: { label: string; points: number; active: boolean }[];
}

const DEFAULTS: LoyaltyConfig = {
  enabled: true,
  pointsPerDollar: 10,
  redemptionRate: 100,   // 100 pts = $1
  tiers: [
    { name: "Bronze",   min: 0,    bonus: 0,  perks: "Earn points on every purchase" },
    { name: "Silver",   min: 500,  bonus: 10, perks: "+10% bonus points, early access to deals" },
    { name: "Gold",     min: 1500, bonus: 25, perks: "+25% bonus points, free delivery on orders $50+" },
    { name: "Platinum", min: 5000, bonus: 50, perks: "+50% bonus points, exclusive events, priority support" },
  ],
  bonusEvents: [
    { label: "First Purchase",    points: 100, active: true },
    { label: "Birthday Bonus",    points: 250, active: true },
    { label: "Referral Reward",   points: 150, active: false },
    { label: "App Download",      points: 50,  active: false },
  ],
};

function load(): LoyaltyConfig {
  try {
    if (!existsSync(FILE)) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(readFileSync(FILE, "utf8")) };
  } catch { return DEFAULTS; }
}

export async function GET()  { return NextResponse.json(load()); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const updated = { ...load(), ...body };
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(updated, null, 2));
  return NextResponse.json({ ok: true, config: updated });
}
