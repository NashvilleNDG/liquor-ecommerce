import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "deals.json");

export interface Deal {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  href: string;
  active: boolean;
}

function readDeals(): Deal[] {
  if (!existsSync(FILE)) return [];
  try { return JSON.parse(readFileSync(FILE, "utf-8")); } catch { return []; }
}

function writeDeals(deals: Deal[]) {
  writeFileSync(FILE, JSON.stringify(deals, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readDeals());
}

export async function POST(req: Request) {
  const deals: Deal[] = await req.json();
  writeDeals(deals);
  return NextResponse.json({ ok: true });
}
