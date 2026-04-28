"use client";

import { useState, useEffect } from "react";
import { Truck, Plus, Save, Loader2, CheckCircle, X, ExternalLink, Info } from "lucide-react";
import type { DeliverySettings, DeliveryZone, ThirdPartyDeliveryProvider } from "@/app/api/delivery/route";

const inp = "w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 transition-colors placeholder-stone-400";
const inpSm = `${inp} font-mono text-xs`;

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${on ? "bg-amber-500" : "bg-stone-200"}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-7" : "translate-x-1"}`} />
    </button>
  );
}

function ProviderCard({
  logo, name, color, docs, fields, cfg, onChange,
}: {
  logo: React.ReactNode;
  name: string;
  color: string;
  docs: string;
  fields: { key: keyof ThirdPartyDeliveryProvider; label: string; placeholder: string }[];
  cfg: ThirdPartyDeliveryProvider;
  onChange: (patch: Partial<ThirdPartyDeliveryProvider>) => void;
}) {
  return (
    <div className={`bg-white border-2 rounded-2xl overflow-hidden transition-colors ${cfg.enabled ? `border-${color}-300` : "border-stone-200"}`}>
      <div className={`px-5 py-4 flex items-center justify-between ${cfg.enabled ? `bg-${color}-50` : "bg-stone-50"}`}>
        <div className="flex items-center gap-3">
          {logo}
          <div>
            <p className="font-bold text-stone-900">{name}</p>
            <a href={docs} target="_blank" rel="noopener noreferrer"
              className="text-xs text-stone-400 hover:text-amber-600 flex items-center gap-1 transition-colors">
              Developer docs <ExternalLink size={10} />
            </a>
          </div>
        </div>
        <Toggle on={cfg.enabled} onChange={() => onChange({ enabled: !cfg.enabled })} />
      </div>

      {cfg.enabled && (
        <div className="px-5 py-4 grid sm:grid-cols-2 gap-3">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{label}</label>
              <input
                className={inpSm}
                type="password"
                autoComplete="off"
                value={(cfg[key] as string) ?? ""}
                onChange={(e) => onChange({ [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DeliveryPage() {
  const [form,   setForm]   = useState<DeliverySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => { fetch("/api/delivery").then(r => r.json()).then(setForm); }, []);

  function set<K extends keyof DeliverySettings>(key: K, val: DeliverySettings[K]) {
    setForm(p => p ? { ...p, [key]: val } : p);
    setSaved(false);
  }

  function patchProvider(provider: "doordash" | "uber", patch: Partial<ThirdPartyDeliveryProvider>) {
    setForm(p => p ? { ...p, thirdParty: { ...p.thirdParty, [provider]: { ...p.thirdParty[provider], ...patch } } } : p);
    setSaved(false);
  }

  function addZone() {
    const zone: DeliveryZone = { id: crypto.randomUUID(), label: "New Zone", zips: "", fee: 5.99, active: true };
    setForm(p => p ? { ...p, zones: [...p.zones, zone] } : p);
  }

  function updateZone(id: string, key: keyof DeliveryZone, val: string | number | boolean) {
    setForm(p => p ? { ...p, zones: p.zones.map(z => z.id === id ? { ...z, [key]: val } : z) } : p);
  }

  function removeZone(id: string) {
    setForm(p => p ? { ...p, zones: p.zones.filter(z => z.id !== id) } : p);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    await fetch("/api/delivery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  if (!form) return (
    <div className="min-h-full bg-white flex items-center justify-center">
      <Loader2 size={28} className="text-amber-400 animate-spin" />
    </div>
  );

  const ddEnabled   = form.thirdParty?.doordash?.enabled ?? false;
  const uberEnabled = form.thirdParty?.uber?.enabled ?? false;

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><Truck size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Delivery Settings</h1>
              <p className="text-sm text-stone-400 mt-0.5">Configure delivery fees, zones, and couriers</p>
            </div>
          </div>
          <button form="delivery-form" type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-900 font-bold text-sm rounded-xl transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <form id="delivery-form" onSubmit={handleSave}>
        <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-3xl mx-auto space-y-6">

          {/* Toggle delivery */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-stone-900">Enable Delivery</h2>
                <p className="text-sm text-stone-400 mt-0.5">Allow customers to order for home delivery</p>
              </div>
              <Toggle on={form.enabled} onChange={() => set("enabled", !form.enabled)} />
            </div>
          </div>

          {/* Fees */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <h2 className="font-bold text-stone-900 mb-1">Delivery Pricing</h2>
            <p className="text-xs text-stone-400 mb-4">
              Fee = Base fee + (miles × per-mile rate). Calculated live from the customer&apos;s address at checkout.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Base Fee ($)</label>
                <input className={inp} type="number" step="0.01" min="0" value={form.baseFee ?? 5} onChange={e => set("baseFee", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Per-Mile Rate ($)</label>
                <input className={inp} type="number" step="0.01" min="0" value={form.perMileFee ?? 0.5} onChange={e => set("perMileFee", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Free Delivery Above ($) — 0 to disable</label>
                <input className={inp} type="number" step="1" min="0" value={form.freeThreshold} onChange={e => set("freeThreshold", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Max Delivery Distance (miles)</label>
                <input className={inp} type="number" min="1" value={form.maxDistance} onChange={e => set("maxDistance", parseInt(e.target.value) || 10)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Estimated Delivery Time</label>
                <input className={inp} value={form.estimatedTime} onChange={e => set("estimatedTime", e.target.value)} placeholder="45–60 minutes" />
              </div>
              <div className="flex items-end pb-0.5">
                <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-sm text-amber-800">
                  <span className="font-bold">Example:</span> 3 miles → ${((form.baseFee ?? 5) + 3 * (form.perMileFee ?? 0.5)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Zones */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-stone-900">Delivery Zones</h2>
                <p className="text-xs text-stone-400 mt-0.5">Set different fees per ZIP code area</p>
              </div>
              <button type="button" onClick={addZone} className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-800 transition-colors">
                <Plus size={15} /> Add Zone
              </button>
            </div>
            {form.zones.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">No zones yet. Add a zone to set area-specific delivery fees.</p>
            ) : (
              <div className="space-y-3">
                {form.zones.map(z => (
                  <div key={z.id} className="bg-stone-50 rounded-xl border border-stone-200 p-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Zone Name</label>
                        <input className={inp} value={z.label} onChange={e => updateZone(z.id, "label", e.target.value)} placeholder="Downtown" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">ZIP Codes (comma-separated)</label>
                        <input className={inp} value={z.zips} onChange={e => updateZone(z.id, "zips", e.target.value)} placeholder="37129, 37130, 37132" />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Fee ($)</label>
                          <input className={inp} type="number" step="0.01" min="0" value={z.fee} onChange={e => updateZone(z.id, "fee", parseFloat(e.target.value) || 0)} />
                        </div>
                        <button type="button" onClick={() => removeZone(z.id)} className="mb-0.5 p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Third-Party Delivery */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 space-y-4">
            <div>
              <h2 className="font-bold text-stone-900">Third-Party Courier Integration</h2>
              <p className="text-sm text-stone-400 mt-0.5">
                Dispatch orders directly to DoorDash Drive or Uber Direct drivers from the Orders dashboard.
              </p>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex gap-3 text-sm text-blue-800">
              <Info size={15} className="mt-0.5 shrink-0 text-blue-500" />
              <div>
                <p className="font-semibold mb-0.5">How it works</p>
                <p className="text-blue-700 text-xs leading-relaxed">
                  When you accept an order, a <strong>Dispatch Courier</strong> button appears on the Orders page.
                  Select DoorDash or Uber — a driver is automatically assigned and the order moves to <em>Out for Delivery</em>.
                  You&apos;ll need API credentials from each provider&apos;s developer portal.
                </p>
              </div>
            </div>

            {/* DoorDash */}
            <ProviderCard
              name="DoorDash Drive"
              color="red"
              docs="https://developer.doordash.com/en-US/docs/drive/tutorials/get_started"
              logo={
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">DD</span>
                </div>
              }
              fields={[
                { key: "developerId",  label: "Developer ID",    placeholder: "your_developer_id" },
                { key: "keyId",        label: "Key ID",          placeholder: "your_key_id" },
                { key: "signingSecret", label: "Signing Secret", placeholder: "your_signing_secret" },
              ]}
              cfg={form.thirdParty?.doordash ?? { enabled: false }}
              onChange={(patch) => patchProvider("doordash", patch)}
            />

            {/* Uber */}
            <ProviderCard
              name="Uber Direct"
              color="stone"
              docs="https://developer.uber.com/docs/deliveries/guides/get-started"
              logo={
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">Ub</span>
                </div>
              }
              fields={[
                { key: "clientId",     label: "Client ID",     placeholder: "your_client_id" },
                { key: "clientSecret", label: "Client Secret", placeholder: "your_client_secret" },
                { key: "customerId",   label: "Customer ID",   placeholder: "your_uber_customer_id" },
              ]}
              cfg={form.thirdParty?.uber ?? { enabled: false }}
              onChange={(patch) => patchProvider("uber", patch)}
            />

            {(ddEnabled || uberEnabled) && (
              <p className="text-xs text-stone-400 flex items-center gap-1.5">
                <CheckCircle size={12} className="text-green-500" />
                {[ddEnabled && "DoorDash", uberEnabled && "Uber"].filter(Boolean).join(" & ")} enabled — dispatch buttons will appear on processing orders.
              </p>
            )}
          </div>

        </div>
      </form>
    </div>
  );
}
