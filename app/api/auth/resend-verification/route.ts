import { NextRequest, NextResponse } from "next/server";
import { findByEmail } from "@/lib/users";
import { createVerificationCode } from "@/lib/verification";
import { sendEmail, verificationEmailHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = findByEmail(email);
  if (!user)  return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.emailVerified)
    return NextResponse.json({ error: "Email already verified" }, { status: 400 });

  const code = createVerificationCode(user.email);
  await sendEmail({
    to:      user.email,
    subject: "Your new verification code",
    html:    verificationEmailHtml(user.name, code),
  });

  return NextResponse.json({ ok: true });
}
