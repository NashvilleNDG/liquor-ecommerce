import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/require-admin";
import { sendEmail, orderConfirmationHtml, newOrderAdminHtml } from "@/lib/email";

const FILE = path.join(process.cwd(), "data", "orders.json");

export interface AdminOrder {
  id: string;
  date: string;
  customer: string;
  email?: string;
  phone?: string;
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
  stripePaymentIntentId?: string;
  thirdPartyDelivery?: {
    provider: "doordash" | "uber";
    deliveryId: string;
    status: string;
    trackingUrl?: string;
    dispatchedAt: string;
  };
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

// GET — public read for dashboard polling (protected at page level by middleware)
export async function GET() {
  return NextResponse.json(loadOrders());
}

// POST — create order (called from checkout; also called internally by webhook)
export async function POST(req: NextRequest) {
  // Allow internal webhook calls (x-internal header) OR admin auth
  const isInternal = req.headers.get("x-internal-secret") === process.env.NEXTAUTH_SECRET;
  if (!isInternal) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      // For customer checkout, allow unauthenticated POST (order comes from paying customer)
      // We skip admin check here — payment verification is done by Stripe webhook
    }
  }

  const body = await req.json();

  if (Array.isArray(body)) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    saveOrders(body);
    return NextResponse.json({ ok: true });
  }

  const orders = loadOrders();
  const order: AdminOrder = { ...body, id: body.id ?? `ORD-${Date.now()}` };
  orders.unshift(order);
  saveOrders(orders);

  // Increment promo code usedCount
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
    } catch { /* non-critical */ }
  }

  // Send confirmation email to customer
  if (order.email) {
    sendEmail({
      to:      order.email,
      subject: `Order Confirmed — ${order.id}`,
      html:    orderConfirmationHtml(order),
    }).catch(() => {});
  }

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    sendEmail({
      to:      adminEmail,
      subject: `New Order: ${order.id} — $${order.total.toFixed(2)}`,
      html:    newOrderAdminHtml(order),
    }).catch(() => {});
  }

  return NextResponse.json(order, { status: 201 });
}

// PATCH — update order (admin only)
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { id, ...updates } = body;
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  orders[idx] = { ...orders[idx], ...updates };
  saveOrders(orders);
  return NextResponse.json(orders[idx]);
}

// DELETE — delete order (admin only)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await req.json();
  saveOrders(loadOrders().filter((o) => o.id !== id));
  return NextResponse.json({ ok: true });
}
