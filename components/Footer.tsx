"use client";

import Link from "next/link";
import { MapPin, Phone, Clock, Mail, Instagram, Facebook, Twitter } from "lucide-react";

const HOURS = [
  { day: "Mon – Wed", hours: "8:00 AM – 11:00 PM" },
  { day: "Thu",       hours: "7:00 AM – 1:30 AM"  },
  { day: "Fri – Sat", hours: "8:00 AM – 1:30 AM"  },
  { day: "Sunday",    hours: "10:00 AM – 10:00 PM" },
];

const SHOP_LINKS = [
  { label: "All Products",  href: "/shop" },
  { label: "Wine",          href: "/shop" },
  { label: "Spirits",       href: "/shop" },
  { label: "Beer",          href: "/shop" },
  { label: "CBD",           href: "/shop" },
  { label: "Staff Picks",   href: "/shop" },
  { label: "On Sale",       href: "/shop" },
];

const INFO_LINKS = [
  { label: "About Us",        href: "#" },
  { label: "Contact Us",      href: "#" },
  { label: "Age Policy",      href: "#" },
  { label: "Privacy Policy",  href: "#" },
  { label: "Terms of Use",    href: "#" },
  { label: "Return Policy",   href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 border-t border-stone-800 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="space-y-5">
          <Link href="/" className="block">
            <div className="text-white font-heading font-extrabold text-xl tracking-wide">STONES RIVER</div>
            <div className="text-crimson text-[10px] font-bold tracking-[0.3em] uppercase mt-0.5">TOTAL BEVERAGES</div>
          </Link>
          <p className="text-stone-400 text-sm leading-relaxed">
            Your local premium spirits, beer &amp; wine destination in Murfreesboro, TN. 7,000+ products, same-day pickup, fast delivery.
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
                className="bg-stone-800 hover:bg-crimson border border-stone-700 rounded-lg p-2 text-stone-400 hover:text-white transition-all"
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
                <Link href={href} className="text-stone-400 hover:text-crimson text-sm transition-colors">
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
                <a href={href} className="text-stone-400 hover:text-crimson text-sm transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + Hours */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Contact Us</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-stone-400">
              <MapPin size={15} className="text-crimson mt-0.5 flex-shrink-0" />
              <span>208 North Thompson Lane<br />Murfreesboro, TN 37129</span>
            </li>
            <li>
              <a href="tel:6158951888" className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-crimson transition-colors">
                <Phone size={15} className="text-crimson flex-shrink-0" />
                (615) 895-1888
              </a>
            </li>
            <li>
              <a href="mailto:stonesrivertotalbeverage@gmail.com" className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-crimson transition-colors">
                <Mail size={15} className="text-crimson flex-shrink-0" />
                <span className="break-all">stonesrivertotalbeverage@gmail.com</span>
              </a>
            </li>
          </ul>

          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 text-xs text-crimson font-semibold uppercase tracking-wider">
              <Clock size={12} />
              Business Hours
            </div>
            {HOURS.map(({ day, hours }) => (
              <div key={day} className="flex justify-between text-xs text-stone-500 gap-3">
                <span className="flex-shrink-0">{day}</span>
                <span className="text-right">{hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 px-4 sm:px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
          <p>© {new Date().getFullYear()} Stones River Total Beverages. All rights reserved. Must be 21+ to purchase alcohol.</p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live inventory via Kanji POS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
