"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Store, Phone, Mail, MapPin, Clock, DollarSign, Globe, Share2, Loader2, CheckCircle } from "lucide-react";
import type { StoreSettings } from "@/app/api/settings/route";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-stone-100">
        <div className="bg-amber-50 rounded-lg p-1.5">
          <Icon size={16} className="text-amber-600" />
        </div>
        <h2 className="text-base font-bold text-stone-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 transition-colors placeholder-stone-400";

export default function SettingsPage() {
  const [form,    setForm]    = useState<StoreSettings | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setForm);
  }, []);

  function set(key: keyof StoreSettings, value: string | number | boolean) {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!form) return (
    <div className="min-h-full bg-white flex items-center justify-center">
      <Loader2 size={28} className="text-amber-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><Settings size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Store Settings</h1>
              <p className="text-sm text-stone-400 mt-0.5">Manage your store info, hours, and preferences</p>
            </div>
          </div>
          <button
            form="settings-form"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-900 font-bold text-sm rounded-xl transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <form id="settings-form" onSubmit={handleSave}>
        <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-4xl mx-auto space-y-6">

          {/* Store Identity */}
          <Section title="Store Identity" icon={Store}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Store Name">
                <input className={inp} value={form.storeName} onChange={e => set("storeName", e.target.value)} />
              </Field>
              <Field label="Tagline">
                <input className={inp} value={form.tagline} onChange={e => set("tagline", e.target.value)} placeholder="Your local beverage destination" />
              </Field>
            </div>
          </Section>

          {/* Contact */}
          <Section title="Contact Information" icon={Phone}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone Number">
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input className={inp + " pl-9"} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(615) 555-0100" />
                </div>
              </Field>
              <Field label="Email Address">
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input className={inp + " pl-9"} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="hello@stonesriver.com" />
                </div>
              </Field>
            </div>
          </Section>

          {/* Address */}
          <Section title="Store Address" icon={MapPin}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Street Address">
                  <input className={inp} value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Main Street" />
                </Field>
              </div>
              <Field label="City">
                <input className={inp} value={form.city} onChange={e => set("city", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="State">
                  <input className={inp} value={form.state} onChange={e => set("state", e.target.value)} placeholder="TN" maxLength={2} />
                </Field>
                <Field label="ZIP Code">
                  <input className={inp} value={form.zip} onChange={e => set("zip", e.target.value)} placeholder="37129" />
                </Field>
              </div>
            </div>
          </Section>

          {/* Hours */}
          <Section title="Store Hours" icon={Clock}>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Monday – Friday">
                <input className={inp} value={form.hoursMonFri} onChange={e => set("hoursMonFri", e.target.value)} placeholder="9:00 AM – 10:00 PM" />
              </Field>
              <Field label="Saturday">
                <input className={inp} value={form.hoursSat} onChange={e => set("hoursSat", e.target.value)} placeholder="9:00 AM – 11:00 PM" />
              </Field>
              <Field label="Sunday">
                <input className={inp} value={form.hoursSun} onChange={e => set("hoursSun", e.target.value)} placeholder="12:00 PM – 8:00 PM" />
              </Field>
            </div>
          </Section>

          {/* Finances */}
          <Section title="Pricing & Tax" icon={DollarSign}>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Tax Rate (%)">
                <input className={inp} type="number" step="0.01" min="0" max="30" value={form.taxRate} onChange={e => set("taxRate", parseFloat(e.target.value) || 0)} />
              </Field>
              <Field label="Min. Order Amount ($)">
                <input className={inp} type="number" step="1" min="0" value={form.minOrderAmount} onChange={e => set("minOrderAmount", parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Currency">
                <select className={inp} value={form.currency} onChange={e => set("currency", e.target.value)}>
                  <option value="USD">USD — US Dollar</option>
                  <option value="CAD">CAD — Canadian Dollar</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Regional */}
          <Section title="Regional" icon={Globe}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Timezone">
                <select className={inp} value={form.timezone} onChange={e => set("timezone", e.target.value)}>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </Field>
              <Field label="Age Verification">
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => set("ageVerification", !form.ageVerification)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.ageVerification ? "bg-amber-500" : "bg-stone-200"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.ageVerification ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm text-stone-700 font-medium">
                    {form.ageVerification ? "Enabled — show age gate" : "Disabled"}
                  </span>
                </div>
              </Field>
            </div>
          </Section>

          {/* Social */}
          <Section title="Social Media" icon={Share2}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Facebook URL">
                <input className={inp} value={form.facebookUrl} onChange={e => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/stonesriver" />
              </Field>
              <Field label="Instagram URL">
                <input className={inp} value={form.instagramUrl} onChange={e => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/stonesriver" />
              </Field>
            </div>
          </Section>

        </div>
      </form>
    </div>
  );
}
