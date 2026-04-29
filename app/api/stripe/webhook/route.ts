import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import type { AdminOrder } from "@/app/api/orders/route";
import fs from "fs";
import path from "path";
import { sendEmail, orderConfirmationHtml, newOrderAdminHtml } from "@/lib/email";

const FILE = path.join(process.cwd(), "data", "orders.json");

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

// Stripe requires raw body for signature verification
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const sig    = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    // Dev mode — process without verification
    console.warn("[stripe webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature check");
    return handleEvent(await req.json());
  }

  const body = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig ?? "", secret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err}` }, { status: 400 });
  }

  return handleEvent(event as unknown as StripeEvent);
}

interface StripeEvent {
  type: string;
  data: { object: Record<string, unknown> };
}

async function handleEvent(event: StripeEvent) {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      const meta = (pi.metadata ?? {}) as Record<string, string>;

      // Check if order already exists for this payment intent
      const orders = loadOrders();
      const piId   = pi.id as string;
      if (orders.some((o) => o.stripePaymentIntentId === piId)) {
        return NextResponse.json({ received: true }); // idempotent
      }

      // Build items from metadata (checkout encodes them as JSON)
      let items: AdminOrder["items"] = [];
      try { items = JSON.parse(meta.items ?? "[]"); } catch { /* */ }

      const order: AdminOrder = {
        id:                    `ORD-${Date.now()}`,
        date:                  new Date().toISOString(),
        customer:              meta.customerName ?? "Customer",
        email:                 meta.customerEmail ?? undefined,
        phone:                 meta.customerPhone ?? undefined,
        items,
        subtotal:              Number(meta.subtotal ?? 0),
        discount:              Number(meta.discount ?? 0),
        tax:                   Number(meta.tax ?? 0),
        delivery:              Number(meta.delivery ?? 0),
        total:                 Number((pi.amount as number) ?? 0) / 100,
        mode:                  (meta.mode as "delivery" | "pickup") ?? "pickup",
        address:               meta.address ?? undefined,
        promoCode:             meta.promoCode ?? undefined,
        status:                "pending",
        stripePaymentIntentId: piId,
      };

      orders.unshift(order);
      saveOrders(orders);

      // Send emails
      if (order.email) {
        sendEmail({
          to:      order.email,
          subject: `Order Confirmed — ${order.id}`,
          html:    orderConfirmationHtml(order),
        }).catch(() => {});
      }
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        sendEmail({
          to:      adminEmail,
          subject: `New Order: ${order.id} — $${order.total.toFixed(2)}`,
          html:    newOrderAdminHtml(order),
        }).catch(() => {});
      }

      break;
    }

    case "payment_intent.payment_failed": {
      console.log("[stripe webhook] payment failed:", event.data.object.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
