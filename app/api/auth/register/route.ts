import { NextRequest, NextResponse } from "next/server";
import { findByEmail, createUser } from "@/lib/users";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (findByEmail(email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  const user = await createUser(name, email, password);
  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
