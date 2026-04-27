import fs   from "fs";
import path  from "path";
import bcrypt from "bcryptjs";

const FILE = path.join(process.cwd(), "data", "admin.json");

export interface AdminAccount {
  name:         string;
  email:        string;
  passwordHash: string;
  createdAt:    string;
}

export function adminExists(): boolean {
  try { return fs.existsSync(FILE) && !!JSON.parse(fs.readFileSync(FILE, "utf8")).email; }
  catch { return false; }
}

export function loadAdmin(): AdminAccount | null {
  try {
    if (!fs.existsSync(FILE)) return null;
    const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return data.email ? data : null;
  } catch { return null; }
}

export async function createAdmin(
  name: string, email: string, password: string
): Promise<AdminAccount> {
  const passwordHash = await bcrypt.hash(password, 12);
  const admin: AdminAccount = {
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(admin, null, 2));
  return admin;
}

export async function verifyAdmin(email: string, password: string): Promise<AdminAccount | null> {
  const admin = loadAdmin();
  if (!admin) return null;
  if (admin.email !== email.toLowerCase().trim()) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  return ok ? admin : null;
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  const admin = loadAdmin();
  if (!admin) throw new Error("No admin account");
  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  fs.writeFileSync(FILE, JSON.stringify(admin, null, 2));
}
