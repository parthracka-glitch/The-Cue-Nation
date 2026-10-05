"use client";

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { formatINR } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LiveFloorData {
  timestamp: string;
  summary: {
    totalTables: number;
    availableTables: number;
    occupiedTables: number;
    occupancyRate: number;
    byType: Record<string, { total: number; available: number; occupied: number; reserved: number }>;
  };
  tables: Array<{
    id: string;
    name: string;
    type: "POOL" | "SNOOKER" | "CAROM";
    status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
    rateCardName: string;
    ratePerHourPaise: number;
    hasActiveSession: boolean;
    elapsedMinutes: number;
    framesPlayed: number;
    hasUpcomingReservation: boolean;
    reservationStart: string | null;
  }>;
}

export function LiveFloorSync({ initialData }: { initialData?: LiveFloorData }) {
  const { data, mutate, isValidating } = useSWR<LiveFloorData>(
    "/api/public/floor-summary",
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 4000, // 4-second real-time sync with club floor
      revalidateOnFocus: true,
    }
  );

  const [activeFilter, setActiveFilter] = useState<"ALL" | "POOL" | "SNOOKER" | "CAROM">("ALL");

  const tables = data?.tables || [];
  const summary = data?.summary || {
    totalTables: 8,
    availableTables: 5,
    occupiedTables: 2,
    occupancyRate: 25,
    byType: {
      POOL: { total: 5, available: 3, occupied: 1, reserved: 1 },
      SNOOKER: { total: 2, available: 1, occupied: 1, reserved: 0 },
      CAROM: { total: 1, available: 1, occupied: 0, reserved: 0 },
    },
  };

  const filteredTables = tables.filter((t) => {
    if (activeFilter === "ALL") return true;
    return t.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Floor Sync Header Strip */}
      <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-billiard-900/90 via-billiard-950 to-billiard-900/90 backdrop-blur shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Live Floor Command Sync
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono">
                Auto-sync 4s
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live table status synced directly from club management POS
            </p>
          </div>
        </div>

        {/* Global summary chips */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-xs">
            <span className="text-muted-foreground mr-1.5">Free Tables:</span>
            <span className="font-extrabold text-emerald-400">
              {summary.availableTables} / {summary.totalTables}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-950/40 text-xs">
            <span className="text-muted-foreground mr-1.5">Floor Occupancy:</span>
            <span className="font-extrabold text-amber-400">{summary.occupancyRate}%</span>
          </div>

          <button
            onClick={() => mutate()}
            className="p-1.5 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-white transition-colors"
            title="Force refresh status"
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-secondary/40 border border-border">
          {[
            { id: "ALL", label: `All Tables (${tables.length})` },
            { id: "POOL", label: `🎱 Pool (${summary.byType.POOL?.available || 0} free)` },
            { id: "SNOOKER", label: `🔴 Snooker (${summary.byType.SNOOKER?.available || 0} free)` },
            { id: "CAROM", label: `🎯 Carom (${summary.byType.CAROM?.available || 0} free)` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link href="/book">
          <Button variant="gold" size="sm" className="gap-1.5 text-xs shadow-md shadow-amber-950/30">
            <Calendar className="h-3.5 w-3.5" /> Book Any Available Slot
          </Button>
        </Link>
      </div>

      {/* Interactive Table Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isFree = table.status === "AVAILABLE";
          const isOccupied = table.status === "OCCUPIED";
          const isReserved = table.status === "RESERVED";

          return (
            <div
              key={table.id}
              className={`group relative rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isFree
                  ? "border-emerald-500/40 bg-gradient-to-b from-card/90 to-emerald-950/20 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-950/50"
                  : isOccupied
                  ? "border-amber-500/30 bg-card/60"
                  : "border-purple-500/30 bg-card/60"
              }`}
            >
              {/* Felt Preview bar on top */}
              <div
                className={`h-1.5 w-full rounded-full mb-3 ${
                  table.type === "POOL"
                    ? "bg-emerald-500"
                    : table.type === "SNOOKER"
                    ? "bg-amber-600"
                    : "bg-sky-500"
                }`}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {table.type === "POOL"
                        ? "9ft Simonis Slate"
                        : table.type === "SNOOKER"
                        ? "12ft Tournament Slate"
                        : "Championship Birch"}
                    </span>
                    <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {table.name}
                    </h4>
                  </div>

                  {isFree && (
                    <Badge variant="available" className="text-[10px] px-2 py-0.5 gap-1 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      Ready
                    </Badge>
                  )}
                  {isOccupied && (
                    <Badge variant="occupied" className="text-[10px] px-2 py-0.5 gap-1 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                      In Play
                    </Badge>
                  )}
                  {isReserved && (
                    <Badge variant="reserved" className="text-[10px] px-2 py-0.5 gap-1 shrink-0">
                      Reserved
                    </Badge>
                  )}
                </div>

                {/* Table specs & session info */}
                <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/60 text-xs space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Base Hourly:</span>
                    <span className="font-semibold text-emerald-400">
                      {formatINR(table.ratePerHourPaise)}/hr
                    </span>
                  </div>

                  {isOccupied && (
                    <div className="flex items-center justify-between text-amber-300 font-mono text-[11px] pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> In Match:
                      </span>
                      <span>{table.elapsedMinutes} mins</span>
                    </div>
                  )}

                  {isReserved && (
                    <div className="flex items-center justify-between text-purple-300 text-[11px] pt-1 border-t border-border/40">
                      <span>Reserved next:</span>
                      <span>Confirmed slot</span>
                    </div>
                  )}

                  {isFree && (
                    <div className="flex items-center justify-between text-emerald-300 text-[11px] pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Condition:
                      </span>
                      <span>Brushed & Ready</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isFree ? (
                  <Link href={`/book?type=${table.type}`} className="w-full block">
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
                    >
                      Reserve {table.type} Table <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/book?type=${table.type}`} className="w-full block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-medium border-border hover:border-emerald-600/50"
                    >
                      Book Next Slot
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
