import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { signAdminToken, COOKIE } from "@/lib/admin-token";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));

  if (!email || !password)
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  const admin = await verifyAdmin(email, password);
  if (!admin)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await signAdminToken(admin.email);

  const res = NextResponse.json({ ok: true, name: admin.name });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   8 * 60 * 60, // 8 hours
    path:     "/",
  });
  return res;
}
