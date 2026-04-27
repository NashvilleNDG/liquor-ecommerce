import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "promo-codes.json");

export interface PromoCode {
  id:          string;
  code:        string;
  type:        "percent" | "fixed";
  value:       number;
  minOrder:    number;
  maxUses:     number | null;  // null = unlimited
  usedCount:   number;
  active:      boolean;
  expiresAt:   string | null;  // ISO date or null
  createdAt:   string;
  description: string;
}

function load(): PromoCode[] {
  try {
    if (!existsSync(FILE)) return [];
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch { return []; }
}

function save(codes: PromoCode[]) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(codes, null, 2));
}

export async function GET() {
  return NextResponse.json(load());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const codes = load();

  // Duplicate check
  if (codes.find(c => c.code.toUpperCase() === body.code?.toUpperCase()))
    return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });

  const code: PromoCode = {
    id:          crypto.randomUUID(),
    code:        body.code.toUpperCase().trim(),
    type:        body.type ?? "percent",
    value:       Number(body.value) || 10,
    minOrder:    Number(body.minOrder) || 0,
    maxUses:     body.maxUses ? Number(body.maxUses) : null,
    usedCount:   0,
    active:      true,
    expiresAt:   body.expiresAt || null,
    createdAt:   new Date().toISOString(),
    description: body.description ?? "",
  };
  codes.push(code);
  save(codes);
  return NextResponse.json(code, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();
  const codes = load().map(c => c.id === id ? { ...c, ...updates } : c);
  save(codes);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  save(load().filter(c => c.id !== id));
  return NextResponse.json({ ok: true });
}
