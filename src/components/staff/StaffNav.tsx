"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Clock,
  Users,
  CreditCard,
  ChefHat,
  Wrench,
  UserCheck,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft,
  Tablet,
  CalendarDays,
  FileCheck2,
} from "lucide-react";
import clsx from "clsx";
import { venueStore } from "@/lib/store/venueStore";

export function StaffNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTabletMode, setIsTabletMode] = useState(false);

  useEffect(() => {
    setIsTabletMode(venueStore.getIsTabletMode());
    const unsub = venueStore.subscribe(() => {
      setIsTabletMode(venueStore.getIsTabletMode());
    });
    return unsub;
  }, []);

  const handleToggleTablet = () => {
    const updated = venueStore.toggleTabletMode();
    setIsTabletMode(updated);
  };

  const links = [
    { href: "/staff/dashboard", label: "Floor Dashboard", icon: LayoutDashboard },
    { href: "/staff/timeline", label: "Table Timeline", icon: CalendarDays },
    { href: "/staff/waiting-list", label: "Waiting List", icon: Users },
    { href: "/staff/closing", label: "Daily Closing", icon: FileCheck2 },
    { href: "/staff/handover", label: "Shift Handover", icon: ArrowRightLeft },
    { href: "/staff/billing", label: "Billing & POS", icon: CreditCard },
    { href: "/staff/customers", label: "Customer Look-up", icon: Users },
    { href: "/staff/sessions", label: "Live Timers", icon: Clock },
    { href: "/staff/bookings", label: "Daily Bookings", icon: Calendar },
    { href: "/staff/maintenance", label: "Maintenance", icon: Wrench },
  ];

  const currentLink = links.find(
    (l) =>
      pathname === l.href ||
      (l.href === "/staff/dashboard" && pathname === "/staff")
  ) || links[0];

  const handleStaffLogout = () => {
    try {
      localStorage.removeItem("cn_staff_token");
      localStorage.removeItem("cn_staff_user");
    } catch {
      // ignore
    }
    router.push("/staff/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-midnight-card/95 border-b border-midnight-line backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link href="/staff/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brass/20 border border-brass/40 flex items-center justify-center text-brass font-bold text-xs">
              QN
            </div>
            <div>
              <span className="text-xs font-bold text-cream tracking-wide block">
                QNATION FLOOR OPS
              </span>
              <span className="text-[10px] text-brass/80 block sm:hidden font-medium">
                {currentLink.label}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Tablet Mode Quick Toggle */}
          <button
            onClick={handleToggleTablet}
            className={clsx(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all touch-manipulation min-h-[36px]",
              isTabletMode
                ? "bg-brass text-midnight border-brass font-bold shadow-sm"
                : "bg-white/5 border-white/10 text-mist hover:text-cream"
            )}
            title="Toggle high-contrast simplified tablet kiosk mode"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isTabletMode ? "Tablet Kiosk Active" : "Tablet Mode"}
            </span>
          </button>

          {/* Mobile All-Tools Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 text-cream text-xs font-semibold hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation min-h-[36px]"
            aria-label="Open staff menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-brass" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>

          {/* Quick Exit / Sign Out Button */}
          <button
            onClick={handleStaffLogout}
            className="inline-flex items-center gap-1 text-xs text-mist hover:text-cue-light px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors touch-manipulation min-h-[36px]"
            title="Sign Out of Staff Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
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
              (link.href === "/staff/dashboard" && pathname === "/staff");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all touch-manipulation min-h-[38px] active:scale-[0.98]",
                  isActive
                    ? "bg-bronze-glow text-midnight font-bold shadow-sm"
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
            <div className="text-[11px] font-bold uppercase tracking-wider text-brass/80 px-2 py-1">
              Floor Staff Quick Navigation
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href === "/staff/dashboard" && pathname === "/staff");

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition-all touch-manipulation min-h-[44px]",
                      isActive
                        ? "bg-bronze-glow text-midnight font-bold border border-bronze-glow"
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
