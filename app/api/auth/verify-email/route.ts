import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/verification";
import { markEmailVerified } from "@/lib/users";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code)
    return NextResponse.json({ error: "Email and code required" }, { status: 400 });

  const ok = verifyCode(email, code);
  if (!ok)
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

  markEmailVerified(email);
  return NextResponse.json({ ok: true });
}
