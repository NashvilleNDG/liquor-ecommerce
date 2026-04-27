import { NextRequest, NextResponse } from "next/server";
import { adminExists, createAdmin } from "@/lib/admin-auth";

/** GET — check if admin account exists */
export async function GET() {
  return NextResponse.json({ exists: adminExists() });
}

/** POST — create the first admin account (only works when none exists) */
export async function POST(req: NextRequest) {
  if (adminExists())
    return NextResponse.json({ error: "Admin account already exists" }, { status: 409 });

  const { name, email, password } = await req.json().catch(() => ({}));

  if (!name || !email || !password)
    return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  await createAdmin(name, email, password);
  return NextResponse.json({ ok: true });
}
