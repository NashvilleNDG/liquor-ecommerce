import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "Stones River Beverages <no-reply@stonesriverbeer.com>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) {
    console.log("[email dev]", opts.subject, "→", opts.to);
    return;
  }
  await resend.emails.send({ from: FROM, ...opts });
}

// ── Templates ────────────────────────────────────────────────────────────────

export function verificationEmailHtml(name: string, code: string): string {
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9f9f9;padding:40px 16px;margin:0">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  <div style="text-align:center;margin-bottom:32px">
    <div style="display:inline-block;background:#8B0000;border-radius:50%;padding:12px">
      <span style="font-size:24px">🍷</span>
    </div>
    <h1 style="margin:16px 0 4px;font-size:22px;color:#1a1a1a">Verify your email</h1>
    <p style="color:#666;font-size:14px;margin:0">Hi ${name}, confirm your account below.</p>
  </div>
  <div style="text-align:center;background:#fafafa;border:1px solid #e5e5e5;border-radius:12px;padding:32px;margin-bottom:28px">
    <p style="color:#444;font-size:13px;margin:0 0 12px">Your verification code</p>
    <div style="font-size:40px;font-weight:800;letter-spacing:12px;color:#8B0000;font-family:monospace">${code}</div>
    <p style="color:#888;font-size:12px;margin:12px 0 0">Expires in 15 minutes</p>
  </div>
  <p style="color:#888;font-size:12px;text-align:center;margin:0">
    If you didn't create an account, you can safely ignore this email.
  </p>
</div>
</body></html>`;
}

export function orderConfirmationHtml(order: {
  id: string;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  tax: number;
  delivery: number;
  discount: number;
  total: number;
  mode: "delivery" | "pickup";
  address?: string;
}): string {
  const itemRows = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:#333">${i.name}</td>
          <td style="padding:8px 0;font-size:14px;color:#666;text-align:center">×${i.qty}</td>
          <td style="padding:8px 0;font-size:14px;color:#333;text-align:right">$${(i.price * i.qty).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const deliveryLine =
    order.mode === "delivery"
      ? `<tr><td style="font-size:13px;color:#666">Delivery</td><td></td><td style="font-size:13px;color:#666;text-align:right">$${order.delivery.toFixed(2)}</td></tr>`
      : `<tr><td style="font-size:13px;color:#666">Pickup</td><td></td><td style="font-size:13px;color:green;text-align:right">FREE</td></tr>`;

  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9f9f9;padding:40px 16px;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  <div style="text-align:center;margin-bottom:28px">
    <div style="display:inline-block;background:#8B0000;border-radius:50%;padding:12px">
      <span style="font-size:24px">🍾</span>
    </div>
    <h1 style="margin:16px 0 4px;font-size:22px;color:#1a1a1a">Order Confirmed!</h1>
    <p style="color:#666;font-size:14px;margin:0">Thanks ${order.customer} — we've received your order.</p>
    <p style="color:#999;font-size:12px;margin:6px 0 0">Order # ${order.id}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
    <thead><tr style="border-bottom:2px solid #f0f0f0">
      <th style="text-align:left;padding:0 0 8px;font-size:12px;color:#999;text-transform:uppercase">Item</th>
      <th style="text-align:center;padding:0 0 8px;font-size:12px;color:#999;text-transform:uppercase">Qty</th>
      <th style="text-align:right;padding:0 0 8px;font-size:12px;color:#999;text-transform:uppercase">Price</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
    <tfoot style="border-top:1px solid #f0f0f0">
      <tr><td style="font-size:13px;color:#666;padding-top:10px">Subtotal</td><td></td><td style="font-size:13px;color:#666;text-align:right;padding-top:10px">$${order.subtotal.toFixed(2)}</td></tr>
      ${order.discount > 0 ? `<tr><td style="font-size:13px;color:#16a34a">Discount</td><td></td><td style="font-size:13px;color:#16a34a;text-align:right">−$${order.discount.toFixed(2)}</td></tr>` : ""}
      <tr><td style="font-size:13px;color:#666">Tax</td><td></td><td style="font-size:13px;color:#666;text-align:right">$${order.tax.toFixed(2)}</td></tr>
      ${deliveryLine}
      <tr style="border-top:2px solid #f0f0f0">
        <td style="font-size:16px;font-weight:700;color:#1a1a1a;padding-top:10px">Total</td>
        <td></td>
        <td style="font-size:16px;font-weight:700;color:#8B0000;text-align:right;padding-top:10px">$${order.total.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
  ${order.address ? `<div style="background:#fafafa;border-radius:10px;padding:14px;margin-bottom:20px;font-size:13px;color:#555"><strong>Delivery to:</strong> ${order.address}</div>` : ""}
  <div style="background:#fff8f8;border:1px solid #fde8e8;border-radius:10px;padding:14px;font-size:13px;color:#555;margin-bottom:20px">
    <strong>📍 Store:</strong> 208 North Thompson Lane, Murfreesboro, TN 37129<br/>
    <strong>📞 Questions?</strong> Give us a call and we'll be happy to help.
  </div>
  <p style="color:#aaa;font-size:11px;text-align:center;margin:0">
    Stones River Beer Wine &amp; Spirits · Murfreesboro, TN
  </p>
</div>
</body></html>`;
}

export function newOrderAdminHtml(order: { id: string; customer: string; total: number; mode: string }): string {
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9f9f9;padding:40px 16px;margin:0">
<div style="max-width:400px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
  <h2 style="margin:0 0 16px;color:#1a1a1a">🛒 New Order Received</h2>
  <p style="color:#555;font-size:14px;margin:0 0 8px"><strong>Order:</strong> ${order.id}</p>
  <p style="color:#555;font-size:14px;margin:0 0 8px"><strong>Customer:</strong> ${order.customer}</p>
  <p style="color:#555;font-size:14px;margin:0 0 8px"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
  <p style="color:#555;font-size:14px;margin:0 0 24px"><strong>Mode:</strong> ${order.mode}</p>
  <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/dashboard/orders" style="display:inline-block;background:#8B0000;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px">View in Dashboard →</a>
</div>
</body></html>`;
}
