"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/store/authContext";
import { Calendar, User, Menu, X, Shield, Clock } from "lucide-react";
import clsx from "clsx";

export function Navbar() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide the public customer navbar on all operational portals —
  // staff, admin, and owner panels have their own dedicated navigation.
  const isPortalRoute =
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/owner");

  if (isPortalRoute) return null;

  const navLinks = [
    { href: "/tables", label: "Tables & Arenas" },
    { href: "/pricing", label: "Rates & Packages" },
    { href: "/my-bookings", label: "My Bookings" },
    { href: "/contact", label: "Contact & Concierge" },
  ];

  return (
    <header
      className="sticky top-0 z-40 transition-colors border-b border-white/10 bg-midnight/95 text-cream backdrop-blur-md shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Logo theme="dark" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm font-medium tracking-wide transition-colors",
                  isActive
                    ? "text-brass font-semibold"
                    : "text-mist hover:text-cream"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & User Profile */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-mist hover:text-cream transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brass/15 flex items-center justify-center text-brass font-bold text-xs border border-brass/30">
              {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <span className="font-medium hidden lg:inline">
              {user ? user.name.split(" ")[0] : "Profile"}
            </span>
          </Link>

          <Link href="/book">
            <Button
              variant="primary"
              size="md"
              className="gap-2 bg-gradient-to-r from-brass to-brass-dark hover:from-brass-glow hover:to-brass text-ink font-semibold shadow-md shadow-brass/20"
            >
              <Calendar className="w-4 h-4" />
              Book a Table
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2.5">
          <Link href="/book">
            <Button variant="primary" size="sm" className="font-semibold text-xs h-9 px-3.5">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Book
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-white/15 text-cream hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-brass" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop & Dropdown Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 md:hidden border-t border-midnight-line px-5 pt-4 pb-8 space-y-3 bg-midnight/98 backdrop-blur-2xl shadow-2xl max-h-[calc(100dvh-5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brass/70 px-1 pt-1">
              Main Menu
            </div>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center justify-between py-3 px-3.5 rounded-xl text-base font-medium transition-all active:scale-[0.99] touch-manipulation min-h-[44px]",
                    pathname === link.href
                      ? "bg-brass/15 text-brass font-bold border border-brass/30"
                      : "text-cream hover:bg-white/5"
                  )}
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-brass/50 font-normal">→</span>
                </Link>
              ))}
              <Link
                href="/cafe"
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center justify-between py-3 px-3.5 rounded-xl text-base font-medium transition-all active:scale-[0.99] touch-manipulation min-h-[44px]",
                  pathname === "/cafe"
                    ? "bg-brass/15 text-brass font-bold border border-brass/30"
                    : "text-cream hover:bg-white/5"
                )}
              >
                <span>Specialty Café Menu</span>
                <span className="text-xs text-brass/50 font-normal">→</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-brass/70 px-1">
                Account & Booking
              </div>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-3.5 rounded-xl text-base font-medium text-cream hover:bg-white/5 transition-colors touch-manipulation min-h-[44px]"
              >
                <div className="w-7 h-7 rounded-full bg-brass/20 flex items-center justify-center text-brass font-bold text-xs">
                  {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span>{user ? `Signed in as ${user.name}` : "My Bookings & Profile"}</span>
              </Link>

              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brass to-brass-dark text-ink font-bold text-sm shadow-md shadow-brass/25 active:scale-[0.99] touch-manipulation min-h-[44px] mt-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Instant Table Booking</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
