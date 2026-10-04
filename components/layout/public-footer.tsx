import React from "react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-billiard-950 py-12 text-sm text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Description */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎱</span>
            <span className="font-bold text-lg text-white">CueClub</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            The premier billiards, pool, and snooker lounge. Featuring tournament-grade tables, gourmet cafe dining, and seamless minute-level transparent billing.
          </p>
          <div className="text-xs text-emerald-400 font-mono">
            Open Daily: 11:00 AM – Midnight (IST)
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/book" className="hover:text-emerald-400 transition-colors">
                Reserve a Table
              </Link>
            </li>
            <li>
              <Link href="/book/lookup" className="hover:text-emerald-400 transition-colors">
                Find My Booking
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-emerald-400 transition-colors">
                Staff & Kitchen Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Location */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
            Venue & Contact
          </h4>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p>108 Arena Boulevard, Cyber Hub</p>
            <p>Phone: +91 98200 11223</p>
            <p>Email: contact@cueclub.demo</p>
            <p className="text-[11px] text-emerald-500/80 pt-1">
              ⚡ High-speed Wi-Fi & Lounge Seating
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} CueClub Management System. Built for live demo showcase.</span>
        <span className="mt-2 sm:mt-0 text-[11px]">
          Currency: <strong className="text-emerald-400">INR (₹)</strong> | Timezone: <strong className="text-emerald-400">Asia/Kolkata</strong>
        </span>
      </div>
    </footer>
  );
}
