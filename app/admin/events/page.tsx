import { readFileSync, existsSync } from "fs";
import path from "path";
import type { Event } from "@/app/api/events/route";
import EventsAdminClient from "./EventsAdminClient";

export const dynamic = "force-dynamic";

function readEvents(): Event[] {
  const file = path.join(process.cwd(), "data", "events.json");
  if (!existsSync(file)) return [];
  try { return JSON.parse(readFileSync(file, "utf-8")); } catch { return []; }
}

export default function AdminEventsPage() {
  return <EventsAdminClient initialEvents={readEvents()} />;
}
