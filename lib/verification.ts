import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "verifications.json");
const TTL  = 15 * 60 * 1000; // 15 minutes

interface VerificationRecord {
  email: string;
  code:  string;
  exp:   number;
}

function load(): VerificationRecord[] {
  try {
    if (!existsSync(FILE)) return [];
    return JSON.parse(readFileSync(FILE, "utf-8"));
  } catch { return []; }
}

function save(records: VerificationRecord[]) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(records, null, 2), "utf-8");
}

export function createVerificationCode(email: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const records = load().filter((r) => r.email !== email.toLowerCase()); // replace old
  records.push({ email: email.toLowerCase(), code, exp: Date.now() + TTL });
  save(records);
  return code;
}

export function verifyCode(email: string, code: string): boolean {
  const records = load().filter((r) => Date.now() < r.exp); // purge expired
  const match   = records.find(
    (r) => r.email === email.toLowerCase() && r.code === code.trim()
  );
  if (!match) return false;
  // Consume the code
  save(records.filter((r) => r.email !== email.toLowerCase()));
  return true;
}
