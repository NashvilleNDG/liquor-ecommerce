import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const FILE = path.join(process.cwd(), "data", "users.json");

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  points: number;
}

export function loadUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch { return []; }
}

export function saveUsers(users: StoredUser[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

export function findByEmail(email: string): StoredUser | null {
  return loadUsers().find((u) => u.email === email.toLowerCase()) ?? null;
}

export async function createUser(name: string, email: string, password: string): Promise<StoredUser> {
  const users = loadUsers();
  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = {
    id: Math.random().toString(36).slice(2),
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
    points: 0,
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export async function verifyUser(email: string, password: string): Promise<StoredUser | null> {
  const user = findByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}
