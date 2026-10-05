"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Zap, Users, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function PricingCalculator() {
  const [tableType, setTableType] = useState<"POOL" | "SNOOKER" | "CAROM">("POOL");
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [timeBand, setTimeBand] = useState<"HAPPY_HOUR" | "PRIME_TIME">("HAPPY_HOUR");
  const [splitCount, setSplitCount] = useState<number>(2);

  // Pricing rules (in paise)
  const rates = {
    POOL: {
      HAPPY_HOUR: 15000, // ₹150 / hr
      PRIME_TIME: 25000, // ₹250 / hr
      name: "9ft Tournament Pool",
      cloth: "Simonis 860 Cloth",
    },
    SNOOKER: {
      HAPPY_HOUR: 25000, // ₹250 / hr
      PRIME_TIME: 35000, // ₹350 / hr
      name: "12ft Tournament Snooker",
      cloth: "Strachan 6811 Cloth",
    },
    CAROM: {
      HAPPY_HOUR: 10000, // ₹100 / hr
      PRIME_TIME: 15000, // ₹150 / hr
      name: "Championship Birch Board",
      cloth: "Silicone Glazed",
    },
  };

  const selectedRate = rates[tableType][timeBand];
  const regularRate = rates[tableType].PRIME_TIME;
  const isHappyHour = timeBand === "HAPPY_HOUR";

  const totalPaise = Math.round((selectedRate * durationMinutes) / 60);
  const regularTotalPaise = Math.round((regularRate * durationMinutes) / 60);
  const savingsPaise = Math.max(0, regularTotalPaise - totalPaise);
  const perPersonPaise = Math.round(totalPaise / splitCount);

  return (
    <Card className="border-emerald-700/30 bg-gradient-to-br from-card/90 via-billiard-900/60 to-billiard-950 text-foreground overflow-hidden shadow-2xl backdrop-blur">
      <div className="p-6 md:p-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Dynamic Minute-Prorated Calculator
            </div>
            <h3 className="text-2xl font-bold text-white">Estimate Your Match & Savings</h3>
            <p className="text-xs text-muted-foreground">
              We bill minute-by-minute with zero rounding. Split effortlessly with your friends at checkout.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-muted-foreground block">Happy Hour Window</span>
            <span className="text-sm font-bold text-emerald-400">11:00 AM – 5:00 PM Daily</span>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Select Game */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              1. Choose Table Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "POOL", label: "Pool (9ft)", icon: "🎱" },
                { id: "SNOOKER", label: "Snooker", icon: "🔴" },
                { id: "CAROM", label: "Carom", icon: "🎯" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setTableType(g.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    tableType === g.id
                      ? "border-emerald-500 bg-emerald-950/60 text-white font-bold shadow-md shadow-emerald-950"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-emerald-700 hover:text-white"
                  }`}
                >
                  <div className="text-xl mb-1">{g.icon}</div>
                  <div className="text-xs">{g.label}</div>
                </button>
              ))}
            </div>
            <div className="text-[11px] text-emerald-400/80 pt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {rates[tableType].cloth}
            </div>
          </div>

          {/* Step 2: Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              2. Session Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { mins: 30, label: "30m" },
                { mins: 60, label: "1 hr" },
                { mins: 120, label: "2 hrs" },
                { mins: 180, label: "3 hrs" },
              ].map((d) => (
                <button
                  key={d.mins}
                  onClick={() => setDurationMinutes(d.mins)}
                  className={`py-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    durationMinutes === d.mins
                      ? "border-emerald-500 bg-primary text-white shadow-md shadow-emerald-950"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-emerald-700 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Time Band Toggle */}
            <div className="pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTimeBand("HAPPY_HOUR")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isHappyHour
                      ? "border-amber-500 bg-amber-500/20 text-amber-200"
                      : "border-border bg-secondary/20 text-muted-foreground hover:text-white"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Happy Hour (Save 35%)
                </button>
                <button
                  onClick={() => setTimeBand("PRIME_TIME")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    !isHappyHour
                      ? "border-emerald-500 bg-emerald-950/60 text-emerald-200"
                      : "border-border bg-secondary/20 text-muted-foreground hover:text-white"
                  }`}
                >
                  Evening Prime
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Split with friends */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              3. Split Between Players
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setSplitCount(count)}
                  className={`flex-1 py-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    splitCount === count
                      ? "border-amber-500 bg-amber-500/20 text-amber-300"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-amber-700 hover:text-white"
                  }`}
                >
                  {count} {count === 1 ? "Solo" : `Players`}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground pt-1">
              Supports 4-way UPI split QR codes, itemized split, and "Loser Pays All" mode at our digital POS counter!
            </p>
          </div>
        </div>

        {/* Calculation Result Showcase Banner */}
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 backdrop-blur flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs text-emerald-300/80 font-medium">
              Estimated Total ({durationMinutes / 60} hrs • {rates[tableType].name})
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="text-4xl font-black text-white">{formatINR(totalPaise)}</span>
              {isHappyHour && savingsPaise > 0 && (
                <Badge variant="gold" className="text-xs font-bold px-2.5 py-1">
                  You Save {formatINR(savingsPaise)}!
                </Badge>
              )}
            </div>
            {splitCount > 1 && (
              <div className="text-xs text-amber-300 font-semibold flex items-center justify-center md:justify-start gap-1.5 pt-1">
                <Users className="h-3.5 w-3.5" /> Just {formatINR(perPersonPaise)} per player
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link href={`/book?type=${tableType}`} className="w-full sm:w-auto">
              <Button size="lg" variant="gold" className="w-full sm:w-auto font-bold gap-2 text-sm shadow-xl shadow-amber-950/50">
                Book {rates[tableType].name} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
