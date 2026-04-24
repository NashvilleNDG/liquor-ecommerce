"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Check, ToggleLeft, ToggleRight, Calendar } from "lucide-react";
import type { Event } from "@/app/api/events/route";

interface Props { initialEvents: Event[] }

const EMPTY: Omit<Event, "id"> = {
  title: "", description: "", date: "", startTime: "", endTime: "",
  location: "208 North Thompson Lane, Murfreesboro, TN", imageUrl: "", href: "", tags: [], active: true,
};

export default function EventsAdminClient({ initialEvents }: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [dirty, setDirty]   = useState(false);
  const [form, setForm]     = useState<Omit<Event, "id">>(EMPTY);
  const [adding, setAdding] = useState(false);
  const [tagInput, setTagInput] = useState("");

  function mark() { setDirty(true); setSaved(false); }

  function updateField(id: string, field: keyof Event, value: unknown) {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e));
    mark();
  }

  function remove(id: string) { setEvents((prev) => prev.filter((e) => e.id !== id)); mark(); }

  function addEvent() {
    if (!form.title.trim() || !form.date) return;
    setEvents((prev) => [...prev, { ...form, id: `event-${Date.now()}` }]);
    setForm(EMPTY); setTagInput(""); setAdding(false); mark();
  }

  async function save() {
    setSaving(true);
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(events),
    });
    setSaving(false); setSaved(true); setDirty(false);
  }

  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Calendar size={20} className="text-crimson" /> Events
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">{events.filter((e) => e.active).length} active · {events.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAdding((v) => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-700 transition-all">
              <Plus size={14} /> Add Event
            </button>
            <button
              onClick={save} disabled={saving || !dirty}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                saved && !dirty ? "bg-green-100 text-green-700 border border-green-200"
                  : dirty ? "bg-crimson text-white hover:bg-red-700 shadow-md"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving…" : saved && !dirty ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Add event form */}
        {adding && (
          <div className="bg-white border-2 border-crimson rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-stone-900">New Event</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "title",       label: "Title *",       placeholder: "Wine Tasting Night",          type: "text" },
                { key: "date",        label: "Date *",        placeholder: "",                            type: "date" },
                { key: "startTime",   label: "Start Time",    placeholder: "6:00 PM",                     type: "text" },
                { key: "endTime",     label: "End Time",      placeholder: "9:00 PM",                     type: "text" },
                { key: "location",    label: "Location",      placeholder: "208 North Thompson Lane…",    type: "text" },
                { key: "imageUrl",    label: "Image URL",     placeholder: "https://...",                 type: "text" },
                { key: "href",        label: "Link (optional)",placeholder: "/shop",                       type: "text" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key} className={key === "description" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form as Record<string, string>)[key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-crimson transition-colors"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the event…"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-crimson transition-colors resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Tags (press Enter)</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 text-xs bg-red-50 border border-red-200 text-crimson px-2 py-0.5 rounded-full">
                      {t}
                      <button onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))} className="hover:opacity-70">×</button>
                    </span>
                  ))}
                </div>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
                      setTagInput("");
                      e.preventDefault();
                    }
                  }}
                  placeholder="e.g. Wine Tasting, Free Entry…"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-crimson transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addEvent} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-crimson text-white hover:bg-red-700 transition-all">
                <Plus size={14} /> Add Event
              </button>
              <button onClick={() => { setAdding(false); setForm(EMPTY); setTagInput(""); }} className="px-4 py-2.5 rounded-xl text-sm text-stone-500 hover:text-stone-900 border border-stone-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-stone-200">
            <Calendar size={40} className="text-stone-300" />
            <p className="text-stone-500 font-medium">No events yet.</p>
            <p className="text-stone-400 text-sm">Click &ldquo;Add Event&rdquo; to create your first event.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((ev) => (
              <div key={ev.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${ev.active ? "border-stone-200" : "border-stone-100 opacity-60"}`}>
                <div className="flex gap-4 p-5">
                  {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-stone-900">{ev.title}</p>
                        <p className="text-sm text-stone-500">{ev.date} · {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}</p>
                        {ev.location && <p className="text-xs text-stone-400">{ev.location}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => updateField(ev.id, "active", !ev.active)} className={`text-xs font-medium flex items-center gap-1 transition-colors ${ev.active ? "text-green-600" : "text-stone-400"}`}>
                          {ev.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {ev.active ? "Active" : "Inactive"}
                        </button>
                        <button onClick={() => remove(ev.id)} className="text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                    {/* Inline edit fields */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { key: "title",     label: "Title" },
                        { key: "date",      label: "Date",       type: "date" },
                        { key: "startTime", label: "Start Time" },
                        { key: "endTime",   label: "End Time" },
                        { key: "location",  label: "Location" },
                        { key: "imageUrl",  label: "Image URL" },
                        { key: "href",      label: "Link" },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">{label}</label>
                          <input
                            type={type ?? "text"}
                            value={(ev as Record<string, string>)[key] ?? ""}
                            onChange={(e) => updateField(ev.id, key as keyof Event, e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 outline-none focus:border-crimson transition-colors"
                          />
                        </div>
                      ))}
                      <div className="col-span-2 sm:col-span-3">
                        <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">Description</label>
                        <textarea
                          rows={2}
                          value={ev.description}
                          onChange={(e) => updateField(ev.id, "description", e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 outline-none focus:border-crimson transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
