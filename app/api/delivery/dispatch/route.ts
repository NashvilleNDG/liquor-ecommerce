import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import fs from "fs";
import path from "path";
import type { AdminOrder } from "@/app/api/orders/route";
import type { DeliverySettings } from "@/app/api/delivery/route";

const ORDERS_FILE   = path.join(process.cwd(), "data", "orders.json");
const DELIVERY_FILE = path.join(process.cwd(), "data", "delivery.json");
const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

// ── Platform credentials from environment (NDG-level, not per-store) ─────────
const DD_DEVELOPER_ID    = process.env.DOORDASH_DEVELOPER_ID    ?? "";
const DD_KEY_ID          = process.env.DOORDASH_KEY_ID          ?? "";
const DD_SIGNING_SECRET  = process.env.DOORDASH_SIGNING_SECRET  ?? "";
const UBER_CLIENT_ID     = process.env.UBER_CLIENT_ID           ?? "";
const UBER_CLIENT_SECRET = process.env.UBER_CLIENT_SECRET       ?? "";

const STORE = {
  name:    "Stones River Total Beverages",
  address: "208 North Thompson Lane",
  city:    "Murfreesboro",
  state:   "TN",
  zip:     "37129",
  country: "US",
  phone:   "+16158951888",
  get fullAddress() { return `${this.address}, ${this.city}, ${this.state} ${this.zip}`; },
};

// Hydrate store from settings.json if available
try {
  const s = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
  if (s.address)  STORE.address = s.address;
  if (s.city)     STORE.city    = s.city;
  if (s.state)    STORE.state   = s.state;
  if (s.zip)      STORE.zip     = s.zip;
  if (s.phone)    STORE.phone   = s.phone.replace(/\D/g, "").replace(/^1?/, "+1");
  if (s.storeName) STORE.name   = s.storeName;
} catch { /* use defaults */ }

function loadOrders(): AdminOrder[] {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")); } catch { return []; }
}
function saveOrders(orders: AdminOrder[]) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}
function loadDelivery(): DeliverySettings {
  try { return JSON.parse(fs.readFileSync(DELIVERY_FILE, "utf8")); } catch { return {} as DeliverySettings; }
}

// Parse "123 Main St, Murfreesboro, TN 37129" into components
function parseAddress(full: string) {
  const parts = full.split(",").map(s => s.trim());
  const street   = parts[0] ?? "";
  const city     = parts[1] ?? "";
  const stateZip = (parts[2] ?? "").trim().split(/\s+/);
  const state    = stateZip[0] ?? "TN";
  const zip      = stateZip[1] ?? "";
  return { street, city, state, zip };
}

