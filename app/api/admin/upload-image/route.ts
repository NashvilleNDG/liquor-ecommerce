import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import path from "path";

const IMAGES_DIR  = path.join(process.cwd(), "data", "product-images");
const CACHE_FILE  = path.join(process.cwd(), "data", "product-images-cache.json");

function loadCache(): Record<string, string | null> {
  try {
    if (!existsSync(CACHE_FILE)) return {};
    return JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
  } catch { return {}; }
}

function saveCache(cache: Record<string, string | null>) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const upc  = formData.get("upc") as string;
    const file = formData.get("image") as File | null;
    const url  = formData.get("url") as string | null;

    if (!upc) return NextResponse.json({ error: "UPC required" }, { status: 400 });

    if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

    let imageUrl: string;

    if (file && file.size > 0) {
      const ext    = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const buffer = Buffer.from(await file.arrayBuffer());
      const fname  = `${upc}.${ext}`;
      writeFileSync(path.join(IMAGES_DIR, fname), buffer);
      imageUrl = `/api/product-image/${upc}`;
    } else if (url && url.trim()) {
      imageUrl = url.trim();
    } else {
      return NextResponse.json({ error: "Image file or URL required" }, { status: 400 });
    }

    const cache = loadCache();
    cache[upc] = imageUrl;
    saveCache(cache);

    return NextResponse.json({ ok: true, imageUrl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { upc } = await req.json();
  if (!upc) return NextResponse.json({ error: "UPC required" }, { status: 400 });
  const cache = loadCache();
  delete cache[upc];
  saveCache(cache);
  return NextResponse.json({ ok: true });
}
