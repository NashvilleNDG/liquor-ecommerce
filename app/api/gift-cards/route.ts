import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "gift-cards.json");

export interface GiftCard {
  id:          string;
  code:        string;
  balance:     number;
  initialValue: number;
  recipient:   string;
  note:        string;
  issuedAt:    string;
  expiresAt:   string | null;
  active:      boolean;
  usedAmount:  number;
}

function load(): GiftCard[] {
  try { if (!existsSync(FILE)) return []; return JSON.parse(readFileSync(FILE, "utf8")); }
  catch { return []; }
}
function save(cards: GiftCard[]) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(cards, null, 2));
}
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 16 }, (_, i) => (i > 0 && i % 4 === 0 ? "-" : "") + chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function GET()  { return NextResponse.json(load()); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const card: GiftCard = {
    id: crypto.randomUUID(), code: generateCode(),
    balance: Number(body.value) || 25, initialValue: Number(body.value) || 25,
    recipient: body.recipient ?? "", note: body.note ?? "",
    issuedAt: new Date().toISOString(), expiresAt: body.expiresAt || null,
    active: true, usedAmount: 0,
  };
  const cards = load(); cards.push(card); save(cards);
  return NextResponse.json(card, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();
  save(load().map(c => c.id === id ? { ...c, ...updates } : c));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  save(load().filter(c => c.id !== id));
  return NextResponse.json({ ok: true });
}
