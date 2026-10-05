"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatINR, paiseToRupees, rupeesToPaise } from "@/lib/money";
import {
  ArrowLeft,
  Receipt,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  QrCode,
  CreditCard,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DayClosePage() {
  const { data, mutate, isLoading } = useSWR("/api/admin/reports/day-close", fetcher);

  const [actualCashRupees, setActualCashRupees] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [closedSuccess, setClosedSuccess] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
        Calculating day close register...
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="p-8 rounded-xl border border-destructive/40 bg-destructive/10 text-center max-w-lg mx-auto my-16">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg">Unable to Access Day Close</h3>
        <p className="text-sm text-muted-foreground mt-2">{data.error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const {
    openingCashPaise = 0,
    cashCollected = 0,
    upiCollected = 0,
    cardCollected = 0,
    creditGiven = 0,
    expectedCashInDrawer = 0,
    pastCloses = [],
  } = data || {};

  const actualCashPaise = rupeesToPaise(parseFloat(actualCashRupees) || 0);
  const variancePaise = actualCashPaise - expectedCashInDrawer;

  async function handleCloseDay(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Are you sure you want to finalize and lock the daily register?")) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/reports/day-close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openingCashPaise,
          cashCollected,
          upiCollected,
          cardCollected,
          creditGiven,
          expectedCash: expectedCashInDrawer,
          actualCash: actualCashPaise,
          notes: closingNotes,
        }),
      });

      if (res.ok) {
        setClosedSuccess(true);
        mutate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/reports">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Receipt className="h-6 w-6 text-emerald-400" /> Daily Register Close
            </h1>
            <p className="text-xs text-muted-foreground">
              Reconcile cash drawer, UPI, and Card collections against system receipts.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/40">
          {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
        </Badge>
      </div>

      {closedSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-300 font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Register day close successfully recorded and locked in database!</span>
        </div>
      )}

      {/* Grid of collections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card/80 p-4 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Opening Float
          </span>
          <div className="text-xl font-bold text-white">
            {formatINR(openingCashPaise)}
          </div>
        </Card>

        <Card className="border-border bg-card/80 p-4 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Cash Collected
          </span>
          <div className="text-xl font-bold text-emerald-400">
            {formatINR(cashCollected)}
          </div>
        </Card>

        <Card className="border-border bg-card/80 p-4 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            UPI Collected
          </span>
          <div className="text-xl font-bold text-sky-400">
            {formatINR(upiCollected)}
          </div>
        </Card>

        <Card className="border-border bg-card/80 p-4 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Khata Credit Extended
          </span>
          <div className="text-xl font-bold text-amber-400">
            {formatINR(creditGiven)}
          </div>
        </Card>
      </div>

      {/* Reconciliation Form */}
      <Card className="border-border bg-card/90">
        <CardHeader className="p-4 pb-2 border-b border-border">
          <CardTitle className="text-base text-white">Cash Drawer Count & Sign-off</CardTitle>
          <CardDescription className="text-xs">
            Physical drawer cash count must reconcile with opening float + cash collections.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl border border-border bg-secondary/30 flex items-center justify-between">
            <div>
              <span className="text-muted-foreground block text-[11px]">System Expected Cash:</span>
              <span className="text-lg font-black text-emerald-400">
                {formatINR(expectedCashInDrawer)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[11px]">Cash Float + Today Cash</span>
              <span className="text-[11px] text-zinc-400">
                {formatINR(openingCashPaise)} + {formatINR(cashCollected)}
              </span>
            </div>
          </div>

          <form onSubmit={handleCloseDay} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Physical Cash Count in Drawer (₹) *</Label>
                <Input
                  type="number"
                  placeholder={paiseToRupees(expectedCashInDrawer).toString()}
                  value={actualCashRupees}
                  onChange={(e) => setActualCashRupees(e.target.value)}
                  required
                  className="h-10 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Variance / Discrepancy</Label>
                <div
                  className={`h-10 px-3 rounded-lg border flex items-center font-mono font-bold text-sm ${
                    variancePaise === 0
                      ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-300"
                      : variancePaise > 0
                      ? "border-sky-500/50 bg-sky-950/20 text-sky-300"
                      : "border-red-500/50 bg-red-950/20 text-red-300"
                  }`}
                >
                  {actualCashRupees ? formatINR(variancePaise) : "Enter cash count"}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Shift Notes & Observations</Label>
              <Input
                placeholder="All tables cleaned, cash verified by manager..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              variant="gold"
              className="w-full h-11 text-xs font-bold gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Closing Day...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Finalize & Close Register
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
