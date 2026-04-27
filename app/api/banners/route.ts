import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "banners.json");

export interface Banner {
  id:         string;
  title:      string;
  subtitle:   string;
  ctaText:    string;
  ctaLink:    string;
  bgColor:    string;
  active:     boolean;
  order:      number;
  createdAt:  string;
}

function load(): Banner[] {
  try {
    if (!existsSync(FILE)) return [];
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch { return []; }
}
function save(b: Banner[]) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(b, null, 2));
}

export async function GET()  { return NextResponse.json(load()); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const banners = load();
  const banner: Banner = {
    id: crypto.randomUUID(), title: body.title ?? "New Banner",
    subtitle: body.subtitle ?? "", ctaText: body.ctaText ?? "Shop Now",
    ctaLink: body.ctaLink ?? "/shop", bgColor: body.bgColor ?? "from-amber-900 to-stone-900",
    active: true, order: banners.length, createdAt: new Date().toISOString(),
  };
  banners.push(banner); save(banners);
  return NextResponse.json(banner, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();
  save(load().map(b => b.id === id ? { ...b, ...updates } : b));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  save(load().filter(b => b.id !== id));
  return NextResponse.json({ ok: true });
}
