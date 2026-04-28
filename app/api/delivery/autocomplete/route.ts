import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

// Load store coords for biasing results toward the local area
function getStoreBias(): string {
  try {
    const s = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
    // Default to Murfreesboro, TN center if not set
    return s.lat && s.lon ? `${s.lat},${s.lon}` : "35.8503,-86.4301";
  } catch {
    return "35.8503,-86.4301";
  }
}

// GET /api/delivery/autocomplete?q=1023+old+lascassas
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) return NextResponse.json({ addresses: [] });

  const key = process.env.RADAR_API_KEY;
  if (!key) return NextResponse.json({ addresses: [] });

  try {
    const near = getStoreBias();
    const url  = `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(q)}&near=${near}&layers=address&limit=6&country=US`;
    const res  = await fetch(url, { headers: { Authorization: key } });
    const data = await res.json();

    const addresses = (data.addresses ?? []).map((a: Record<string, string>) => ({
      display:    a.formattedAddress ?? "",
      street:     `${a.number ?? ""} ${a.street ?? ""}`.trim(),
      city:       a.city ?? "",
      state:      a.stateCode ?? a.state ?? "",
      zip:        a.postalCode ?? "",
    }));

    return NextResponse.json({ addresses });
  } catch {
    return NextResponse.json({ addresses: [] });
  }
}
