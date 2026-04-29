import { NextRequest, NextResponse } from "next/server";
import { readOverrides, upsertOverride, deleteOverride } from "@/lib/product-overrides";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  return NextResponse.json(readOverrides());
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const { upc, ...patch } = body;
    if (!upc) return NextResponse.json({ error: "upc required" }, { status: 400 });
    const overrides = upsertOverride(upc, patch);
    return NextResponse.json({ ok: true, overrides });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const { upc } = await req.json();
    if (!upc) return NextResponse.json({ error: "upc required" }, { status: 400 });
    const overrides = deleteOverride(upc);
    return NextResponse.json({ ok: true, overrides });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
