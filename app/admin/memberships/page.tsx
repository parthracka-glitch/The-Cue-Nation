"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatINR } from "@/lib/money";
import { Award, Plus, CheckCircle2, UserCheck, Calendar, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MembershipsPage() {
  const { data, mutate, isLoading } = useSWR("/api/admin/memberships", fetcher);

  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [sellPaymentMethod, setSellPaymentMethod] = useState("UPI");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const plans = data?.plans || [];
  const activeMembers = data?.activeMembers || [];
  const customers = data?.customers || [];

  async function handleSellMembership(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlanId || !selectedCustomerId) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlanId,
          customerId: selectedCustomerId,
          paymentMethod: sellPaymentMethod,
        }),
      });

      if (res.ok) {
        setSuccessMessage("VIP Membership successfully sold and activated!");
        setSellModalOpen(false);
        mutate();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-400" /> VIP Memberships
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage subscription tiers, track active member validity, and sell plans to players.
          </p>
        </div>

        <Button
          onClick={() => setSellModalOpen(true)}
          variant="gold"
          size="sm"
          className="text-xs font-semibold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Sell Membership Plan
        </Button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-300 font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Available Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((p: any) => (
          <Card key={p.id} className="border-amber-500/30 bg-card/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="gold" className="text-xs">
                  {p.durationDays} Days Validity
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {p._count?.memberships || 0} Members
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-2">{p.name}</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">
                {p.discountPercent}% OFF table time rates
                {p.includedMinutes > 0 && ` + ${p.includedMinutes / 60} hours included`}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">
                {formatINR(p.priceInPaise)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPlanId(p.id);
                  setSellModalOpen(true);
                }}
                className="text-xs"
              >
                Sell Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Active VIP Members List */}
      <Card className="border-border bg-card/80">
        <CardHeader className="p-4 pb-2 border-b border-border">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-400" /> Active Members ({activeMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-400" />
              Loading active members...
            </div>
          ) : activeMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No active memberships found.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {activeMembers.map((m: any) => {
                const daysRemaining = Math.max(
                  0,
                  Math.ceil((new Date(m.endsAt).getTime() - Date.now()) / (1000 * 3600 * 24))
                );
                return (
                  <div
                    key={m.id}
                    className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {m.customer.name}
                        </span>
                        <Badge variant="gold" className="text-[10px]">
                          {m.plan.name}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-[11px] block mt-0.5">
                        {m.customer.phone}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">
                          Included Minutes Used:
                        </span>
                        <span className="font-bold text-white">
                          {m.minutesUsed} / {m.plan.includedMinutes}m
                        </span>
                      </div>

                      <div className="min-w-[100px]">
                        <span className="text-[11px] text-muted-foreground block">Expiry:</span>
                        <span className="font-bold text-emerald-400">
                          {daysRemaining} days left
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sell Plan Modal Dialog */}
      <Dialog open={sellModalOpen} onOpenChange={setSellModalOpen}>
        <DialogContent className="max-w-md bg-card border-emerald-900/60 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg">Sell Membership Tier</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select customer and tier to activate discount benefits and included minutes
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSellMembership} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Membership Plan *</Label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                required
                className="flex h-9 w-full rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
              >
                <option value="">Select plan...</option>
                {plans.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatINR(p.priceInPaise)}) - {p.discountPercent}% OFF
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Customer *</Label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                className="flex h-9 w-full rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
              >
                <option value="">Select customer...</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Payment Method</Label>
              <select
                value={sellPaymentMethod}
                onChange={(e) => setSellPaymentMethod(e.target.value)}
                className="flex h-9 w-full rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
              >
                <option value="UPI">UPI Instant</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card POS</option>
              </select>
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSellModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} size="sm">
                {submitting ? "Activating..." : "Activate Membership"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
