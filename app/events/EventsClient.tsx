"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, MapPin, Clock, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { Event } from "@/app/api/events/route";

type Tab = "upcoming" | "this_week" | "this_month" | "past" | "calendar";

interface Props { events: Event[] }

function parseDate(d: string) { return new Date(d + "T00:00:00"); }

function isSameMonth(d: Date, ref: Date) {
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}
function isThisWeek(d: Date, now: Date) {
  const start = new Date(now); start.setDate(now.getDate() - now.getDay());
  const end   = new Date(start); end.setDate(start.getDate() + 6);
  return d >= start && d <= end;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* ── Empty state (matches reference site) ── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Calendar size={56} className="text-stone-800" strokeWidth={1.5} />
      <p className="text-xl font-semibold text-stone-800">No Events</p>
      <p className="text-stone-500">Please check back later.</p>
    </div>
  );
}

/* ── Event card ── */
function EventCard({ event }: { event: Event }) {
  const d   = parseDate(event.date);
  const day = d.getDate();
  const mon = MONTH_NAMES[d.getMonth()].slice(0, 3).toUpperCase();

  return (
    <div className="flex gap-4 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {event.imageUrl && (
        <div className="w-32 sm:w-44 flex-shrink-0 relative overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex gap-3 py-4 pr-4 flex-1 min-w-0">
        {/* Date block */}
        <div className="flex-shrink-0 w-14 flex flex-col items-center justify-start pt-1">
          <span className="text-[10px] font-bold text-crimson uppercase tracking-wider">{mon}</span>
          <span className="text-3xl font-extrabold text-stone-900 leading-none">{day}</span>
          <span className="text-[10px] text-stone-400 mt-0.5">{d.getFullYear()}</span>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="font-bold text-stone-900 text-base leading-tight group-hover:text-crimson transition-colors">
            {event.title}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(event.startTime || event.endTime) && (
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Clock size={12} className="text-crimson" />
                {event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <MapPin size={12} className="text-crimson" />
                {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">{event.description}</p>
          )}
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {event.tags.map((t) => (
                <span key={t} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
          {event.href && (
            <Link href={event.href} className="inline-flex items-center gap-1 text-xs text-crimson font-semibold hover:underline mt-1">
              Learn More <ArrowRight size={11} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Calendar grid ── */
function CalendarGrid({
  cur, events, search,
}: { cur: Date; events: Event[]; search: string }) {
  const now         = new Date();
  const daysInMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  const firstDay    = new Date(cur.getFullYear(), cur.getMonth(), 1).getDay();
  const [selected, setSelected] = useState<number | null>(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, Event[]>();
    const q   = search.trim().toLowerCase();
    for (const ev of events) {
      if (!ev.active) continue;
      const d = parseDate(ev.date);
      if (!isSameMonth(d, cur)) continue;
      if (q && !ev.title.toLowerCase().includes(q) && !ev.description.toLowerCase().includes(q)) continue;
      const day = d.getDate();
      map.set(day, [...(map.get(day) ?? []), ev]);
    }
    return map;
  }, [events, cur, search]);

  const selectedEvents = selected ? (eventsByDay.get(selected) ?? []) : [];
  const totalEvents    = [...eventsByDay.values()].flat().length;

  return (
    <div className="space-y-6">
      {totalEvents === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold text-stone-400 uppercase py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const hasEvents = eventsByDay.has(day);
                const isToday   = day === now.getDate() && isSameMonth(now, cur);
                const isSel     = day === selected;
                return (
                  <button
                    key={day}
                    onClick={() => setSelected(isSel ? null : day)}
                    className={`relative aspect-square rounded-xl text-sm font-medium flex flex-col items-center justify-center transition-all ${
                      isSel     ? "bg-crimson text-white shadow-md"
                      : isToday ? "bg-stone-900 text-white"
                      : hasEvents ? "bg-red-50 text-crimson hover:bg-red-100 font-bold"
                      : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {day}
                    {hasEvents && !isSel && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-crimson" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected day events */}
      {selected !== null && (
        <div className="space-y-3">
          <p className="font-semibold text-stone-700 text-sm">
            {selectedEvents.length > 0
              ? `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} on ${MONTH_NAMES[cur.getMonth()]} ${selected}`
              : `No events on ${MONTH_NAMES[cur.getMonth()]} ${selected}`}
          </p>
          {selectedEvents.map((ev) => <EventCard key={ev.id} event={ev} />)}
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
export default function EventsClient({ events }: Props) {
  const [tab, setTab]         = useState<Tab>("upcoming");
  const [search, setSearch]   = useState("");
  const now = new Date();

  // Calendar month state — lifted up so it shows in the header row
  const [calMonth, setCalMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const prevMonth = () => setCalMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const activeEvents = useMemo(() => events.filter((e) => e.active), [events]);

  const filtered = useMemo(() => {
    if (!search.trim()) return activeEvents;
    const q = search.toLowerCase();
    return activeEvents.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [activeEvents, search]);

  const tabEvents = useMemo(() => {
    const today = new Date(now.toDateString());
    switch (tab) {
      case "upcoming":
        return filtered.filter((e) => parseDate(e.date) >= today)
          .sort((a, b) => a.date.localeCompare(b.date));
      case "this_week":
        return filtered.filter((e) => isThisWeek(parseDate(e.date), today))
          .sort((a, b) => a.date.localeCompare(b.date));
      case "this_month":
        return filtered.filter((e) => isSameMonth(parseDate(e.date), today))
          .sort((a, b) => a.date.localeCompare(b.date));
      case "past":
        return filtered.filter((e) => parseDate(e.date) < today)
          .sort((a, b) => b.date.localeCompare(a.date));
      default:
        return filtered;
    }
  }, [filtered, tab, now]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "upcoming",   label: "Upcoming" },
    { id: "this_week",  label: "This Week" },
    { id: "this_month", label: "This Month" },
    { id: "past",       label: "Past" },
    { id: "calendar",   label: "Calendar" },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">

      {/* Page title */}
      <h1 className="font-heading text-3xl font-extrabold text-crimson mb-6 text-center">Events</h1>

      {/* Tabs — centered, full-width, bold */}
      <div className="border-b border-stone-200 mb-0">
        <div className="grid grid-cols-5 -mb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(""); }}
              className={`py-4 text-sm font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap text-center ${
                tab === t.id
                  ? "border-crimson text-crimson"
                  : "border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search / Calendar nav row */}
      <div className="flex items-center gap-4 py-3 mb-8">
        {tab === "calendar" && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-600">
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-stone-800 whitespace-nowrap min-w-[130px] text-center">
              {MONTH_NAMES[calMonth.getMonth()]} {calMonth.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-600">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-stone-100 border border-stone-200 rounded-lg pl-4 pr-10 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-crimson transition-colors"
          />
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-crimson" />
        </div>
      </div>

      {/* Content */}
      {tab === "calendar" ? (
        <CalendarGrid cur={calMonth} events={events} search={search} />
      ) : tabEvents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {tabEvents.map((ev) => <EventCard key={ev.id} event={ev} />)}
        </div>
      )}
    </div>
  );
}
