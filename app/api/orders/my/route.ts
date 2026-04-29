import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { loadReviews } from "@/lib/reviews";
import fs from "fs";
import path from "path";
import type { AdminOrder } from "@/app/api/orders/route";

const FILE = path.join(process.cwd(), "data", "orders.json");

function loadOrders(): AdminOrder[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch { return []; }
}

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Login required" }, { status: 401 });

  const email  = session.user.email.toLowerCase();
  const orders = loadOrders().filter(
    (o) => o.email?.toLowerCase() === email
  );
  return NextResponse.json(orders);
}
