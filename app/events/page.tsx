import { readFileSync, existsSync } from "fs";
import path from "path";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import EventsClient from "./EventsClient";
import type { Event } from "@/app/api/events/route";

export const dynamic = "force-dynamic";

function readEvents(): Event[] {
  const file = path.join(process.cwd(), "data", "events.json");
  if (!existsSync(file)) return [];
  try { return JSON.parse(readFileSync(file, "utf-8")); } catch { return []; }
}

export default function EventsPage() {
  const events = readEvents();
  return (
    <>
      <Navbar />
      <main>
        <EventsClient events={events} />

        {/* Newsletter */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-stone-900 rounded-2xl p-8 sm:p-12 text-center space-y-5">
            <p className="text-3xl">🎉</p>
            <h2 className="font-heading text-2xl font-bold text-white">Be the first to know!</h2>
            <p className="text-stone-400 max-w-sm mx-auto text-sm leading-relaxed">
              Subscribe to our newsletter and get notified about upcoming tastings, events &amp; exclusive deals.
            </p>
            <NewsletterForm />
            <p className="text-stone-600 text-xs">Must be 21+ to subscribe. Unsubscribe anytime.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
