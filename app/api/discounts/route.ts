import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "discounts.json");

export interface Discount {
  id: string;
  name: string;
  type: "category" | "product";
  target: string;          // dept name OR ItemUPC
  targetName: string;      // human-readable label
  discountType: "%" | "$";
  value: number;
  active: boolean;
  createdAt: string;
}

function readDiscounts(): Discount[] {
  if (!existsSync(FILE)) return [];
  try { return JSON.parse(readFileSync(FILE, "utf-8")); } catch { return []; }
}

function writeDiscounts(d: Discount[]) {
  writeFileSync(FILE, JSON.stringify(d, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readDiscounts());
}

export async function POST(req: Request) {
  const discounts: Discount[] = await req.json();
  writeDiscounts(discounts);
  return NextResponse.json({ ok: true });
}
