"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GameTable } from "@/types/database";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { venueStore } from "@/lib/store/venueStore";
import {
  Sparkles,
  Calendar,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import clsx from "clsx";
import { BackButton } from "@/components/ui/BackButton";

export default function TablesDirectoryPage() {
  const [tables, setTables] = useState<GameTable[]>([]);
  const [filter, setFilter] = useState<"all" | "pool" | "snooker">("all");

  useEffect(() => {
    setTables(venueStore.getTables());
    const unsub = venueStore.subscribe(() => {
      setTables(venueStore.getTables());
    });
    return unsub;
  }, []);

  const filtered = tables.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  return (
    <div className="min-h-screen bg-cream-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Navigation */}
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="light" />
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-baize/10 text-baize font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Championship Baize Collection
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-midnight tracking-tight">
            Championship Tables & Arenas
          </h1>
          <p className="text-ash text-base sm:text-lg leading-relaxed">
            Every table at Cue Nation is maintained to tournament standards. Fitted with Strachan 6811 cloth,
            precision slate leveling, Super Aramith Pro-Cup balls, and dimmable overhead brass canopy lighting.
          </p>

          {/* Type Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4">
            <button
              onClick={() => setFilter("all")}
              className={clsx(
                "px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm touch-manipulation min-h-[40px] cursor-pointer",
                filter === "all"
                  ? "bg-midnight text-cream shadow-md"
                  : "bg-white text-ash hover:text-midnight border border-black/5"
              )}
            >
              All Tables ({tables.length})
            </button>
            <button
              onClick={() => setFilter("pool")}
              className={clsx(
                "px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm touch-manipulation min-h-[40px] cursor-pointer",
                filter === "pool"
                  ? "bg-midnight text-cream shadow-md"
                  : "bg-white text-ash hover:text-midnight border border-black/5"
              )}
            >
              9ft Match Pool ({tables.filter((t) => t.type === "pool").length})
            </button>
            <button
              onClick={() => setFilter("snooker")}
              className={clsx(
                "px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm touch-manipulation min-h-[40px] cursor-pointer",
                filter === "snooker"
                  ? "bg-midnight text-cream shadow-md"
                  : "bg-white text-ash hover:text-midnight border border-black/5"
              )}
            >
              12ft Tournament Snooker ({tables.filter((t) => t.type === "snooker").length})
            </button>
          </div>
        </div>

        {/* Table Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((table) => {
            const isSnooker = table.type === "snooker";
            const hourlyRate = isSnooker ? 500 : 350;

            return (
              <Card
                key={table.id}
                className="bg-white border-black/10 overflow-hidden flex flex-col justify-between hover:shadow-card-hover transition-all duration-300 rounded-2xl"
              >
                <div className="p-6 space-y-4">
                  {/* Top Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-widest text-bronze">
                      {isSnooker ? "12ft Tournament Snooker" : "9ft Match Pool"}
                    </span>
                    <StatusBadge status={table.status} />
                  </div>

                  <h3 className="font-display text-2xl font-bold text-midnight">
                    {table.name}
                  </h3>

                  <p className="text-sm text-ash line-clamp-2">
                    {isSnooker
                      ? "Full-size English steel-block cushioned tournament snooker table with precision 5-piece Italian slate."
                      : "Official WPA-sanctioned 9-foot match pool table with drop pockets and rapid response K-66 gum rubber cushions."}
                  </p>

                  {/* Feature Pills */}
                  <div className="pt-2 flex flex-wrap gap-2 text-xs font-medium text-ash">
                    <span className="px-2.5 py-1 rounded-md bg-cream-soft border border-bronze/10">
                      Strachan 6811 Cloth
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-cream-soft border border-bronze/10">
                      Aramith Pro Balls
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-cream-soft border border-bronze/10">
                      Brass Canopy Lamps
                    </span>
                  </div>
                </div>

                {/* Bottom Pricing & CTA */}
                <div className="p-6 bg-cream-soft/50 border-t border-black/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-ash">Starting from</div>
                    <div className="font-mono text-xl font-bold text-midnight tabular-nums">
                      ₹{hourlyRate}
                      <span className="text-xs font-normal text-ash"> / hr</span>
                    </div>
                  </div>

                  <Link href={`/booking?tableId=${table.id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={table.status === "maintenance"}
                      className="gap-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      {table.status === "maintenance" ? "Under Maintenance" : "Book Table"}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quality Guarantee Callout */}
        <div className="bg-midnight text-cream rounded-2xl p-8 sm:p-10 border border-midnight-line flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <h3 className="font-display text-2xl font-bold text-bronze-glow">
              Strict Anti-Double-Booking Guarantee
            </h3>
            <p className="text-mist text-sm sm:text-base leading-relaxed">
              When you reserve at Cue Nation, our server immediately locks your exact time window with atomic exclusion.
              Your table is warm, brushed, and reserved specifically for your arrival.
            </p>
          </div>
          <Link href="/pricing">
            <Button variant="secondary-dark" size="lg" className="whitespace-nowrap">
              Explore All Pricing & Packages
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
