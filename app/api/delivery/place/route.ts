import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";

type AddressComponent = { types: string[]; short_name: string; long_name: string };

function get(components: AddressComponent[], type: string): string {
  return components.find(c => c.types.includes(type))?.short_name ?? "";
}

// GET /api/delivery/place?id=PLACE_ID
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!id || !KEY) return NextResponse.json({ error: "missing" }, { status: 400 });

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", id);
    url.searchParams.set("fields", "address_components");
    url.searchParams.set("key", KEY);

    const res  = await fetch(url.toString());
    const data = await res.json();
    const c: AddressComponent[] = data.result?.address_components ?? [];

    return NextResponse.json({
      street: `${get(c, "street_number")} ${get(c, "route")}`.trim(),
      city:   get(c, "locality") || get(c, "sublocality") || get(c, "neighborhood"),
      state:  get(c, "administrative_area_level_1"),
      zip:    get(c, "postal_code"),
    });
  } catch {
    return NextResponse.json({ error: "Place lookup failed" }, { status: 502 });
  }
}
