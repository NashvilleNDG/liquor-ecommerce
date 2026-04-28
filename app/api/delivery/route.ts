import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "delivery.json");

export interface ThirdPartyDeliveryProvider {
  enabled:       boolean;
  // DoorDash Drive credentials
  developerId?:  string;
  keyId?:        string;
  signingSecret?: string;
  // Uber Direct credentials
  clientId?:     string;
  clientSecret?: string;
  customerId?:   string;
}

export interface DeliverySettings {
  enabled:        boolean;
  fee:            number;    // legacy flat fee (kept for backward compat)
  baseFee:        number;    // $5 base
  perMileFee:     number;    // $0.50 per mile
  freeThreshold:  number;   // free delivery above this amount (0 = never free)
  estimatedTime:  string;   // e.g. "45-60 minutes"
  maxDistance:    number;   // miles
  zones:          DeliveryZone[];
  thirdParty: {
    doordash: ThirdPartyDeliveryProvider;
    uber:     ThirdPartyDeliveryProvider;
  };
}

export interface DeliveryZone {
  id:     string;
  label:  string;
  zips:   string;   // comma-separated ZIP codes
  fee:    number;
  active: boolean;
}

const DEFAULTS: DeliverySettings = {
  enabled: true, fee: 5.99, baseFee: 5.00, perMileFee: 0.50,
  freeThreshold: 75, estimatedTime: "45–60 minutes",
  maxDistance: 15, zones: [],
  thirdParty: {
    doordash: { enabled: false, developerId: "", keyId: "", signingSecret: "" },
    uber:     { enabled: false, clientId: "", clientSecret: "", customerId: "" },
  },
};

function load(): DeliverySettings {
  try {
    if (!existsSync(FILE)) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(readFileSync(FILE, "utf8")) };
  } catch { return DEFAULTS; }
}
function save(data: DeliverySettings) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function GET() { return NextResponse.json(load()); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const updated = { ...load(), ...body };
  save(updated);
  return NextResponse.json({ ok: true, settings: updated });
}