// ── DoorDash Drive ──────────────────────────────────────────────────────────
function makeDoorDashJWT(): string {
  const now     = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ aud: "doordash", iss: DD_DEVELOPER_ID, kid: DD_KEY_ID, exp: now + 300, iat: now })).toString("base64url");
  const sig     = createHmac("sha256", DD_SIGNING_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

async function dispatchDoorDash(order: AdminOrder, merchantId?: string) {
  if (!DD_DEVELOPER_ID || !DD_KEY_ID || !DD_SIGNING_SECRET) {
    throw new Error("DoorDash platform credentials not configured in environment");
  }
  const jwt = makeDoorDashJWT();
  const body: Record<string, unknown> = {
    external_delivery_id:  order.id,
    pickup_address:        STORE.fullAddress,
    pickup_business_name:  STORE.name,
    pickup_phone_number:   STORE.phone,
    pickup_instructions:   "Pick up the bagged order at the counter.",
    dropoff_address:       order.address ?? "",
    dropoff_business_name: order.customer,
    dropoff_phone_number:  order.phone ?? "",
    dropoff_instructions:  order.notes ?? "",
    order_value:           Math.round(order.total * 100),
    tip:                   0,
    items: order.items?.map(i => ({ name: i.name, quantity: i.qty, price: Math.round(i.price * 100) })) ?? [],
  };
  if (merchantId) body.merchant_id = merchantId;

  const res  = await fetch("https://openapi.doordash.com/drive/v2/deliveries", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "DoorDash API error");
  return {
    deliveryId:  String(data.external_delivery_id ?? order.id),
    status:      data.delivery_status ?? "created",
    trackingUrl: data.tracking_url as string | undefined,
  };
}

// ── Uber Direct ─────────────────────────────────────────────────────────────
let uberTokenCache: { token: string; expiresAt: number } | null = null;

async function getUberToken(): Promise<string> {
  if (uberTokenCache && Date.now() < uberTokenCache.expiresAt) {
    return uberTokenCache.token;
  }
  if (!UBER_CLIENT_ID || !UBER_CLIENT_SECRET) {
    throw new Error("Uber Direct platform credentials not configured in environment");
  }
  const res  = await fetch("https://auth.uber.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "client_credentials",
      client_id:     UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET,
      scope:         "eats.deliveries",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? "Uber auth error");
  // Cache for 29 days (token valid 30 days)
  uberTokenCache = { token: data.access_token, expiresAt: Date.now() + 29 * 24 * 60 * 60 * 1000 };
  return data.access_token;
}

async function dispatchUber(order: AdminOrder, customerId?: string) {
  const token    = await getUberToken();
  const customer = parseAddress(order.address ?? "");
  const [firstName, ...rest] = (order.customer ?? "Guest").split(" ");
  const lastName = rest.join(" ") || firstName;

  const pickupAddr = {
    street_address: [STORE.address],
    city:           STORE.city,
    state:          STORE.state,
    zip_code:       STORE.zip,
    country:        STORE.country,
  };
  const dropoffAddr = {
    street_address: [customer.street],
    city:           customer.city,
    state:          customer.state,
    zip_code:       customer.zip,
    country:        "US",
  };

  // Step 1: Get delivery estimate
  const estRes = await fetch("https://api.uber.com/v1/eats/deliveries/estimates", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      pickup:    { address: pickupAddr },
      dropoff:   { address: dropoffAddr },
      pickup_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
  });
  const est = await estRes.json();
  if (!estRes.ok) throw new Error(est.message ?? "Uber estimate error");

  // Step 2: Create delivery order (scoped to store's customer account if provided)
  const endpoint = customerId
    ? `https://api.uber.com/v1/customers/${customerId}/deliveries`
    : "https://api.uber.com/v1/eats/deliveries/orders";

  const orderRes = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      estimate_id:       est.id,
      external_order_id: order.id,
      pickup_at:         new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      order_items: order.items?.map(i => ({
        name:          i.name,
        quantity:      i.qty,
        price:         Math.round(i.price * 100),
        currency_code: "USD",
      })) ?? [],
      pickup: {
        name:         STORE.name,
        phone_number: STORE.phone,
        address:      pickupAddr,
        instructions: "Pick up the bagged order at the counter.",
      },
      dropoff: {
        first_name:   firstName,
        last_name:    lastName,
        phone_number: order.phone ?? "",
        email:        order.email ?? "",
        address:      dropoffAddr,
        instructions: order.notes ?? "",
      },
      order_summary: {
        currency_code: "USD",
        order_value:   Math.round(order.total * 100),
      },
    }),
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) throw new Error(orderData.message ?? "Uber order creation error");

  return {
    deliveryId:  String(orderData.order_id ?? order.id),
    status:      orderData.status ?? "pending",
    trackingUrl: orderData.order_tracking_url as string | undefined,
  };
}

// ── POST /api/delivery/dispatch ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { orderId, provider } = await req.json() as { orderId: string; provider: "doordash" | "uber" };

  const orders = loadOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.mode !== "delivery") return NextResponse.json({ error: "Order is not a delivery" }, { status: 400 });

  const delivery = loadDelivery();
  const cfg      = delivery.thirdParty?.[provider];
  if (!cfg?.enabled) return NextResponse.json({ error: `${provider} is not enabled` }, { status: 400 });

  try {
    const result = provider === "doordash"
      ? await dispatchDoorDash(order, delivery.thirdParty.doordash.merchantId)
      : await dispatchUber(order, delivery.thirdParty.uber.customerId);

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

    saveOrders(orders.map(o => o.id === orderId ? updated : o));
    return NextResponse.json({ ok: true, order: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Dispatch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
