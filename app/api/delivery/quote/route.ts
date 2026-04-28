import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { DeliverySettings } from "@/app/api/delivery/route";

const DELIVERY_FILE = path.join(process.cwd(), "data", "delivery.json");
const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

// Module-level cache — geocode store address once per server lifetime
let storeCache: { lat: number; lon: number; address: string } | null = null;

function loadDelivery(): DeliverySettings {
  try { return JSON.parse(fs.readFileSync(DELIVERY_FILE, "utf8")); }
  catch { return { baseFee: 5, perMileFee: 0.5, maxDistance: 15 } as DeliverySettings; }
}

function loadStoreAddress(): string {
  try {
    const s = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
    return `${s.address}, ${s.city}, ${s.state} ${s.zip}`;
  } catch {
    return "208 North Thompson Lane, Murfreesboro, TN 37129";
  }
}

// Haversine formula — straight-line miles between two lat/lon points
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(address: string): Promise<{ lat: number; lon: number }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=us`,
    { headers: { "User-Agent": "StonesRiverBeverages/1.0 (delivery-quote)" } }
  );
  const results = await res.json();
  if (!results?.length) throw new Error(`Address not found: ${address}`);
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}

// GET /api/delivery/quote?address=123+Main+St+Murfreesboro+TN+37129
export async function GET(req: NextRequest) {
  const customerAddress = req.nextUrl.searchParams.get("address");
  if (!customerAddress) return NextResponse.json({ error: "address required" }, { status: 400 });

  const settings = loadDelivery();
  const baseFee = settings.baseFee   ?? 5.00;
  const perMile = settings.perMileFee ?? 0.50;
  const maxDist = settings.maxDistance ?? 15;

  // Geocode store address (cached per server process)
  const storeAddress = loadStoreAddress();
  if (!storeCache || storeCache.address !== storeAddress) {
    try {
      const coords = await geocode(storeAddress);
      storeCache = { ...coords, address: storeAddress };
    } catch {
      return NextResponse.json({ error: "Could not geocode store address" }, { status: 502 });
    }
  }

  // Geocode customer address
  let customerCoords: { lat: number; lon: number };
  try {
    customerCoords = await geocode(customerAddress);
  } catch {
    return NextResponse.json({ error: "Address not found — please check and try again" }, { status: 404 });
  }

  // Straight-line × 1.3 road factor to approximate driving miles
  const straightMiles = haversineMiles(
    storeCache.lat, storeCache.lon,
    customerCoords.lat, customerCoords.lon
  );
  const drivingMiles = parseFloat((straightMiles * 1.3).toFixed(1));

  if (drivingMiles > maxDist) {
    return NextResponse.json({
      error: `Your address is ${drivingMiles.toFixed(1)} miles away — outside our ${maxDist}-mile delivery area.`,
      miles: drivingMiles,
      outOfRange: true,
    }, { status: 422 });
  }

  const fee = parseFloat((baseFee + drivingMiles * perMile).toFixed(2));

  return NextResponse.json({
    fee,
    miles: drivingMiles,
    baseFee,
    perMile,
    storeAddress,      // included so callers can confirm which store was used
  });
}
