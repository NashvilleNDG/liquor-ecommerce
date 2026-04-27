/**
 * Edge-compatible admin JWT — uses Web Crypto API so it works
 * in Next.js middleware (no Node.js crypto module needed).
 */

const SECRET = process.env.NEXTAUTH_SECRET ?? "srtb-admin-secret-change-in-prod";
const COOKIE  = "srtb_admin";
const TTL_MS  = 8 * 60 * 60 * 1000; // 8 hours

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Sign a token containing the admin email. Returns base64url.base64url */
export async function signAdminToken(email: string): Promise<string> {
  const payload = JSON.stringify({ email, exp: Date.now() + TTL_MS });
  const payloadB64 = btoa(unescape(encodeURIComponent(payload)));
  const key  = await getKey();
  const raw  = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(raw)));
  return `${payloadB64}.${sigB64}`;
}

/** Verify token. Returns email on success, null on failure/expiry. */
export async function verifyAdminToken(token: string): Promise<string | null> {
  try {
    const dot = token.lastIndexOf(".");
    if (dot < 0) return null;
    const payloadB64 = token.slice(0, dot);
    const sigB64     = token.slice(dot + 1);
    const sigBytes   = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const key = await getKey();
    const ok  = await crypto.subtle.verify(
      "HMAC", key, sigBytes, new TextEncoder().encode(payloadB64)
    );
    if (!ok) return null;
    const payload = JSON.parse(decodeURIComponent(escape(atob(payloadB64))));
    if (Date.now() > payload.exp) return null;
    return payload.email as string;
  } catch {
    return null;
  }
}

export { COOKIE };
