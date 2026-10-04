"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";
import { Play, Clock, Award, Loader2 } from "lucide-react";

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  walletBalance: number;
  creditBalance: number;
}

interface PackageOption {
  id: string;
  name: string;
  billingMode: string;
  quantity: number;
  pricePaise: number;
  tableType: string;
}

interface StartSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: {
    id: string;
    name: string;
    type: string;
    nextReservation?: {
      id: string;
      code: string;
      guestName: string;
      startsAt: string;
      partySize: number;
    } | null;
  } | null;
  customers: CustomerOption[];
  packages: PackageOption[];
  onSessionStarted: () => void;
}

export function StartSessionModal({
  open,
  onOpenChange,
  table,
  customers,
  packages,
  onSessionStarted,
}: StartSessionModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isWalkIn, setIsWalkIn] = useState<boolean>(true);
  const [walkInName, setWalkInName] = useState<string>("Walk-in Guest");
  const [walkInPhone, setWalkInPhone] = useState<string>("");
  const [billingMode, setBillingMode] = useState<"TIME" | "FRAME" | "PACKAGE">("TIME");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [linkReservation, setLinkReservation] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!table) return null;

  // Filter packages matching this table type
  const availablePackages = packages.filter((p) => p.tableType === table.type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        tableId: table?.id,
        billingMode,
        packageDealId: billingMode === "PACKAGE" ? selectedPackageId : null,
      };

      if (linkReservation && table?.nextReservation) {
        payload.reservationId = table.nextReservation.id;
      }

      if (isWalkIn) {
        payload.walkInName = walkInName.trim() || "Walk-in Guest";
        payload.walkInPhone = walkInPhone.trim() || undefined;
      } else {
        payload.customerId = selectedCustomerId;
      }

      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start session");
        setLoading(false);
        return;
      }

      onSessionStarted();
      onOpenChange(false);
    } catch {
      setError("Network error starting session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-emerald-900/60 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl">Start Session • {table.name}</DialogTitle>
            <Badge variant="available">{table.type}</Badge>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Initiate table live timer with rate card snapshot & optional reservation check-in
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Suggest Link Reservation if one is due */}
        {table.nextReservation && (
          <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300">
                Reservation Found: {table.nextReservation.code}
              </span>
              <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/40">
                Due Soon
              </Badge>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Guest: <strong>{table.nextReservation.guestName}</strong> ({table.nextReservation.partySize} players)
            </p>
            <div className="pt-1 flex items-center gap-2">
              <input
                type="checkbox"
                id="linkRes"
                checked={linkReservation}
                onChange={(e) => setLinkReservation(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-500"
              />
              <label htmlFor="linkRes" className="text-xs text-white cursor-pointer">
                Link & Mark Reservation as CHECKED_IN
              </label>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Selection: Walk-in vs Registered */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Guest / Player Identity</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkIn(true)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    isWalkIn ? "bg-primary text-white font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setIsWalkIn(false)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    !isWalkIn ? "bg-primary text-white font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Member / CRM
                </button>
              </div>
            </div>

            {isWalkIn ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="walkInName" className="text-[11px]">Guest Name</Label>
                  <Input
                    id="walkInName"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="Walk-in Guest"
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="walkInPhone" className="text-[11px]">Phone (Optional)</Label>
                  <Input
                    id="walkInPhone"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="+91..."
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            ) : (
              <div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs text-foreground shadow-sm focus:outline-none"
                  required
                >
                  <option value="">Select registered customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - Khata: {formatINR(c.creditBalance)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Billing Mode Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs">Billing Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBillingMode("TIME")}
                className={`p-2 rounded-lg border text-center transition-all ${
                  billingMode === "TIME"
                    ? "border-emerald-500 bg-primary/20 text-white font-semibold"
                    : "border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                <Clock className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                Hourly (Time)
              </button>

              <button
                type="button"
                onClick={() => setBillingMode("FRAME")}
                className={`p-2 rounded-lg border text-center transition-all ${
                  billingMode === "FRAME"
                    ? "border-emerald-500 bg-primary/20 text-white font-semibold"
                    : "border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                <Award className="h-4 w-4 mx-auto mb-1 text-sky-400" />
                Per Frame
              </button>

              <button
                type="button"
                onClick={() => setBillingMode("PACKAGE")}
                className={`p-2 rounded-lg border text-center transition-all ${
                  billingMode === "PACKAGE"
                    ? "border-emerald-500 bg-primary/20 text-white font-semibold"
                    : "border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                <Award className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                Package Deal
              </button>
            </div>
          </div>

          {/* Package Selection dropdown if PACKAGE mode */}
          {billingMode === "PACKAGE" && (
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs">Select Package</Label>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs text-foreground shadow-sm focus:outline-none"
                required
              >
                <option value="">Choose package deal...</option>
                {availablePackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.quantity} {pkg.billingMode === "TIME" ? "Hours" : "Frames"}) - {formatINR(pkg.pricePaise)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="default"
              size="sm"
              className="gap-1.5 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" /> Start Timer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
