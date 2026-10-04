"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";
import {
  Play,
  Pause,
  Plus,
  ArrowRightLeft,
  ShoppingBag,
  CreditCard,
  Clock,
  Utensils,
  AlertTriangle,
  BellRing,
} from "lucide-react";

interface TableCardProps {
  table: {
    id: string;
    name: string;
    type: string;
    status: string;
    activeSession?: {
      id: string;
      customerName: string;
      customerPhone?: string;
      billingMode: string;
      startedAt: string;
      framesPlayed: number;
      isPaused: boolean;
      runningChargePaise: number;
      currentBandLabel: string;
      cafeTotalPaise: number;
      hasReadyKitchenItems: boolean;
    } | null;
    nextReservation?: {
      id: string;
      code: string;
      guestName: string;
      startsAt: string;
      partySize: number;
    } | null;
    alertReservationDue?: boolean;
    alertPackageExpiring?: boolean;
  };
  availableTables: Array<{ id: string; name: string }>;
  onStartSession: (table: any) => void;
  onRefresh: () => void;
}

export function TableCard({
  table,
  availableTables,
  onStartSession,
  onRefresh,
}: TableCardProps) {
  const session = table.activeSession;
  const isOccupied = table.status === "OCCUPIED" || table.status === "PAUSED";
  const isPaused = session?.isPaused || table.status === "PAUSED";
  const isAvailable = table.status === "AVAILABLE";
  const isMaintenance = table.status === "MAINTENANCE";

  // Live client-side elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!session || isPaused) return;

    function calcSeconds() {
      if (!session) return;
      const startMs = new Date(session.startedAt).getTime();
      const nowMs = Date.now();
      const diff = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(diff);
    }

    calcSeconds();
    const timer = setInterval(calcSeconds, 1000);
    return () => clearInterval(timer);
  }, [session, isPaused]);

  // Format elapsed time string (hh:mm:ss)
  function formatElapsed(totalSec: number): string {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // Quick Action Handlers
  async function handleSessionAction(action: "PAUSE" | "RESUME" | "ADD_FRAME") {
    if (!session) return;
    try {
      await fetch("/api/admin/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sessionId: session.id }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMoveTable(targetTableId: string) {
    if (!session || !targetTableId) return;
    try {
      await fetch("/api/admin/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MOVE_TABLE",
          sessionId: session.id,
          targetTableId,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleMaintenance() {
    const newStatus = isMaintenance ? "AVAILABLE" : "MAINTENANCE";
    try {
      await fetch("/api/admin/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_STATUS",
          tableId: table.id,
          statusOverride: newStatus,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  }

  // Border & Glow styling
  let borderStyle = "border-border bg-card/70";
  if (isAvailable) {
    borderStyle = "border-emerald-600/40 bg-emerald-950/10 hover:border-emerald-500/70";
  } else if (isPaused) {
    borderStyle = "border-amber-500/60 bg-amber-950/20";
  } else if (isOccupied) {
    borderStyle = "border-rose-600/50 bg-rose-950/15";
  } else if (isMaintenance) {
    borderStyle = "border-zinc-700 bg-zinc-900/40 opacity-75";
  }

  const hasPulsingAlert = table.alertReservationDue || table.alertPackageExpiring;

  return (
    <Card
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg ${borderStyle} ${
        hasPulsingAlert ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-billiard-950 animate-pulse" : ""
      }`}
    >
      <div>
        {/* Header Strip */}
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {table.type === "POOL" ? "🎱" : table.type === "SNOOKER" ? "🔴" : "🎯"}
            </span>
            <div>
              <CardTitle className="text-base font-bold text-white leading-tight">
                {table.name}
              </CardTitle>
              <span className="text-[11px] text-muted-foreground font-medium">
                {table.type}
              </span>
            </div>
          </div>

          <Badge
            variant={
              isAvailable
                ? "available"
                : isPaused
                ? "paused"
                : isOccupied
                ? "occupied"
                : "outline"
            }
            className="text-[11px] font-bold uppercase tracking-wider"
          >
            {table.status}
          </Badge>
        </CardHeader>

        {/* Content Body */}
        <CardContent className="p-4 space-y-3">
          {/* OCCUPIED / PAUSED SESSION STATE */}
          {session ? (
            <div className="space-y-3">
              {/* Customer Info & Current Band */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">
                    {session.customerName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Mode: {session.billingMode}
                    {session.framesPlayed > 0 && ` (${session.framesPlayed} frames)`}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300">
                  {session.currentBandLabel}
                </Badge>
              </div>

              {/* Live Timer & Running Charge Display */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-billiard-950/60 border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                    Session Timer
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-base font-bold text-white mt-0.5">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span>{formatElapsed(elapsedSeconds)}</span>
                  </div>
                  {isPaused && (
                    <span className="text-[10px] text-amber-400 font-semibold">
                      [PAUSED]
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                    Table Charge
                  </span>
                  <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                    {formatINR(session.runningChargePaise)}
                  </div>
                </div>
              </div>

              {/* F&B Running Tab & Ready Chip */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Utensils className="h-3.5 w-3.5 text-muted-foreground" />
                  Cafe Tab:
                </span>
                <span className="font-semibold text-white">
                  {formatINR(session.cafeTotalPaise)}
                </span>
              </div>

              {/* Kitchen Order Ready Notification Chip */}
              {session.hasReadyKitchenItems && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/50 border border-emerald-500 text-[11px] text-emerald-300 font-semibold animate-pulse">
                  <BellRing className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Ready for Table! Food is at pickup station.</span>
                </div>
              )}

              {/* Alert for Next Reservation Collision */}
              {table.alertReservationDue && table.nextReservation && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/60 border border-amber-500 text-[11px] text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    Res {table.nextReservation.code} due in &lt;15m for {table.nextReservation.guestName}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* AVAILABLE STATE OR UPCOMING RESERVATION */
            <div className="py-4 text-center space-y-2">
              {table.nextReservation ? (
                <div className="p-3 rounded-lg border border-border bg-secondary/30 text-left text-xs space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Next Reservation
                  </span>
                  <div className="font-semibold text-white">
                    {table.nextReservation.guestName} ({table.nextReservation.partySize}p)
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    {new Date(table.nextReservation.startsAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} • Code: {table.nextReservation.code}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground py-2">
                  Table is clear and ready for walk-in players.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>

      {/* Action Buttons Strip (Tablet Touch Optimized - min 44-48px) */}
      <div className="p-3 pt-0 border-t border-border/40 mt-2 space-y-2">
        {session ? (
          <div className="space-y-2">
            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {isPaused ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSessionAction("RESUME")}
                  className="h-10 text-xs font-semibold gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Resume
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSessionAction("PAUSE")}
                  className="h-10 text-xs font-semibold gap-1.5 border-amber-600/40 text-amber-300"
                >
                  <Pause className="h-3.5 w-3.5" /> Pause
                </Button>
              )}

              {/* Add Frame (+1) for snooker / frame mode */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSessionAction("ADD_FRAME")}
                className="h-10 text-xs font-semibold gap-1"
                title="Add Frame Count"
              >
                <Plus className="h-3.5 w-3.5" /> Frame ({session.framesPlayed})
              </Button>
            </div>

            {/* Move Table & POS Orders Strip */}
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/admin/pos?tableId=${table.id}&sessionId=${session.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full h-10 text-xs font-semibold gap-1.5"
                >
                  <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" /> + Order
                </Button>
              </Link>

              {/* Move Table Dropdown */}
              {availableTables.length > 0 ? (
                <select
                  onChange={(e) => {
                    if (e.target.value) handleMoveTable(e.target.value);
                  }}
                  defaultValue=""
                  className="h-10 w-full rounded-lg border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="" disabled>
                    Move Table...
                  </option>
                  {availableTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      Move to {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Button disabled variant="outline" size="sm" className="h-10 text-xs opacity-50">
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> No Tables
                </Button>
              )}
            </div>

            {/* End Session & Checkout -> Goes to Stage 7 */}
            <Link href={`/admin/checkout/${session.id}`}>
              <Button
                variant="gold"
                size="sm"
                className="w-full h-11 text-xs font-bold gap-1.5 shadow-md shadow-amber-950/40 mt-1"
              >
                <CreditCard className="h-4 w-4" /> End Session & Checkout
              </Button>
            </Link>
          </div>
        ) : (
          /* Available / Maintenance Actions */
          <div className="space-y-2">
            <Button
              disabled={isMaintenance}
              onClick={() => onStartSession(table)}
              variant="default"
              size="sm"
              className="w-full h-11 text-sm font-semibold gap-2 shadow-emerald-950/40"
            >
              <Play className="h-4 w-4 fill-current" /> Start Session
            </Button>

            <button
              type="button"
              onClick={toggleMaintenance}
              className="w-full text-center text-[11px] text-muted-foreground hover:text-white transition-colors"
            >
              {isMaintenance ? "Set to Available" : "Flag for Maintenance"}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
