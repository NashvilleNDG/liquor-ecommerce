import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/require-admin";

const IMAGES_DIR = path.join(process.cwd(), "data", "product-images");

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ upc: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { upc } = await params;
  const safe = upc.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) return NextResponse.json({ error: "Invalid UPC" }, { status: 400 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });

    mkdirSync(IMAGES_DIR, { recursive: true });
    const filename = `${safe}-addl-${Date.now()}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());
    writeFileSync(path.join(IMAGES_DIR, filename), buffer);

    const imageUrl = `/api/product-image/${filename.replace(`.${ext}`, "")}`;
    return NextResponse.json({ ok: true, imageUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
