"use client";

import Link from "next/link";
import { Wine, MapPin, Phone, Clock, Mail, Instagram, Facebook, Twitter } from "lucide-react";

const HOURS = [
  { day: "Mon – Thu", hours: "9:00 AM – 10:00 PM" },
  { day: "Fri – Sat", hours: "9:00 AM – 11:00 PM" },
  { day: "Sunday",    hours: "12:00 PM – 8:00 PM" },
];

const SHOP_LINKS = [
  { label: "All Products",  href: "/shop" },
  { label: "Beer",          href: "/shop" },
  { label: "Wine",          href: "/shop" },
  { label: "Spirits",       href: "/shop" },
  { label: "CBD",           href: "/shop" },
  { label: "Mixers",        href: "/shop" },
];

const INFO_LINKS = [
  { label: "About Us",       href: "#" },
  { label: "Contact",        href: "#" },
  { label: "Age Policy",     href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use",   href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 dark:bg-stone-950 border-t border-stone-800 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="space-y-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-yellow-500 rounded-lg p-1.5">
              <Wine size={18} className="text-stone-900" />
            </div>
            <span className="font-bold text-white text-lg">LiquorStore</span>
          </Link>
          <p className="text-stone-400 text-sm leading-relaxed">
            Your local premium spirits, beer &amp; wine destination. 7,000+ products, same-day pickup, fast delivery.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: Instagram, label: "Instagram" },
              { icon: Facebook,  label: "Facebook" },
              { icon: Twitter,   label: "Twitter" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="bg-stone-800 hover:bg-yellow-500/20 hover:border-yellow-500/50 border border-stone-700 rounded-xl p-2 text-stone-400 hover:text-yellow-400 transition-all"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop links */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Shop</h3>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-stone-400 hover:text-yellow-400 text-sm transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info links */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Information</h3>
          <ul className="space-y-2.5">
            {INFO_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="text-stone-400 hover:text-yellow-400 text-sm transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + Hours */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Contact</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-stone-400">
              <MapPin size={15} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>123 Main Street<br />Your City, ST 00000</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-stone-400">
              <Phone size={15} className="text-yellow-400 flex-shrink-0" />
              <span>(555) 123-4567</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-stone-400">
              <Mail size={15} className="text-yellow-400 flex-shrink-0" />
              <span>hello@liquorstore.com</span>
            </li>
          </ul>

          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 text-xs text-yellow-400 font-semibold uppercase tracking-wider">
              <Clock size={12} />
              Store Hours
            </div>
            {HOURS.map(({ day, hours }) => (
              <div key={day} className="flex justify-between text-xs text-stone-500">
                <span>{day}</span>
                <span>{hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800 px-4 sm:px-8 py-4">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
          <p>© {new Date().getFullYear()} LiquorStore. All rights reserved. Must be 21+ to purchase alcohol.</p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live inventory sync via Kanji POS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
