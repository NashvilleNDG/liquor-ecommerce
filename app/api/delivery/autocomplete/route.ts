import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";

// GET /api/delivery/autocomplete?q=1023+old+lascassas
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3 || !KEY) return NextResponse.json({ predictions: [] });

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.set("input", q);
    url.searchParams.set("types", "address");
    url.searchParams.set("components", "country:us");
    url.searchParams.set("location", "35.8503,-86.4301"); // bias to Murfreesboro
    url.searchParams.set("radius", "40000");              // 25-mile bias radius
    url.searchParams.set("key", KEY);

    const res  = await fetch(url.toString());
    const data = await res.json();

    const predictions = (data.predictions ?? []).map((p: Record<string, string>) => ({
      display:  p.description,
      place_id: p.place_id,
    }));

    return NextResponse.json({ predictions });
  } catch {
    return NextResponse.json({ predictions: [] });
  }
}
