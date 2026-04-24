import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { MapPin, Truck, Store, Clock, Phone, CheckCircle, XCircle } from "lucide-react";

const DELIVERY_ZONES = [
  { area: "Murfreesboro",     zip: ["37127", "37128", "37129", "37130", "37131", "37132", "37133"], fee: "Free over $99", time: "2–4 hrs", available: true },
  { area: "Smyrna",           zip: ["37167"],                                                       fee: "Free over $99", time: "2–4 hrs", available: true },
  { area: "La Vergne",        zip: ["37086"],                                                       fee: "Free over $99", time: "3–5 hrs", available: true },
  { area: "Christiana",       zip: ["37037"],                                                       fee: "$4.99",         time: "3–5 hrs", available: true },
  { area: "Rockvale",         zip: ["37153"],                                                       fee: "$4.99",         time: "3–5 hrs", available: true },
  { area: "Eagleville",       zip: ["37060"],                                                       fee: "$9.99",         time: "4–6 hrs", available: true },
  { area: "Lascassas",        zip: ["37085"],                                                       fee: "$9.99",         time: "4–6 hrs", available: true },
  { area: "Nolensville",      zip: ["37135"],                                                       fee: "$9.99",         time: "4–6 hrs", available: true },
  { area: "Nashville (outer)", zip: ["37201–37232"],                                                fee: "Call for quote", time: "Call us", available: false },
];

const HOURS = [
  { day: "Monday – Thursday", hours: "9:00 AM – 10:00 PM" },
  { day: "Friday – Saturday",  hours: "9:00 AM – 11:00 PM" },
  { day: "Sunday",             hours: "12:00 PM – 8:00 PM" },
];

export default function DeliveryPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="bg-black text-white py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-crimson mb-2">
            <Truck size={28} className="text-white" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold">Delivery & Pickup</h1>
          <p className="text-stone-400 text-base">
            Same-day delivery across Rutherford County · Free delivery on orders $99+
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/shop"
              className="bg-crimson hover:bg-crimson-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Shop Now
            </Link>
            <a
              href="tel:6158951888"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              <Phone size={15} /> (615) 895-1888
            </a>
          </div>
        </div>
      </div>

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* How it works */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: "🛒", step: "1", title: "Add to Cart",    desc: "Browse 7,000+ products and add your selections to your cart." },
            { icon: "📦", step: "2", title: "Choose Method",   desc: "Select home delivery or free same-day store pickup at checkout." },
            { icon: "🚚", step: "3", title: "Fast Delivery",   desc: "We deliver within hours. Must be 21+ with valid ID at delivery." },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-3">
              <span className="text-4xl">{icon}</span>
              <div className="w-7 h-7 bg-crimson text-white rounded-full text-xs font-extrabold flex items-center justify-center mx-auto">
                {step}
              </div>
              <h3 className="font-bold text-stone-900 text-lg">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>

        {/* Delivery zones table */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-5">Delivery Zones</h2>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 px-5 py-3">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Area</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">ZIP Codes</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Delivery Fee</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Est. Time</span>
            </div>
            {DELIVERY_ZONES.map(({ area, zip, fee, time, available }) => (
              <div key={area} className="grid grid-cols-4 items-center px-5 py-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-2">
                  {available
                    ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    : <XCircle   size={14} className="text-stone-300 flex-shrink-0" />}
                  <span className="text-sm font-semibold text-stone-800">{area}</span>
                </div>
                <span className="text-xs text-stone-500">{zip.join(", ")}</span>
                <span className={`text-sm font-bold ${fee === "Free over $99" ? "text-green-600" : fee === "Call for quote" ? "text-stone-400" : "text-stone-700"}`}>
                  {fee}
                </span>
                <span className="text-sm text-stone-500">{time}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3">
            * Orders $99+ qualify for free delivery within Murfreesboro, Smyrna, and La Vergne. Other zones may have a flat fee.
            Call us at (615) 895-1888 to confirm delivery availability for your address.
          </p>
        </section>

        {/* Store pickup */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-stone-900 text-white rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-crimson rounded-full flex items-center justify-center flex-shrink-0">
                <Store size={18} />
              </div>
              <h2 className="text-xl font-bold">Free Store Pickup</h2>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Order online and pick up at our Murfreesboro location — usually ready within 30–60 minutes.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-crimson mt-0.5 flex-shrink-0" />
                <span>208 North Thompson Lane, Murfreesboro, TN 37129</span>
              </div>
              <a
                href="https://maps.google.com/?q=208+North+Thompson+Lane+Murfreesboro+TN+37129"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-crimson hover:underline text-xs"
              >
                Get directions →
              </a>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-stone-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">Store Hours</h2>
            </div>
            <div className="space-y-3">
              {HOURS.map(({ day, hours }) => (
                <div key={day} className="flex justify-between items-center text-sm">
                  <span className="text-stone-600">{day}</span>
                  <span className="font-semibold text-stone-900">{hours}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">
              Hours may vary on holidays. Call ahead to confirm.
            </p>
          </div>
        </section>

        {/* Policy */}
        <section className="bg-red-50 border border-red-100 rounded-2xl p-8 space-y-4">
          <h2 className="text-xl font-bold text-stone-900">Delivery Policy</h2>
          <ul className="space-y-2 text-sm text-stone-600">
            {[
              "All deliveries require a valid government-issued ID showing you are 21 or older.",
              "Deliveries cannot be left unattended — someone must be present to sign.",
              "We reserve the right to refuse delivery if ID cannot be verified.",
              "Orders placed before 6 PM are typically delivered same day.",
              "Delivery fees are non-refundable once the order is dispatched.",
              "We currently deliver to addresses within Rutherford County and surrounding areas.",
            ].map((policy) => (
              <li key={policy} className="flex items-start gap-2">
                <CheckCircle size={14} className="text-crimson mt-0.5 flex-shrink-0" />
                {policy}
              </li>
            ))}
          </ul>
        </section>

      </main>

      <Footer />
    </>
  );
}
