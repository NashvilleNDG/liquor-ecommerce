import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "events.json");

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;       // ISO date string YYYY-MM-DD
  startTime: string;  // "6:00 PM"
  endTime: string;    // "9:00 PM"
  location: string;
  imageUrl: string;
  href: string;
  tags: string[];
  active: boolean;
}

function readEvents(): Event[] {
  if (!existsSync(FILE)) return [];
  try { return JSON.parse(readFileSync(FILE, "utf-8")); } catch { return []; }
}

function writeEvents(events: Event[]) {
  writeFileSync(FILE, JSON.stringify(events, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readEvents());
}

export async function POST(req: Request) {
  const events: Event[] = await req.json();
  writeEvents(events);
  return NextResponse.json({ ok: true });
}
