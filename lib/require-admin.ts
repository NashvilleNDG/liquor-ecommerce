import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminToken, COOKIE } from "@/lib/admin-token";

/**
 * Call at the top of any state-changing API route handler.
 * Returns { email } on success, or a 401 NextResponse to return immediately.
 */
export async function requireAdmin(): Promise<{ email: string } | NextResponse> {
  const jar   = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const email = await verifyAdminToken(token);
  if (!email)  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { email };
}
