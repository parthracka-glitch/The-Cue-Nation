"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  UserCog,
  Users,
  Percent,
  CreditCard,
  BarChart3,
  Wrench,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Lock,
} from "lucide-react";
import clsx from "clsx";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/admin/dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/admin/sessions", label: "Live Sessions", icon: Layers },
    { href: "/admin/tables", label: "Tables & Arenas", icon: Layers },
    { href: "/admin/cafe", label: "Café Menu", icon: BarChart3 },
    { href: "/admin/inventory", label: "Inventory", icon: Wrench },
    { href: "/admin/staff", label: "Staff Accounts", icon: UserCog },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/pricing", label: "Pricing Rules", icon: Percent },
    { href: "/admin/payments", label: "Transactions", icon: CreditCard },
    { href: "/admin/reports", label: "Reports & Export", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
  ];

  const currentLink = links.find(
    (l) =>
      pathname === l.href ||
      (linkMatchesDashboard(l.href, pathname))
  ) || links[0];

  function linkMatchesDashboard(href: string, path: string) {
    return href === "/admin/dashboard" && (path === "/admin" || path === "/owner");
  }

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem("cn_admin_token");
      localStorage.removeItem("cn_admin_user");
    } catch {
      // ignore
    }
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-midnight-card/95 border-b border-midnight-line backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-bronze/20 border border-bronze/40 flex items-center justify-center text-bronze-glow font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-cream tracking-wide block">
                ADMIN CONSOLE
              </span>
              <span className="text-[10px] text-bronze-glow block sm:hidden font-medium">
                {currentLink.label}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 text-cream text-xs font-semibold hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation min-h-[36px]"
            aria-label="Open admin menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-bronze-glow" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>

          {/* Exit / Sign Out Button */}
          <button
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-1.5 text-xs text-cue-light hover:text-cue-light px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors touch-manipulation min-h-[36px]"
            title="Sign Out of Admin Console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Admin</span>
          </button>
        </div>
      </div>

      {/* Touch-Friendly Horizontal Swipeable Bar */}
      <div className="border-t border-white/5 overflow-x-auto no-scrollbar py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              linkMatchesDashboard(link.href, pathname);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all touch-manipulation min-h-[38px] active:scale-[0.98]",
                  isActive
                    ? "bg-bronze text-white font-bold shadow-sm"
                    : "text-mist hover:text-cream hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[88px] bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 md:hidden border-t border-midnight-line px-4 pt-3 pb-6 space-y-2 bg-midnight/98 shadow-2xl max-h-[calc(100dvh-6rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
            <div className="text-[11px] font-bold uppercase tracking-wider text-bronze-glow px-2 py-1">
              Admin Suite Navigation
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  linkMatchesDashboard(link.href, pathname);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition-all touch-manipulation min-h-[44px]",
                      isActive
                        ? "bg-bronze text-white font-bold border border-bronze"
                        : "bg-white/5 text-cream border border-white/5 hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
