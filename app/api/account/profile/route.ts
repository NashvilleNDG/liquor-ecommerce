import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { findByEmail, updateUser } from "@/lib/users";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = findByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id:    user.id,
    name:  user.name,
    email: user.email,
    phone: user.phone ?? "",
    address: user.address ?? "",
    points:  user.points ?? 0,
    emailVerified: user.emailVerified ?? false,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = findByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { name, phone, address } = await req.json();
  const updated = updateUser(user.id, {
    name:    name?.trim() || user.name,
    phone:   phone?.trim() ?? undefined,
    address: address?.trim() ?? undefined,
  });

  return NextResponse.json({ ok: true, user: updated });
}
