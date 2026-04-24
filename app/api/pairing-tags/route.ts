import { NextResponse } from "next/server";
import { readTags, writeTags, type PairingTagsMap } from "@/lib/pairing-tags";

export async function GET() {
  return NextResponse.json(readTags());
}

export async function POST(req: Request) {
  const body: PairingTagsMap = await req.json();
  writeTags(body);
  return NextResponse.json({ ok: true });
}
