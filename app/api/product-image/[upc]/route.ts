import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "data", "product-images");

const MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg",
  png: "image/png", webp: "image/webp", gif: "image/gif",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ upc: string }> }) {
  const { upc } = await params;
  const safe = upc.replace(/[^a-zA-Z0-9_\-]/g, "");

  for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
    const file = path.join(IMAGES_DIR, `${safe}.${ext}`);
    if (existsSync(file)) {
      const buffer = readFileSync(file);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": MIME[ext],
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  return new NextResponse("Not found", { status: 404 });
}
