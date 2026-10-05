"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR, rupeesToPaise } from "@/lib/money";
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Award,
  Calendar,
  Clock,
  Plus,
  Coins,
  Receipt,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = params.id as string;

  const { data, mutate, isLoading } = useSWR(
    `/api/admin/customers/${customerId}`,
    fetcher
  );

  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpMethod, setTopUpMethod] = useState("UPI");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpBonusMessage, setTopUpBonusMessage] = useState<string | null>(null);

  const [customerNotes, setCustomerNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
        Loading customer record...
      </div>
    );
  }
  if (data?.error || !data?.customer) {
    return (
      <div className="p-8 rounded-xl border border-destructive/40 bg-destructive/10 text-center max-w-lg mx-auto my-16">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg">Customer Not Found</h3>
        <p className="text-sm text-muted-foreground mt-2">{data?.error || "Customer profile could not be retrieved."}</p>
        <Link href="/admin/customers">
          <Button variant="outline" className="mt-4">
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  const { customer, overview = {} } = data;

  async function handleTopUp(e: React.FormEvent) {
    e.preventDefault();
    const paise = rupeesToPaise(parseFloat(topUpAmount));
    if (!paise || paise <= 0) return;
    setTopUpLoading(true);
    setTopUpBonusMessage(null);

    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "WALLET_TOPUP",
          topUpPaise: paise,
          method: topUpMethod,
        }),
      });

      const result = await res.json();
      if (result.bonusPaise > 0) {
        setTopUpBonusMessage(
          `Success! Added ₹${paise / 100} + ₹${result.bonusPaise / 100} promotional bonus to wallet!`
        );
      }
      setTopUpAmount("");
      mutate();
    } catch (e) {
      console.error(e);
    } finally {
      setTopUpLoading(false);
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROFILE",
          notes: customerNotes,
        }),
      });
      mutate();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {customer.name}
              {customer.memberships?.[0] && (
                <Badge variant="gold" className="text-xs">
                  {customer.memberships[0].plan.name}
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">
              Phone: {customer.phone} | Loyalty:{" "}
              <strong className="text-emerald-400">{customer.loyaltyPoints} pts</strong>
            </p>
          </div>
        </div>

        <Link href={`/admin/customers/${customerId}/ledger`}>
          <Button variant="outline" size="sm" className="text-xs text-amber-300 border-amber-500/40 gap-1.5">
            <CreditCard className="h-3.5 w-3.5" /> View Khata Ledger
          </Button>
        </Link>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card/80 p-4 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Wallet Balance
          </span>
          <div className="text-xl font-bold text-emerald-400">
            {formatINR(customer.walletBalance)}
          </div>
        </Card>

        <Card className="border-border bg-card/80 p-4 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Credit Khata Owed
          </span>
          <div className="text-xl font-bold text-amber-400">
            {formatINR(customer.creditBalance)}
          </div>
        </Card>

        <Card className="border-border bg-card/80 p-4 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Lifetime Spend
          </span>
          <div className="text-xl font-bold text-white">
            {formatINR(overview.lifetimeSpendPaise)}
          </div>
        </Card>

        <Card className="border-border bg-card/80 p-4 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Favorite Game
          </span>
          <div className="text-xl font-bold text-white flex items-center gap-1.5">
            <span>{overview.favoriteTableType === "POOL" ? "🎱" : "🔴"}</span>
            <span>{overview.favoriteTableType}</span>
          </div>
        </Card>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="visits">
        <TabsList>
          <TabsTrigger value="visits">Visits & Sessions ({customer.sessions.length})</TabsTrigger>
          <TabsTrigger value="wallet">Wallet Top-Up & Bonus</TabsTrigger>
          <TabsTrigger value="memberships">VIP Memberships</TabsTrigger>
          <TabsTrigger value="notes">Staff Notes</TabsTrigger>
        </TabsList>

        {/* Tab 1: Visits & Bills */}
        <TabsContent value="visits" className="space-y-3 pt-3">
          {customer.sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No sessions recorded.
            </div>
          ) : (
            customer.sessions.map((sess: any) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/60 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{sess.table.name}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {sess.billingMode}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(sess.startedAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <Badge variant={sess.status === "ENDED" ? "secondary" : "available"}>
                  {sess.status}
                </Badge>
              </div>
            ))
          )}
        </TabsContent>

        {/* Tab 2: Wallet Top-Up */}
        <TabsContent value="wallet" className="pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Card className="border-border bg-card/80">
              <CardHeader className="p-4 pb-2 border-b border-border">
                <CardTitle className="text-sm text-white">Add Wallet Balance</CardTitle>
                <CardDescription className="text-xs">
                  ⚡ Promotional Rule: Top up ₹1,000 or more to receive an automatic 10% cash bonus!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {topUpBonusMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-300 mb-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{topUpBonusMessage}</span>
                  </div>
                )}

                <form onSubmit={handleTopUp} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs">Top-Up Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      required
                      className="h-10 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Payment Method</Label>
                    <select
                      value={topUpMethod}
                      onChange={(e) => setTopUpMethod(e.target.value)}
                      className="flex h-9 w-full rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
                    >
                      <option value="UPI">UPI Instant</option>
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card POS</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={topUpLoading}
                    variant="gold"
                    className="w-full h-10 text-xs font-semibold mt-2"
                  >
                    {topUpLoading ? "Adding Funds..." : "Add to Wallet"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/80">
              <CardHeader className="p-4 pb-2 border-b border-border">
                <CardTitle className="text-sm text-white">Recent Wallet Activities</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                {customer.ledgerEntries
                  .filter((e: any) => e.type.includes("WALLET"))
                  .slice(0, 5)
                  .map((entry: any) => (
                    <div
                      key={entry.id}
                      className="flex justify-between items-center p-2 rounded border border-border bg-secondary/30"
                    >
                      <div>
                        <span className="font-semibold text-white block">{entry.note}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatINR(entry.amountPaise)}
                      </span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Memberships */}
        <TabsContent value="memberships" className="pt-3 space-y-3">
          {customer.memberships.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No active or past VIP memberships. Sell a tier from the Memberships tab.
            </div>
          ) : (
            customer.memberships.map((m: any) => (
              <Card key={m.id} className="border-amber-500/40 bg-card/80 p-4 flex items-center justify-between">
                <div>
                  <Badge variant="gold" className="text-xs mb-1">
                    {m.plan.name}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Valid until: <strong>{new Date(m.endsAt).toLocaleDateString("en-IN")}</strong>
                  </p>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {m.plan.discountPercent}% OFF table time
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-muted-foreground block">Included Minutes Used</span>
                  <span className="font-bold text-white text-sm">
                    {m.minutesUsed} / {m.plan.includedMinutes} mins
                  </span>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab 4: Staff Notes */}
        <TabsContent value="notes" className="pt-3 space-y-3">
          <Card className="border-border bg-card/80 p-4 space-y-3">
            <Label className="text-xs">Private Venue Notes</Label>
            <textarea
              rows={4}
              value={customerNotes || customer.notes || ""}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/50 p-3 text-xs text-foreground focus:outline-none"
              placeholder="e.g. Regular 9-ball tournament player, preferred cue #4..."
            />
            <Button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              size="sm"
              className="text-xs"
            >
              {savingNotes ? "Saving..." : "Save Notes"}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
