"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, LogOut, Sparkles } from "lucide-react";
import { DemoTourModal } from "@/components/shared/demo-tour-modal";

export function AdminTopbar() {
  const { data: session } = useSession();
  const [timeStr, setTimeStr] = useState<string>("");
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setTimeStr(formatted);
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-billiard-950/90 px-4 md:px-6 backdrop-blur">
        {/* Left Section: Venue Branding & Live Time */}
        <div className="flex items-center gap-4 pl-12 lg:pl-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎱</span>
            <span className="font-bold text-white text-base md:text-lg tracking-tight">
              CueClub
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] text-emerald-400 border-emerald-500/40 bg-emerald-950/40">
              Live Venue
            </Badge>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-secondary/60 px-3 py-1.5 rounded-lg border border-border text-emerald-300">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>IST: {timeStr || "--:--:--"}</span>
          </div>
        </div>

        {/* Right Section: Guided Demo Tour & Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Demo Tour Checklist Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTourOpen(true)}
            className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-medium gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guided Demo Tour</span>
            <span className="sm:hidden">Tour</span>
          </Button>

          {/* User Role Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <Badge
              variant={session?.user?.role === "ADMIN" ? "gold" : "available"}
              className="text-xs"
            >
              {session?.user?.role || "STAFF"}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {session?.user?.name}
            </span>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-muted-foreground hover:text-red-400 hover:bg-red-950/20 gap-1.5 text-xs"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Guided Demo Tour Modal */}
      <DemoTourModal open={tourOpen} onOpenChange={setTourOpen} />
    </>
  );
}
