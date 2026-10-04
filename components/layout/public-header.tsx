"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";

export function PublicHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "Book a Table", href: "/book" },
    { label: "Find My Booking", href: "/book/lookup" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-billiard-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-500/40 font-bold text-xl shadow-md">
            🎱
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-white tracking-wide">
              CueClub
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              Billiards & Cafe
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-emerald-400 font-semibold"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User / Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.role === "ADMIN" || session.user.role === "STAFF" ? (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs border-emerald-700/50">
                    <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
                    Admin Floor
                  </Button>
                </Link>
              ) : session.user.role === "KITCHEN" ? (
                <Link href="/kitchen">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    Kitchen Display
                  </Button>
                </Link>
              ) : (
                <Link href="/account">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <User className="h-3.5 w-3.5 text-emerald-400" />
                    My Account
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-muted-foreground hover:text-white text-xs"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Login
                </Button>
              </Link>
              <Link href="/book">
                <Button variant="gold" size="sm" className="text-xs">
                  Reserve Table
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-billiard-900 px-4 pt-2 pb-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-foreground hover:text-emerald-400"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {session?.user ? (
              <>
                <Link
                  href={
                    session.user.role === "CUSTOMER"
                      ? "/account"
                      : session.user.role === "KITCHEN"
                      ? "/kitchen"
                      : "/admin"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm text-emerald-400"
                >
                  Dashboard ({session.user.role})
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gold" size="sm" className="w-full">
                    Book Table
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
