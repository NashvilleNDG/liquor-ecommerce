import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "settings.json");

export interface StoreSettings {
  storeName:       string;
  tagline:         string;
  phone:           string;
  email:           string;
  address:         string;
  city:            string;
  state:           string;
  zip:             string;
  taxRate:         number;   // percent e.g. 9.5
  minOrderAmount:  number;
  ageVerification: boolean;
  hoursMonFri:     string;
  hoursSat:        string;
  hoursSun:        string;
  currency:        string;
  timezone:        string;
  facebookUrl:     string;
  instagramUrl:    string;
}

const DEFAULTS: StoreSettings = {
  storeName: "Stones River Beer Wine & Spirits",
  tagline: "Your local beverage destination",
  phone: "", email: "", address: "", city: "Murfreesboro", state: "TN", zip: "",
  taxRate: 9.75, minOrderAmount: 25, ageVerification: true,
  hoursMonFri: "9:00 AM – 10:00 PM", hoursSat: "9:00 AM – 11:00 PM", hoursSun: "12:00 PM – 8:00 PM",
  currency: "USD", timezone: "America/Chicago",
  facebookUrl: "", instagramUrl: "",
};

function load(): StoreSettings {
  try {
    if (!existsSync(FILE)) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(readFileSync(FILE, "utf8")) };
  } catch { return DEFAULTS; }
}

export async function GET() {
  return NextResponse.json(load());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const current = load();
  const updated = { ...current, ...body };
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(updated, null, 2));
  return NextResponse.json({ ok: true, settings: updated });
}
