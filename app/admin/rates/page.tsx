"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";
import { Sliders, Calculator, Zap, Clock, ShieldCheck, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RatesManagementPage() {
  const { data, mutate, isLoading } = useSWR("/api/admin/rates", fetcher);
  const rateCards = data?.rateCards || [];

  // Simulator state
  const [simRateCardId, setSimRateCardId] = useState("");
  const [simDate, setSimDate] = useState(new Date().toISOString().split("T")[0]);
  const [simTime, setSimTime] = useState("16:30");
  const [simDuration, setSimDuration] = useState("2");
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (rateCards.length > 0 && !simRateCardId) {
      setSimRateCardId(rateCards[0].id);
    }
  }, [rateCards, simRateCardId]);

  async function runSimulation() {
    if (!simRateCardId) return;
    setSimulating(true);

    try {
      const startTime = `${simDate}T${simTime}:00+05:30`;
      const res = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateCardId: simRateCardId,
          startTime,
          durationHours: parseFloat(simDuration),
        }),
      });

      const data = await res.json();
      setSimResult(data.result);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  }

  useEffect(() => {
    if (simRateCardId) {
      runSimulation();
    }
  }, [simRateCardId, simDate, simTime, simDuration]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="h-6 w-6 text-emerald-400" /> Rates & Band Pricing Admin
        </h1>
        <p className="text-xs text-muted-foreground">
          Configure time band schedules, happy hour windows, minimum charge thresholds, and simulate pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Visual Rate Cards & Bands (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Loading rate cards...
            </div>
          ) : (
            rateCards.map((rc: any) => (
              <Card key={rc.id} className="border-border bg-card/80">
                <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base text-white">{rc.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">
                        {rc.billingMode}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Assigned to: {rc.tables.map((t: any) => t.name).join(", ")}
                    </CardDescription>
                  </div>

                  <div className="text-right text-[11px] text-muted-foreground">
                    <span>Min Charge: {rc.minChargeMinutes}m</span> |{" "}
                    <span>Grace: {rc.graceMinutes}m</span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Active Time Bands (Days x Hours)
                  </span>

                  <div className="space-y-2">
                    {rc.bands.map((band: any) => {
                      const isHappyHour = band.label.toLowerCase().includes("happy");
                      return (
                        <div
                          key={band.id}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            isHappyHour
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                              : "border-border bg-secondary/30 text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isHappyHour ? (
                              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                            ) : (
                              <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold block">{band.label}</span>
                              <span className="text-[10px] opacity-75">
                                Days: {band.daysOfWeek.replace(/,/g, ", ")} (Mon=1, Sun=7)
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-bold text-emerald-400 text-sm">
                              {formatINR(band.ratePerHourPaise)}/hr
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {Math.floor(band.startMinute / 60)}:00 –{" "}
                              {Math.floor(band.endMinute / 60)}:00
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {rc.framePricePaise && (
                    <div className="p-2.5 rounded-lg border border-border bg-secondary/20 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Frame Billing Rate:</span>
                      <span className="font-bold text-sky-400 font-mono">
                        {formatINR(rc.framePricePaise)} / frame
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Price Simulator (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="border-border bg-card/90 shadow-xl sticky top-20">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Calculator className="h-4 w-4 text-amber-400" /> Interactive Price Simulator
              </CardTitle>
              <CardDescription className="text-xs">
                Test band-crossing proration in real-time using the pure pricing engine
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">Select Rate Card</Label>
                <select
                  value={simRateCardId}
                  onChange={(e) => setSimRateCardId(e.target.value)}
                  className="flex h-9 w-full rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
                >
                  {rateCards.map((rc: any) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Simulated Date</Label>
                  <Input
                    type="date"
                    value={simDate}
                    onChange={(e) => setSimDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Start Time (IST)</Label>
                  <Input
                    type="time"
                    value={simTime}
                    onChange={(e) => setSimTime(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Duration (Hours)</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["0.5", "1", "1.5", "2"].map((d) => (
                    <Button
                      key={d}
                      type="button"
                      variant={simDuration === d ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSimDuration(d)}
                      className="h-8 text-xs"
                    >
                      {d}h
                    </Button>
                  ))}
                </div>
              </div>

              {/* Simulation Result */}
              {simResult && (
                <div className="p-3.5 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                    <span className="font-bold text-white text-xs">
                      Simulation Total ({simResult.billableMinutes} mins)
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      {formatINR(simResult.totalPaise)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Minute-Level Band Breakdown:
                    </span>
                    {simResult.breakdown.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-muted-foreground">
                        <span>
                          {item.label} ({item.minutes} mins)
                        </span>
                        <span className="text-white font-medium">
                          {formatINR(item.amountPaise)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
