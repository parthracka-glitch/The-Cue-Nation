import React from "react";
import clsx from "clsx";
import { TableStatus, BookingStatus } from "@/types/database";

interface BadgeProps {
  status?: TableStatus | BookingStatus;
  children?: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

export function StatusBadge({ status = "free", className, isDark = false }: BadgeProps) {
  const configs: Record<
    TableStatus | BookingStatus,
    { label: string; icon: string; lightClass: string; darkClass: string }
  > = {
    free: {
      label: "Available",
      icon: "●",
      lightClass: "bg-baize/10 text-baize border-baize/20",
      darkClass: "bg-baize-light/15 text-baize-light border-baize-light/30",
    },
    booked: {
      label: "Booked",
      icon: "◷",
      lightClass: "bg-amber/15 text-amber-text border-amber/30",
      darkClass: "bg-amber/20 text-amber border-amber/30",
    },
    running: {
      label: "In Play",
      icon: "▶",
      lightClass: "bg-bronze/15 text-bronze border-bronze/30 animate-pulse",
      darkClass: "bg-cream/15 text-cream border-cream/30 animate-pulse",
    },
    maintenance: {
      label: "Offline",
      icon: "⛔",
      lightClass: "bg-slate/15 text-slate border-slate/30",
      darkClass: "bg-slate-dark/20 text-slate-dark border-slate-dark/30",
    },
    confirmed: {
      label: "Confirmed",
      icon: "✓",
      lightClass: "bg-baize/15 text-baize border-baize/30",
      darkClass: "bg-baize-light/20 text-baize-light border-baize-light/30",
    },
    checked_in: {
      label: "Checked In",
      icon: "▶",
      lightClass: "bg-bronze/15 text-bronze border-bronze/30",
      darkClass: "bg-bronze-glow/20 text-bronze-glow border-bronze-glow/30",
    },
    completed: {
      label: "Completed",
      icon: "✓",
      lightClass: "bg-black/5 text-ash border-black/10",
      darkClass: "bg-white/10 text-mist border-white/10",
    },
    cancelled: {
      label: "Cancelled",
      icon: "✕",
      lightClass: "bg-cue/10 text-cue border-cue/20",
      darkClass: "bg-cue-light/20 text-cue-light border-cue-light/30",
    },
    no_show: {
      label: "No Show",
      icon: "!",
      lightClass: "bg-amber/10 text-amber border-amber/20",
      darkClass: "bg-amber/20 text-amber border-amber/30",
    },
    pending: {
      label: "Pending",
      icon: "◷",
      lightClass: "bg-amber/15 text-amber-text border-amber/30",
      darkClass: "bg-amber/20 text-amber border-amber/30",
    },
    expired: {
      label: "Expired",
      icon: "✕",
      lightClass: "bg-black/5 text-ash border-black/10",
      darkClass: "bg-white/10 text-mist border-white/10",
    },
  };

  const current = configs[status] || configs.free;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border select-none",
        isDark ? current.darkClass : current.lightClass,
        className
      )}
    >
      <span className="text-[10px] leading-none">{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
}

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gold" | "teal" | "outline";
}) {
  const variants = {
    default: "bg-black/5 dark:bg-white/10 text-foreground",
    gold: "bg-bronze-glow/20 text-bronze-glowdark dark:text-bronze-glow border border-bronze-glow/30",
    teal: "bg-baize/15 text-baize dark:text-baize-light border border-baize/25",
    outline: "border border-current opacity-80",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
