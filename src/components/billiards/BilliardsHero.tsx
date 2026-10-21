"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Clock, Award, Users } from "lucide-react";
import { GameTable } from "@/types/database";

export function BilliardsHero() {
  const [tables, setTables] = useState<GameTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data) => {
        if (data.tables) setTables(data.tables);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const freeCount = tables.filter((t) => t.status === "free" && t.active).length;
  const totalCount = tables.filter((t) => t.active).length;

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden text-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-charcoal/80 border border-brass/30 backdrop-blur-md text-xs font-medium tracking-wide shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-brass">LIVE VENUE STATUS:</span>
            <span className="text-ivory font-semibold tabular-nums">
              {loading ? "Checking..." : `${freeCount} of ${totalCount} Tables Available Now`}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight text-ivory leading-tight">
            Own the Table. <br />
            <span className="bg-gradient-to-r from-brass via-ivory to-brass bg-clip-text text-transparent">
              Master the Baize.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-ivory/80 font-sans max-w-2xl mx-auto leading-relaxed">
            Bengaluru’s premier cue-sports sanctuary. Tournament-grade English pool and snooker arenas, artisanal single-origin brews, and seamless digital table reservations.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
            <Link
              href="/booking"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brass to-brass-dark hover:from-brass-glow hover:to-brass text-ink font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-brass/20 hover:-translate-y-0.5 touch-manipulation min-h-[48px]"
            >
              <Sparkles className="w-5 h-5" />
              <span>Reserve a Table</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/tables"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-charcoal/70 hover:bg-charcoal border border-ivory/20 hover:border-brass/50 text-ivory font-medium text-base transition-all duration-200 backdrop-blur-sm touch-manipulation min-h-[48px]"
            >
              <span>Explore Fleet & Rates</span>
            </Link>
          </div>

          {/* Arena Feature Pills */}
          <div className="pt-8 sm:pt-12 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-left">
            <div className="p-4 rounded-xl bg-charcoal/50 border border-ivory/10 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-brass">
                <Award className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-semibold">Cloth</span>
              </div>
              <p className="text-sm font-medium text-ivory">Strachan 6811 & Hainsworth</p>
            </div>

            <div className="p-4 rounded-xl bg-charcoal/50 border border-ivory/10 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-brass">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-semibold">Tables</span>
              </div>
              <p className="text-sm font-medium text-ivory">Brunswick & Riley 12ft</p>
            </div>

            <div className="p-4 rounded-xl bg-charcoal/50 border border-ivory/10 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-brass">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-semibold">Hours</span>
              </div>
              <p className="text-sm font-medium text-ivory">10:00 AM – 01:00 AM Daily</p>
            </div>

            <div className="p-4 rounded-xl bg-charcoal/50 border border-ivory/10 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-brass">
                <Users className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-semibold">Atmosphere</span>
              </div>
              <p className="text-sm font-medium text-ivory">Specialty Coffee & Lounge</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
