import { NextRequest, NextResponse } from "next/server";

const CACHE = new Map<string, { buf: Buffer; mime: string; ts: number }>();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 h in-memory cache

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) return new NextResponse("missing domain", { status: 400 });

  // In-memory cache hit
  const cached = CACHE.get(domain);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    return new NextResponse(cached.buf, {
      headers: {
        "Content-Type": cached.mime,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // Try logo sources in order
  const sources = [
    `https://logo.uplead.com/${domain}`,
    `https://logo.clearbit.com/${domain}`,
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; StonesRiverBot/1.0)" },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;

      const mime = res.headers.get("content-type") ?? "image/png";
      // Only accept actual image responses
      if (!mime.startsWith("image/")) continue;

      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) continue; // Skip tiny placeholder images

      CACHE.set(domain, { buf, mime, ts: Date.now() });

      return new NextResponse(buf, {
        headers: {
          "Content-Type": mime,
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      // try next source
    }
  }

  // Nothing found — return 404 so the client falls back to brand name text
  return new NextResponse(null, { status: 404 });
}
