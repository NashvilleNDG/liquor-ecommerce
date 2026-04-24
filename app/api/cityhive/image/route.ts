import { NextRequest, NextResponse } from "next/server";
import { searchCityHiveImage } from "@/lib/cityhive-api";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ imageUrl: null });

  const imageUrl = await searchCityHiveImage(name);
  return NextResponse.json(
    { imageUrl },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
