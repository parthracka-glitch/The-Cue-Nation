"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Volume2,
  VolumeX,
  LayoutDashboard,
  UtensilsCrossed,
} from "lucide-react";
import { useKitchenTickets } from "@/client/hooks/use-kitchen-tickets";
import { KDSBoard } from "@/components/kitchen/kds-board";

export default function KitchenDisplayPage() {
  const [stationFilter, setStationFilter] = useState<string>("ALL");
  const [soundEnabled, setSoundEnabled] = useState(false);

  const { tickets, advanceItem } = useKitchenTickets(stationFilter, soundEnabled);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top KDS Control Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-md">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">
              CueClub Kitchen & Bar Display
            </h1>
            <p className="text-xs text-slate-400">Live KDS Ticket Management</p>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {(["ALL", "KITCHEN", "BAR"] as const).map((station) => (
            <button
              key={station}
              onClick={() => setStationFilter(station)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                stationFilter === station
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {station === "ALL" ? "All Stations" : station === "KITCHEN" ? "Kitchen Only" : "Bar Only"}
            </button>
          ))}
        </div>

        {/* Chime & Admin Links */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/60">
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
            <span className="text-xs text-slate-300">Sound Chime</span>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>

          <Link href="/admin">
            <Button variant="outline" size="sm" className="border-slate-700 text-xs">
              <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
              Floor View
            </Button>
          </Link>
        </div>
      </header>

      {/* Main KDS Grid */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <KDSBoard tickets={tickets} onAdvanceItem={advanceItem} />
      </main>
    </div>
  );
}
