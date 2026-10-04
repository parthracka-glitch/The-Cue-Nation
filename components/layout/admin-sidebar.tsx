"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingBag,
  Utensils,
  Users,
  Award,
  BookOpen,
  Sliders,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "STAFF";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Floor Live",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["ADMIN", "STAFF"],
    },
    {
      label: "Reservations",
      href: "/admin/reservations",
      icon: CalendarDays,
      roles: ["ADMIN", "STAFF"],
    },
    {
      label: "POS & Orders",
      href: "/admin/pos",
      icon: ShoppingBag,
      roles: ["ADMIN", "STAFF"],
    },
    {
      label: "Kitchen Screen",
      href: "/kitchen",
      icon: Utensils,
      roles: ["ADMIN", "STAFF", "KITCHEN"],
    },
    {
      label: "Customers & Khata",
      href: "/admin/customers",
      icon: Users,
      roles: ["ADMIN", "STAFF"],
    },
    {
      label: "Memberships",
      href: "/admin/memberships",
      icon: Award,
      roles: ["ADMIN", "STAFF"],
    },
    {
      label: "Cafe Menu",
      href: "/admin/menu",
      icon: BookOpen,
      roles: ["ADMIN", "STAFF"],
    },
    {
      label: "Rates & Tables",
      href: "/admin/rates",
      icon: Sliders,
      roles: ["ADMIN"], // Hidden from STAFF
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
      roles: ["ADMIN"], // Hidden from STAFF
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      roles: ["ADMIN"], // Hidden from STAFF
    },
  ];

  // Filter items by active role
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-card border border-border text-foreground shadow-md"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-border bg-billiard-950 transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Logo & Collapse Toggle */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link
            href="/admin"
            className="flex items-center gap-3 overflow-hidden text-emerald-400"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-500/40 font-bold text-xl shadow-md">
              🎱
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-white tracking-wide">
                  CueClub
                </span>
                <span className="text-[10px] text-emerald-400/80 font-medium">
                  {role === "ADMIN" ? "Admin Console" : "Floor Console"}
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors select-none",
                  isActive
                    ? "bg-primary text-white font-semibold shadow-md shadow-emerald-950/50"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-white"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-emerald-400/80")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Footer Role Indicator */}
        <div className="p-3 border-t border-border bg-billiard-900/60">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-800/40 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
              {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {session?.user?.name || "Staff Member"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Role: <strong className="text-emerald-400">{role}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
