"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { TableCard } from "./table-card";
import { StartSessionModal } from "./start-session-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/money";
import {
  Users,
  Coins,
  Receipt,
  CalendarCheck,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function FloorGrid() {
  const { data, error: _error, mutate, isLoading } = useSWR("/api/admin/floor", fetcher, {
    refreshInterval: 5000, // 5s SWR polling as required by specs
    revalidateOnFocus: true,
  });

  const [modalTable, setModalTable] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const tables = data?.tables || [];
  const summary = data?.summary || {
    occupiedCount: 0,
    totalCount: 0,
    occupancyPercent: 0,
    liveRevenueTodayPaise: 0,
    openTabsCount: 0,
    upcomingReservationsCount: 0,
  };

  const availableTables = tables
    .filter((t: any) => t.status === "AVAILABLE")
    .map((t: any) => ({ id: t.id, name: t.name }));

  function handleStartSession(table: any) {
    setModalTable(table);
    setModalOpen(true);
  }

  function handleQuickWalkIn() {
    // Pick the first available table
    const firstFree = tables.find((t: any) => t.status === "AVAILABLE");
    if (firstFree) {
      handleStartSession(firstFree);
    } else {
      alert("All tables are currently occupied or in maintenance!");
    }
  }

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Occupancy Card */}
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Table Occupancy
              </span>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {summary.occupiedCount} / {summary.totalCount}
                <span className="text-xs font-normal text-emerald-400 ml-1.5">
                  ({summary.occupancyPercent}%)
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Live Daily Revenue Card */}
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Revenue Today
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                {formatINR(summary.liveRevenueTodayPaise)}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active Open Tabs Card */}
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Active Open Tabs
              </span>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {summary.openTabsCount}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reservations Card */}
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Next 60m Bookings
              </span>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {summary.upcomingReservationsCount}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Floor Grid & Live Sessions
          </h2>
          <p className="text-xs text-muted-foreground">
            Auto-syncing every 5s via SWR. Touch card actions to manage timers, F&B orders, or table moves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            className="text-xs gap-1.5"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={handleQuickWalkIn}
            className="text-xs font-semibold gap-1.5 shadow-md shadow-amber-950/30"
          >
            <Plus className="h-3.5 w-3.5" /> Walk-In Quick Start
          </Button>
        </div>
      </div>

      {/* Grid of 8 Tables */}
      {tables.length === 0 && isLoading ? (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto mb-2" />
          <span className="text-xs text-muted-foreground">Connecting to Floor Grid...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table: any) => (
            <TableCard
              key={table.id}
              table={table}
              availableTables={availableTables.filter((t: any) => t.id !== table.id)}
              onStartSession={handleStartSession}
              onRefresh={() => mutate()}
            />
          ))}
        </div>
      )}

      {/* Floating Walk-in Quick Start button on mobile/tablets */}
      <div className="fixed bottom-6 right-6 lg:hidden z-30">
        <Button
          onClick={handleQuickWalkIn}
          variant="gold"
          size="touch"
          className="rounded-full shadow-2xl shadow-black font-bold flex items-center gap-2 px-6"
        >
          <Plus className="h-5 w-5" /> Quick Start
        </Button>
      </div>

      {/* Start Session Modal */}
      <StartSessionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        table={modalTable}
        customers={data?.customers || []}
        packages={data?.packages || []}
        onSessionStarted={() => mutate()}
      />
    </div>
  );
}
