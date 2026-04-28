import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import fs from "fs";
import path from "path";
import type { AdminOrder } from "@/app/api/orders/route";
import type { DeliverySettings } from "@/app/api/delivery/route";

const ORDERS_FILE   = path.join(process.cwd(), "data", "orders.json");
const DELIVERY_FILE = path.join(process.cwd(), "data", "delivery.json");

const STORE = {
  name:    "Stones River Total Beverages",
  address: "208 North Thompson Lane, Murfreesboro, TN 37129",
  phone:   "+16158951888",
};

function loadOrders(): AdminOrder[] {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")); } catch { return []; }
}
function saveOrders(orders: AdminOrder[]) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}
function loadDelivery(): DeliverySettings {
  try { return JSON.parse(fs.readFileSync(DELIVERY_FILE, "utf8")); } catch { return {} as DeliverySettings; }
}

// ── DoorDash Drive ──────────────────────────────────────────────────────────
function makeDoorDashJWT(developerId: string, keyId: string, signingSecret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ aud: "doordash", iss: developerId, kid: keyId, exp: now + 300, iat: now })).toString("base64url");
  const sig = createHmac("sha256", signingSecret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

async function dispatchDoorDash(order: AdminOrder, cfg: DeliverySettings["thirdParty"]["doordash"]) {
  const jwt = makeDoorDashJWT(cfg.developerId!, cfg.keyId!, cfg.signingSecret!);
  const baseUrl = process.env.DOORDASH_ENV === "production"
    ? "https://openapi.doordash.com"
    : "https://openapi.doordash.com"; // sandbox uses same host, different credentials
  const res = await fetch(`${baseUrl}/drive/v2/deliveries`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      external_delivery_id:  order.id,
      pickup_address:        STORE.address,
      pickup_business_name:  STORE.name,
      pickup_phone_number:   STORE.phone,
      pickup_instructions:   "Pick up the bagged order at the counter.",
      dropoff_address:       order.address ?? "",
      dropoff_business_name: order.customer,
      dropoff_phone_number:  order.phone ?? "",
      dropoff_instructions:  order.notes ?? "",
      order_value:           Math.round(order.total * 100),
      tip:                   0,
      items: order.items?.map((i) => ({ name: i.name, quantity: i.qty, price: Math.round(i.price * 100) })) ?? [],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "DoorDash API error");
  return {
    deliveryId:  data.external_delivery_id ?? order.id,
    status:      data.delivery_status ?? "created",
    trackingUrl: data.tracking_url ?? undefined,
  };
}

// ── Uber Direct ─────────────────────────────────────────────────────────────
async function getUberToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch("https://auth.uber.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret, scope: "eats.deliveries" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? "Uber auth error");
  return data.access_token;
}

async function dispatchUber(order: AdminOrder, cfg: DeliverySettings["thirdParty"]["uber"]) {
  const token = await getUberToken(cfg.clientId!, cfg.clientSecret!);
  const res = await fetch(`https://api.uber.com/v1/customers/${cfg.customerId}/deliveries`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      pickup: {
        name:         STORE.name,
        phone_number: STORE.phone,
        address:      STORE.address,
      },
      dropoff: {
        name:         order.customer,
        phone_number: order.phone ?? "",
        address:      order.address ?? "",
        notes:        order.notes ?? "",
      },
      manifest: {
        reference:   order.id,
        description: `${order.items?.length ?? 0} item(s) from ${STORE.name}`,
        total_value: Math.round(order.total * 100),
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Uber API error");
  return {
    deliveryId:  data.id ?? order.id,
    status:      data.status ?? "pending",
    trackingUrl: data.tracking_url ?? undefined,
  };
}

// ── POST /api/delivery/dispatch ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { orderId, provider } = await req.json() as { orderId: string; provider: "doordash" | "uber" };

  const orders = loadOrders();
  const order  = orders.find((o) => o.id === orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.mode !== "delivery") return NextResponse.json({ error: "Order is not a delivery" }, { status: 400 });

  const delivery = loadDelivery();
  const cfg = delivery.thirdParty?.[provider];
  if (!cfg?.enabled) return NextResponse.json({ error: `${provider} is not enabled` }, { status: 400 });

  try {
    const result = provider === "doordash"
      ? await dispatchDoorDash(order, delivery.thirdParty.doordash)
      : await dispatchUber(order, delivery.thirdParty.uber);

    const updated: AdminOrder = {
      ...order,
      status: "out_for_delivery",
      thirdPartyDelivery: {
        provider,
        deliveryId:   result.deliveryId,
        status:       result.status,
        trackingUrl:  result.trackingUrl,
        dispatchedAt: new Date().toISOString(),
      },
    };

    const updatedOrders = orders.map((o) => o.id === orderId ? updated : o);
    saveOrders(updatedOrders);

    return NextResponse.json({ ok: true, order: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Dispatch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
