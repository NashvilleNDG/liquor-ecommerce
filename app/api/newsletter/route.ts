import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "subscribers.json");

function loadSubs(): string[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch { return []; }
}

function saveSubs(subs: string[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(subs, null, 2));
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const subs = loadSubs();
  if (subs.includes(email.toLowerCase())) {
    return NextResponse.json({ message: "Already subscribed" });
  }
  subs.push(email.toLowerCase());
  saveSubs(subs);
  return NextResponse.json({ message: "Subscribed!" });
}
