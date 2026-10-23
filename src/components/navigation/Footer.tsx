"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QNationLogo } from "@/components/brand/QNationLogo";
import { Clock } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide customer footer on operations portals
  if (
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/owner")
  ) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#03120F] text-white border-t border-[#1A2E28] pt-14 pb-10 print:hidden relative z-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#1A2E28]">
          {/* Column 1 — Brand Logo */}
          <div className="space-y-4">
            <QNationLogo theme="dark" size="lg" />
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mt-3">
              Premium pool & snooker tables, modern ambience, and seamless online booking.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Explore Cue Nation
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <Link href="/tables" className="hover:text-[#E9B94F] transition-colors">
                  Championship Tables
                </Link>
              </li>
              <li>
                <Link href="/cafe" className="hover:text-[#E9B94F] transition-colors">
                  Artisanal Café & Bar
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#E9B94F] transition-colors">
                  Hourly Pricing
                </Link>
              </li>
              <li>
                <Link href="/memberships" className="hover:text-[#E9B94F] transition-colors flex items-center gap-1.5">
                  <span>VIP Memberships</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#E9B94F] text-[#0A1917] text-[9px] font-bold">VIP</span>
                </Link>
              </li>
              <li>
                <Link href="/tournaments" className="hover:text-[#E9B94F] transition-colors flex items-center gap-1.5">
                  <span>Tournaments & Brackets</span>
                  <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-bold">Live</span>
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#E9B94F] transition-colors">
                  Coaching & Corporate Hire
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Opening Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Opening Hours
            </h4>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5 w-full">
                  <div className="flex justify-between items-center pr-4">
                    <span className="text-neutral-400">Mon - Thu</span>
                    <span className="text-white font-medium">10:00 AM - 12:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center pr-4">
                    <span className="text-neutral-400">Fri - Sat</span>
                    <span className="text-white font-medium">10:00 AM - 02:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center pr-4">
                    <span className="text-neutral-400">Sun</span>
                    <span className="text-white font-medium">10:00 AM - 11:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4 — Follow Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Follow Us
            </h4>
            <div className="flex items-center gap-3 pt-1">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-[#E9B94F] hover:border-[#E9B94F] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-[#E9B94F] hover:border-[#E9B94F] transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-[#E9B94F] hover:border-[#E9B94F] transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-[#E9B94F] hover:border-[#E9B94F] transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div>
            &copy; {currentYear} QNation. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <span>Play. Connect. Be a part of QNation.</span>
            <span className="text-[#E9B94F]">👑</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
