"use client";

import React from "react";
import { useAuth } from "@/lib/store/authContext";
import { UserRole } from "@/types/database";
import { ShieldCheck, User, Users, Coffee } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export function RoleSwitcherBar() {
  const { role, switchRole } = useAuth();

  const roles: { id: UserRole; label: string; icon: React.ReactNode; href: string }[] = [
    {
      id: "customer",
      label: "Customer Site",
      icon: <User className="w-3.5 h-3.5" />,
      href: "/",
    },
    {
      id: "staff",
      label: "Staff Floor Panel",
      icon: <Users className="w-3.5 h-3.5" />,
      href: "/staff/dashboard",
    },
    {
      id: "owner",
      label: "Main Admin Panel",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      href: "/admin/dashboard",
    },
  ];

  return (
    <div className="bg-midnight border-b border-midnight-line text-cream py-1.5 px-4 text-xs font-medium z-50 sticky top-0 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-baize-light animate-ping" />
          <span className="text-mist uppercase tracking-widest text-[10px]">
            Cue Nation Live Platform
          </span>
          <span className="text-midnight-line">|</span>
          <span className="text-mist hidden sm:inline">Active Mode:</span>
          <span className="text-bronze-glow font-semibold capitalize">{role}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {roles.map((r) => {
            const isActive = role === r.id;
            return (
              <Link
                key={r.id}
                href={r.href}
                onClick={() => switchRole(r.id)}
                className={clsx(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs select-none",
                  isActive
                    ? "bg-bronze-glow text-midnight font-bold shadow-sm"
                    : "text-mist hover:text-cream hover:bg-midnight-card border border-transparent hover:border-midnight-line"
                )}
              >
                {r.icon}
                <span className="hidden md:inline">{r.label}</span>
                <span className="md:hidden capitalize">{r.id}</span>
              </Link>
            );
          })}

          <Link
            href="/t/table-3.demo/menu"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-mist hover:text-cream hover:bg-midnight-card border border-midnight-line"
          >
            <Coffee className="w-3 h-3 text-bronze-glow" />
            <span className="hidden lg:inline">Test Table QR</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
