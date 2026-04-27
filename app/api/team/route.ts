import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const FILE = path.join(process.cwd(), "data", "team.json");

export interface TeamMember {
  id:           string;
  name:         string;
  email:        string;
  role:         "manager" | "editor" | "viewer";
  passwordHash: string;
  active:       boolean;
  createdAt:    string;
  lastLogin:    string | null;
}

function load(): Omit<TeamMember, "passwordHash">[] {
  try {
    if (!existsSync(FILE)) return [];
    return JSON.parse(readFileSync(FILE, "utf8")).map(({ passwordHash: _ph, ...rest }: TeamMember) => rest);
  } catch { return []; }
}
function loadFull(): TeamMember[] {
  try { if (!existsSync(FILE)) return []; return JSON.parse(readFileSync(FILE, "utf8")); }
  catch { return []; }
}
function save(members: TeamMember[]) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(members, null, 2));
}

export async function GET()  { return NextResponse.json(load()); }

export async function POST(req: NextRequest) {
  const { name, email, role, password } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
  const members = loadFull();
  if (members.find(m => m.email === email.toLowerCase())) return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  const member: TeamMember = {
    id: crypto.randomUUID(), name, email: email.toLowerCase(), role: role ?? "viewer",
    passwordHash: await bcrypt.hash(password, 10), active: true,
    createdAt: new Date().toISOString(), lastLogin: null,
  };
  members.push(member); save(members);
  const { passwordHash: _, ...safe } = member;
  return NextResponse.json(safe, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, password, ...updates } = await req.json();
  const members = loadFull().map(async m => {
    if (m.id !== id) return m;
    const updated = { ...m, ...updates };
    if (password) updated.passwordHash = await bcrypt.hash(password, 10);
    return updated;
  });
  save(await Promise.all(members));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  save(loadFull().filter(m => m.id !== id));
  return NextResponse.json({ ok: true });
}
