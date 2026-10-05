import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "gold" | "available" | "occupied" | "paused" | "reserved";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    outline: "text-foreground border-border",
    gold: "border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold",
    available: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium",
    occupied: "border-rose-500/40 bg-rose-500/10 text-rose-400 font-medium",
    paused: "border-amber-500/40 bg-amber-500/10 text-amber-400 font-medium",
    reserved: "border-purple-500/40 bg-purple-500/10 text-purple-400 font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
