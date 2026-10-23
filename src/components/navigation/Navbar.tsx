"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QNationLogo } from "@/components/brand/QNationLogo";
import { useAuth } from "@/lib/store/authContext";
import { User, Menu, X, ArrowRight } from "lucide-react";
import clsx from "clsx";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide the public customer navbar on all operational portals
  const isPortalRoute =
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/owner");

  if (isPortalRoute) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tables", label: "Tables" },
    { href: "/cafe", label: "Café & Bar" },
    { href: "/pricing", label: "Pricing" },
    { href: "/memberships", label: "VIP Club", badge: "VIP" },
    { href: "/tournaments", label: "Tournaments", badge: "Live" },
    { href: "/services", label: "Coaching" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 transition-colors border-b border-[#1A2E28] bg-[#03120F]/95 text-white backdrop-blur-md shadow-xl">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo matching reference */}
        <div className="flex-shrink-0">
          <QNationLogo theme="dark" size="md" />
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || (link.href.startsWith("/#") && pathname === "/");

            return (
              <Link
                key={link.label}
                href={link.href}
                className={clsx(
                  "relative text-xs xl:text-sm font-medium tracking-wide transition-colors py-1 flex items-center gap-1.5",
                  isActive
                    ? "text-[#E9B94F] font-semibold"
                    : "text-neutral-300 hover:text-white"
                )}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className={clsx(
                      "px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider",
                      link.badge === "VIP"
                        ? "bg-[#E9B94F] text-[#0A1917]"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    )}
                  >
                    {link.badge}
                  </span>
                )}
                {/* Active Gold Indicator Bar on Home matching reference */}
                {isActive && link.href === "/" && (
                  <span className="absolute bottom-[-18px] left-0 right-0 h-[2.5px] bg-[#E9B94F] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-5">
          {/* Login with User Icon matching reference */}
          <Link
            href="/staff/login"
            className="flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors py-1.5 px-2"
          >
            <div className="w-5 h-5 rounded-full border border-neutral-400 flex items-center justify-center text-neutral-300">
              <User className="w-3 h-3" />
            </div>
            <span>{user ? user.name.split(" ")[0] : "Login"}</span>
          </Link>

          {/* Gold Pill CTA "Book a Table" matching reference */}
          <Link href="/#book-widget">
            <button className="bg-[#E9B94F] hover:bg-[#F6D78D] text-[#0A1917] font-bold text-sm px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer">
              Book a Table
            </button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2.5">
          <Link href="/#book-widget">
            <button className="bg-[#E9B94F] text-[#0A1917] font-bold text-xs px-3.5 py-1.5 rounded-full">
              Book
            </button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-white/15 text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#E9B94F]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop & Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 md:hidden border-t border-[#1A2E28] px-5 pt-4 pb-8 space-y-3 bg-[#03120F]/98 backdrop-blur-2xl shadow-2xl max-h-[calc(100dvh-5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#E9B94F]/80 px-1 pt-1">
              Menu
            </div>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center justify-between py-3 px-3.5 rounded-xl text-base font-medium transition-all",
                    pathname === link.href
                      ? "bg-[#E9B94F]/15 text-[#E9B94F] font-bold border border-[#E9B94F]/30"
                      : "text-white hover:bg-white/5"
                  )}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#E9B94F]/60" />
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link
                href="/staff/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-sm font-medium text-neutral-300 hover:bg-white/5 transition-colors"
              >
                <div className="w-6 h-6 rounded-full border border-neutral-400 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>{user ? `Signed in as ${user.name}` : "Staff / Admin Login"}</span>
              </Link>

              <Link
                href="/#book-widget"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#E9B94F] text-[#0A1917] font-bold text-sm shadow-md"
              >
                <span>Book a Table Now</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
