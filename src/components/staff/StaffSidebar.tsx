"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { QNationLogo } from "@/components/brand/QNationLogo";
import {
  Home,
  Layers,
  Calendar,
  UserPlus,
  ShieldCheck,
  Clock,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Headphones,
  LogOut,
  X,
} from "lucide-react";
import clsx from "clsx";

interface StaffSidebarProps {
  onOpenWalkIn?: () => void;
  onOpenPinCheckin?: () => void;
  onOpenHelp?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function StaffSidebar({
  onOpenWalkIn,
  onOpenPinCheckin,
  onOpenHelp,
  mobileOpen = false,
  onCloseMobile,
}: StaffSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    try {
      localStorage.removeItem("cn_staff_token");
      localStorage.removeItem("cn_staff_user");
    } catch {
      // ignore
    }
    router.push("/staff/login");
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/staff/dashboard",
      icon: Home,
      isActive: pathname === "/staff" || pathname === "/staff/dashboard",
    },
    {
      id: "tables",
      label: "Table Management",
      href: "/staff/tables",
      icon: Layers,
      isActive: pathname === "/staff/tables",
    },
    {
      id: "bookings",
      label: "Bookings",
      href: "/staff/bookings",
      icon: Calendar,
      isActive: pathname === "/staff/bookings",
    },
    {
      id: "walkin",
      label: "Walk-in Booking",
      href: "#walkin",
      icon: UserPlus,
      onClick: onOpenWalkIn,
      isActive: false,
    },
    {
      id: "pin",
      label: "PIN Check-in",
      href: "#pin",
      icon: ShieldCheck,
      onClick: onOpenPinCheckin,
      isActive: false,
    },
    {
      id: "sessions",
      label: "Sessions",
      href: "/staff/sessions",
      icon: Clock,
      isActive: pathname === "/staff/sessions",
    },
    {
      id: "billing",
      label: "Billing & Payments",
      href: "/staff/billing",
      icon: CreditCard,
      isActive: pathname === "/staff/billing" || pathname === "/staff/payments",
    },
    {
      id: "customers",
      label: "Customers",
      href: "/staff/customers",
      icon: Users,
      isActive: pathname === "/staff/customers",
    },
    {
      id: "reports",
      label: "Reports",
      href: "/staff/closing",
      icon: BarChart3,
      isActive: pathname === "/staff/closing",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/staff/profile",
      icon: Settings,
      isActive: pathname === "/staff/profile",
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#031C19] text-white w-64 select-none border-r border-[#0E2E28]">
      {/* Brand Header with Logo */}
      <div className="p-6 pb-5 border-b border-[#0A2923] flex items-center justify-between">
        <QNationLogo theme="dark" size="sm" href="/staff/dashboard" />
        {mobileOpen && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.onClick) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.onClick?.();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <Icon className="w-4 h-4 text-neutral-400" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className={clsx(
                "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                item.isActive
                  ? "bg-[#D4A03D]/15 text-[#E9B94F] border border-[#E9B94F]/30 shadow-sm"
                  : "text-neutral-300 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                className={clsx(
                  "w-4 h-4",
                  item.isActive ? "text-[#E9B94F]" : "text-neutral-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area: Need Help? Card + Logout */}
      <div className="p-4 pt-2 border-t border-[#0A2923] space-y-3">
        {/* Help Banner Card matching reference */}
        <div
          onClick={onOpenHelp}
          className="bg-[#062A24] border border-[#0F4037] rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-[#E9B94F]/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-[#E9B94F]/40 bg-[#E9B94F]/10 flex items-center justify-center text-[#E9B94F] flex-shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">Need Help?</div>
            <div className="text-[10px] text-neutral-400">Contact Admin</div>
          </div>
        </div>

        {/* Logout Button matching reference */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
