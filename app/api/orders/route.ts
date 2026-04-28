import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "orders.json");

export interface AdminOrder {
  id: string;
  date: string;
  customer: string;
  email?: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  delivery: number;
  total: number;
  mode: "delivery" | "pickup";
  address?: string;
  promoCode?: string;
  status: "pending" | "processing" | "out_for_delivery" | "delivered" | "cancelled";
  notes?: string;
}

function loadOrders(): AdminOrder[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch { return []; }
}

function saveOrders(orders: AdminOrder[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(orders, null, 2));
}

// GET  — list all orders
export async function GET() {
  return NextResponse.json(loadOrders());
}

// POST — create or bulk-save orders
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (Array.isArray(body)) {
    saveOrders(body);
    return NextResponse.json({ ok: true });
  }
  // Single order creation
  const orders = loadOrders();
  const order: AdminOrder = { ...body, id: body.id ?? `ORD-${Date.now()}` };
  orders.unshift(order);
  saveOrders(orders);

  // Increment promo code usedCount if one was applied
  if (order.promoCode) {
    try {
      const promoFile = path.join(process.cwd(), "data", "promo-codes.json");
      if (fs.existsSync(promoFile)) {
        const promos = JSON.parse(fs.readFileSync(promoFile, "utf8"));
        const updated = promos.map((p: { code: string; usedCount: number }) =>
          p.code.toUpperCase() === order.promoCode?.toUpperCase()
            ? { ...p, usedCount: (p.usedCount || 0) + 1 }
            : p
        );
        fs.writeFileSync(promoFile, JSON.stringify(updated, null, 2));
      }
    } catch { /* ignore — promo tracking is non-critical */ }
  }

  return NextResponse.json(order, { status: 201 });
}

// PATCH — update order status
export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  orders[idx] = { ...orders[idx], status };
  saveOrders(orders);
  return NextResponse.json(orders[idx]);
}

// DELETE — delete an order
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const orders = loadOrders().filter((o) => o.id !== id);
  saveOrders(orders);
  return NextResponse.json({ ok: true });
}
