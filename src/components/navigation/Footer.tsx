"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Internal operations portals have dedicated views and do not show customer footer
  if (
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/owner")
  ) {
    return null;
  }

  return (
    <footer className="bg-midnight text-cream border-t border-midnight-line pt-16 pb-12 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-midnight-line">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Logo theme="dark" />
            <p className="text-sm text-mist leading-relaxed">
              A premium cue club: championship tables, artisanal roastery café, and frictionless booking.
            </p>
            <div className="text-xs text-mist/80 italic font-display">
              &quot;Rack. Break. Repeat.&quot;
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold tracking-wider text-bronze-glow uppercase">
              Location & Lounge
            </h4>
            <div className="space-y-2 text-sm text-mist">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-bronze-glow flex-shrink-0 mt-0.5" />
                <span>84, Baize Avenue, 3rd Block, Koramangala, Bengaluru 560034</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-bronze-glow flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-bronze-glow flex-shrink-0" />
                <span>concierge@cuenation.club</span>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold tracking-wider text-bronze-glow uppercase">
              Club Hours
            </h4>
            <div className="space-y-2 text-sm text-mist">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-bronze-glow flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-cream">Monday – Sunday</div>
                  <div className="text-xs text-mist">10:00 AM – 01:00 AM IST</div>
                </div>
              </div>
              <div className="pt-2 text-xs text-baize-light">
                ● Live Floor Staff Always on Standby
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold tracking-wider text-bronze-glow uppercase">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-mist">
              <li>
                <Link href="/#tables" className="hover:text-cream transition-colors">
                  Tables & Hourly Rates
                </Link>
              </li>
              <li>
                <Link href="/#cafe" className="hover:text-cream transition-colors">
                  Specialty Café Menu
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-cream transition-colors">
                  Instant Table Reservation
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-cream transition-colors">
                  My Bookings & Digital PIN
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mist/70">
          <div>
            &copy; {new Date().getFullYear()} Cue Nation Parlour & Lounge. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>India DPDP Compliant</span>
            <span>Zero Double-Booking Guarantee</span>
            <Link href="/terms" className="hover:text-cream">Terms</Link>
            <Link href="/privacy" className="hover:text-cream">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
