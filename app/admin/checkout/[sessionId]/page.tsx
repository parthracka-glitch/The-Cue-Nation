"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR, paiseToRupees, rupeesToPaise } from "@/lib/money";
import { splitEven, loserPays, splitByItem } from "@/lib/settlement";
import { QRCodeSVG } from "qrcode.react";
import {
  CreditCard,
  QrCode,
  Banknote,
  Wallet,
  Users,
  Award,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Send,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { data, mutate, isLoading } = useSWR(
    `/api/admin/checkout/${sessionId}`,
    fetcher
  );

  const [settlementMode, setSettlementMode] = useState<
    "SINGLE" | "EVEN" | "BY_ITEM" | "LOSER_PAYS" | "CORPORATE"
  >("SINGLE");

  // Single payer inputs
  const [singleMethod, setSingleMethod] = useState<"CASH" | "UPI" | "CARD" | "WALLET" | "CREDIT">("UPI");
  const [cashTendered, setCashTendered] = useState<string>("");

  // Even split inputs
  const [splitCount, setSplitCount] = useState<number>(3);
  const [evenPlayerMethods, setEvenPlayerMethods] = useState<Record<number, string>>({
    0: "UPI",
    1: "CASH",
    2: "CREDIT",
  });

  // Loser pays inputs
  const [designatedLoserId, setDesignatedLoserId] = useState<string>("player-1");
  const [loserPlayerMethods, setLoserPlayerMethods] = useState<Record<string, string>>({
    "player-1": "UPI",
    "player-2": "CASH",
    "player-3": "CREDIT",
  });

  // Manual discount
  const [manualDiscountRupees, setManualDiscountRupees] = useState<string>("0");
  const [manualDiscountReason, setManualDiscountReason] = useState<string>("");

  // Settlement execution state
  const [isSettling, setIsSettling] = useState(false);
  const [settleError, setSettleError] = useState<string | null>(null);
  const [settledBill, setSettledBill] = useState<any | null>(null);

  // Mock UPI modal
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiPendingAmountPaise, setUpiPendingAmountPaise] = useState(0);

  if (isLoading || !data) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto mb-2" />
        <span className="text-xs text-muted-foreground">Generating session folio...</span>
      </div>
    );
  }

  if (data?.error || !data?.totals) {
    return (
      <div className="p-8 rounded-xl border border-destructive/40 bg-destructive/10 text-center max-w-lg mx-auto my-16">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg">Unable to Load Checkout Folio</h3>
        <p className="text-sm text-muted-foreground mt-2">{data?.error || "Session not found or already closed."}</p>
        <Link href="/admin">
          <Button variant="outline" className="mt-4">
            Return to Floor
          </Button>
        </Link>
      </div>
    );
  }

  const { session, customer, timeCharge, membershipDiscount, orderItems = [], totals } = data;

  const effectiveManualDiscountPaise = rupeesToPaise(parseFloat(manualDiscountRupees) || 0);
  const finalTotalPaise = Math.max(0, totals.totalPaise - effectiveManualDiscountPaise);

  // Remainder-distributed Even Split calculation
  const evenShares = splitEven(finalTotalPaise, splitCount);

  // 3-Player Loser-Pays calculation
  const dummyFoodByPlayer = {
    "player-1": orderItems.slice(0, 1),
    "player-2": orderItems.slice(1, 2),
    "player-3": orderItems.slice(2),
  };
  const loserShares = loserPays({
    tableChargePaise: timeCharge.totalPaise - membershipDiscount.discountPaise,
    foodItemsByPlayer: dummyFoodByPlayer,
    loserId: designatedLoserId,
    playerNames: {
      "player-1": "Player 1 (Rahul)",
      "player-2": "Player 2 (Aman)",
      "player-3": "Player 3 (Pooja)",
    },
    defaultTaxPercent: 5.0,
  });

  // Cash change due
  const cashGivenPaise = rupeesToPaise(parseFloat(cashTendered) || 0);
  const changeDuePaise = Math.max(0, cashGivenPaise - finalTotalPaise);

  // Execute Final Settlement
  async function handleSettleBill() {
    setIsSettling(true);
    setSettleError(null);

    let paymentPayload: Array<{
      customerId?: string;
      method: string;
      amountPaise: number;
      label?: string;
    }> = [];

    if (settlementMode === "SINGLE") {
      paymentPayload.push({
        customerId: customer?.id,
        method: singleMethod,
        amountPaise: finalTotalPaise,
        label: "Single Payer Settlement",
      });
    } else if (settlementMode === "EVEN") {
      paymentPayload = evenShares.map((share, idx) => ({
        customerId: customer?.id,
        method: evenPlayerMethods[idx] || "UPI",
        amountPaise: share,
        label: `Player ${idx + 1} Share (Even Split)`,
      }));
    } else if (settlementMode === "LOSER_PAYS") {
      paymentPayload = loserShares.map((p) => ({
        customerId: customer?.id,
        method: loserPlayerMethods[p.playerId] || "UPI",
        amountPaise: p.sharePaise,
        label: `${p.playerName} Share (Loser Pays)`,
      }));
    } else if (settlementMode === "CORPORATE") {
      paymentPayload.push({
        customerId: customer?.id,
        method: "CREDIT",
        amountPaise: finalTotalPaise,
        label: "Corporate Credit Account Khata",
      });
    }

    try {
      const res = await fetch(`/api/admin/checkout/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          splitMode: settlementMode,
          manualDiscountPaise: effectiveManualDiscountPaise,
          discountReason: manualDiscountReason,
          payments: paymentPayload,
          totals: {
            ...totals,
            taxPaise: totals.taxPaise ?? totals.totalTaxPaise ?? 0,
            totalPaise: finalTotalPaise,
          },
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setSettleError(result.error || "Settlement failed");
      } else {
        setSettledBill(result.bill);
      }
    } catch (e) {
      setSettleError("Network error settling folio");
    } finally {
      setIsSettling(false);
    }
  }

  function handlePrintReceipt() {
    window.print();
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Folio Checkout • {session.tableName}
              <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/40">
                {session.billingMode}
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Timer stopped. Review itemized folio, select settlement mode, and complete payments.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Grand Total</span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {formatINR(finalTotalPaise)}
          </span>
        </div>
      </div>

      {settleError && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{settleError}</span>
        </div>
      )}

      {/* Main Dual-Column Checkout: Left (Folio Details), Right (Settlement & Splits) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Folio Breakdown & Customer Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Customer CRM Credit & Wallet Summary Card */}
          {customer && (
            <Card className="border-border bg-card/80">
              <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                    Customer Account
                  </span>
                  <CardTitle className="text-sm text-white">{customer.name}</CardTitle>
                </div>
                {customer.membership && (
                  <Badge variant="gold" className="text-[10px]">
                    {customer.membership}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-4 text-xs grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-secondary/40 border border-border">
                  <span className="text-muted-foreground block text-[10px]">Wallet Balance</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatINR(customer.walletBalance)}
                  </span>
                </div>
                <div className="p-2 rounded bg-secondary/40 border border-border">
                  <span className="text-muted-foreground block text-[10px]">Credit Owed (Khata)</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {formatINR(customer.creditBalance)}
                  </span>
                  <span className="text-[9px] text-muted-foreground block">
                    Limit: {formatINR(customer.creditLimit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Itemized Folio Breakdown Card */}
          <Card className="border-border bg-card/90">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-semibold text-white">
                Itemized Folio Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {/* Table Time Lines */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Table Time ({timeCharge.billableMinutes} billable mins)
                </span>
                {timeCharge.breakdown.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-muted-foreground">
                    <span>
                      {item.label} ({item.minutes}m @ {formatINR(item.ratePerHour)}/hr)
                    </span>
                    <span className="text-white font-medium">
                      {formatINR(item.amountPaise)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cafe F&B Items */}
              {orderItems.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Cafe Food & Beverages ({orderItems.length} items)
                  </span>
                  {orderItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span>
                        {item.quantity}x {item.name}{" "}
                        {item.assignedToCustomerId && `(${item.assignedToCustomerId})`}
                      </span>
                      <span className="text-white font-medium">
                        {formatINR(item.unitPricePaise * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtotals & Taxes */}
              <div className="space-y-1.5 pt-3 border-t border-border text-muted-foreground">
                <div className="flex justify-between">
                  <span>Gross Subtotal:</span>
                  <span className="text-white">{formatINR(totals.subtotalPaise)}</span>
                </div>

                {membershipDiscount.discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>VIP Membership Discount:</span>
                    <span>-{formatINR(membershipDiscount.discountPaise)}</span>
                  </div>
                )}

                {/* Manual Discount Input (Staff with reason) */}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">Manual Discount (₹):</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={manualDiscountRupees}
                      onChange={(e) => setManualDiscountRupees(e.target.value)}
                      className="h-7 w-24 text-right text-xs"
                    />
                  </div>
                  {parseFloat(manualDiscountRupees) > 0 && (
                    <Input
                      placeholder="Reason for discount (Audit Log)..."
                      value={manualDiscountReason}
                      onChange={(e) => setManualDiscountReason(e.target.value)}
                      className="h-7 text-[10px] mt-1.5"
                    />
                  )}
                </div>

                <div className="flex justify-between pt-1">
                  <span>GST (5%):</span>
                  <span className="text-white">{formatINR(totals.totalTaxPaise)}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-emerald-400 pt-2 border-t border-border">
                  <span>Net Payable:</span>
                  <span>{formatINR(finalTotalPaise)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: 5 Settlement Modes (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="border-border bg-card/90 shadow-xl">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-base text-white">Settlement & Payment Method</CardTitle>
              <CardDescription className="text-xs">
                Select splitting rule or payment rail to complete transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs
                value={settlementMode}
                onValueChange={(val) => setSettlementMode(val as any)}
              >
                {/* 5 Tabs */}
                <TabsList className="grid grid-cols-5 w-full h-11">
                  <TabsTrigger value="SINGLE" className="text-[11px]">
                    Single
                  </TabsTrigger>
                  <TabsTrigger value="EVEN" className="text-[11px]">
                    Split Even
                  </TabsTrigger>
                  <TabsTrigger value="BY_ITEM" className="text-[11px]">
                    By Item
                  </TabsTrigger>
                  <TabsTrigger value="LOSER_PAYS" className="text-[11px]">
                    Loser Pays
                  </TabsTrigger>
                  <TabsTrigger value="CORPORATE" className="text-[11px]">
                    Corporate
                  </TabsTrigger>
                </TabsList>

                {/* MODE 1: SINGLE PAYER */}
                <TabsContent value="SINGLE" className="space-y-4 pt-3 text-xs">
                  <div className="space-y-2">
                    <Label className="text-xs">Select Payment Rail</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { id: "UPI", label: "UPI Instant", icon: QrCode },
                        { id: "CASH", label: "Cash", icon: Banknote },
                        { id: "CARD", label: "Card POS", icon: CreditCard },
                        { id: "WALLET", label: "Wallet", icon: Wallet },
                        { id: "CREDIT", label: "Credit Khata", icon: Award },
                      ].map((m) => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSingleMethod(m.id as any)}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              singleMethod === m.id
                                ? "border-emerald-500 bg-primary/20 text-white font-bold shadow"
                                : "border-border bg-secondary/30 text-muted-foreground hover:text-white"
                            }`}
                          >
                            <Icon className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                            <span className="text-[11px] block">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cash Change Due Calculator */}
                  {singleMethod === "CASH" && (
                    <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-2">
                      <Label className="text-xs">Cash Tendered by Customer (₹)</Label>
                      <Input
                        type="number"
                        placeholder={paiseToRupees(finalTotalPaise).toString()}
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="h-10 text-sm font-mono"
                      />
                      <div className="flex justify-between pt-1 font-semibold text-xs">
                        <span className="text-muted-foreground">Change Due:</span>
                        <span className="text-amber-400 font-bold">
                          {formatINR(changeDuePaise)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* UPI QR Display Preview */}
                  {singleMethod === "UPI" && (
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/20">
                      <div className="p-2 bg-white rounded-lg shadow">
                        <QRCodeSVG
                          value={`upi://pay?pa=cueclub@demo&am=${finalTotalPaise / 100}&cu=INR`}
                          size={90}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-white block">
                          Instant UPI QR Generated
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          Scan with PhonePe, GPay, Paytm, or CRED
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {formatINR(finalTotalPaise)}
                        </span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* MODE 2: SPLIT EVENLY */}
                <TabsContent value="EVEN" className="space-y-4 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Number of Players</Label>
                    <div className="flex gap-1.5">
                      {[2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSplitCount(n)}
                          className={`h-8 w-8 rounded-lg font-bold text-xs border ${
                            splitCount === n
                              ? "bg-primary text-white border-emerald-500"
                              : "border-border text-muted-foreground hover:text-white"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] text-muted-foreground block">
                      Remainder distributed sequentially so shares sum exactly to {formatINR(finalTotalPaise)}.
                    </span>
                    <div className="space-y-2">
                      {evenShares.map((share, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-secondary/30"
                        >
                          <div>
                            <span className="font-semibold text-white block">
                              Player {idx + 1}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono">
                              Share: {formatINR(share)}
                            </span>
                          </div>

                          <select
                            value={evenPlayerMethods[idx] || "UPI"}
                            onChange={(e) =>
                              setEvenPlayerMethods({
                                ...evenPlayerMethods,
                                [idx]: e.target.value,
                              })
                            }
                            className="h-8 rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
                          >
                            <option value="UPI">UPI</option>
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="CREDIT">Khata Credit</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* MODE 3: SPLIT BY ITEM */}
                <TabsContent value="BY_ITEM" className="space-y-3 pt-3 text-xs">
                  <p className="text-muted-foreground text-xs">
                    Each player covers their assigned F&B items, and table time is divided evenly across all players.
                  </p>
                  <div className="space-y-2">
                    {orderItems.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded border border-border bg-secondary/30"
                      >
                        <div>
                          <span className="font-medium text-white">{item.name}</span>
                          <span className="text-[10px] text-emerald-400 block">
                            {formatINR(item.unitPricePaise * item.quantity)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {item.assignedToCustomerId || "Player 1"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* MODE 4: LOSER PAYS */}
                <TabsContent value="LOSER_PAYS" className="space-y-4 pt-3 text-xs">
                  <div className="p-3 rounded-xl border border-amber-500/50 bg-amber-950/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">
                        Loser-Pays Game Settlement Mode
                      </span>
                      <Badge variant="gold">Billiards Classic</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      The designated loser pays 100% of table game time + their own food. Other players pay only for their own food.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Pick the Match Loser</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["player-1", "player-2", "player-3"].map((pid, idx) => (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => setDesignatedLoserId(pid)}
                          className={`p-2.5 rounded-lg border text-center transition-all ${
                            designatedLoserId === pid
                              ? "border-rose-500 bg-rose-950/40 text-rose-300 font-bold shadow"
                              : "border-border bg-secondary/30 text-muted-foreground hover:text-white"
                          }`}
                        >
                          <span className="text-xs block">Player {idx + 1}</span>
                          <span className="text-[10px] block opacity-75">
                            {designatedLoserId === pid ? "👑 The Loser" : "Winner"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Per-Person Breakdown */}
                  <div className="space-y-2 pt-1">
                    {loserShares.map((p) => {
                      const isLoser = p.playerId === designatedLoserId;
                      return (
                        <div
                          key={p.playerId}
                          className={`p-3 rounded-lg border flex items-center justify-between ${
                            isLoser
                              ? "border-rose-600/50 bg-rose-950/20"
                              : "border-border bg-secondary/30"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{p.playerName}</span>
                              {isLoser && (
                                <Badge variant="destructive" className="text-[9px] py-0">
                                  Table Payer
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              Table: {formatINR(p.tableSharePaise)} | Food:{" "}
                              {formatINR(p.foodSharePaise)} | Tax: {formatINR(p.taxSharePaise)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {formatINR(p.sharePaise)}
                            </span>
                            <select
                              value={loserPlayerMethods[p.playerId] || "UPI"}
                              onChange={(e) =>
                                setLoserPlayerMethods({
                                  ...loserPlayerMethods,
                                  [p.playerId]: e.target.value,
                                })
                              }
                              className="h-8 rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
                            >
                              <option value="UPI">UPI</option>
                              <option value="CASH">Cash</option>
                              <option value="CARD">Card</option>
                              <option value="CREDIT">Khata</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* MODE 5: CORPORATE CREDIT KHATA */}
                <TabsContent value="CORPORATE" className="space-y-3 pt-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-2">
                    <span className="font-bold text-white block">
                      Attach Folio to Corporate Credit Ledger
                    </span>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Entire bill of {formatINR(finalTotalPaise)} will be charged to the customer khata account as an outstanding balance to be invoiced or settled at month end.
                    </p>
                    <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/40 text-[11px] text-amber-300">
                      Balance will increase by {formatINR(finalTotalPaise)}. (Subject to credit limit check).
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="p-4 pt-2 border-t border-border flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintReceipt}
                className="w-full sm:w-auto h-11 text-xs gap-1.5"
              >
                <Printer className="h-4 w-4" /> Thermal Print (80mm)
              </Button>

              <Button
                disabled={isSettling}
                onClick={handleSettleBill}
                variant="gold"
                size="sm"
                className="w-full sm:flex-1 h-11 text-sm font-bold gap-2 shadow-lg shadow-amber-950/40"
              >
                {isSettling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Finalizing Settlement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Complete Settlement ({formatINR(finalTotalPaise)})
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Success Dialog with Receipt & WhatsApp Simulation */}
      {settledBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="max-w-md w-full border-emerald-500/50 bg-card text-center text-white shadow-2xl p-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <Badge variant="available">Settlement Successful</Badge>
              <h2 className="text-2xl font-bold text-white mt-1">
                Bill #{settledBill.id.substring(0, 8)}
              </h2>
              <p className="text-xs text-muted-foreground">
                Table reset to AVAILABLE. WhatsApp receipt simulated to customer.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-secondary/30 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Settled:</span>
                <span className="font-bold text-emerald-400">
                  {formatINR(settledBill.totalPaise)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Split Mode:</span>
                <span className="text-white">{settledBill.splitMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill Status:</span>
                <span className="text-emerald-300 font-semibold">{settledBill.status}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintReceipt}
                className="flex-1 text-xs gap-1"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/admin")}
                className="flex-1 text-xs font-semibold"
              >
                Return to Floor
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 80mm Thermal Bill Print Sheet */}
      <div id="printable-receipt" className="hidden">
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>CUECLUB BILL</h2>
          <p style={{ fontSize: "10px", margin: "2px 0" }}>108 Arena Blvd, Cyber Hub</p>
          <p style={{ fontSize: "10px", margin: 0 }}>Table: {session.tableName}</p>
          <p style={{ fontSize: "10px", margin: 0 }}>
            {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
          </p>
        </div>
        <hr style={{ borderTop: "1px dashed black" }} />
        <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ fontWeight: "bold" }}>Table Game Time:</td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatINR(timeCharge.totalPaise)}
              </td>
            </tr>
            {orderItems.map((item: any, i: number) => (
              <tr key={i}>
                <td>{item.quantity}x</td>
                <td>{item.name}</td>
                <td style={{ textAlign: "right" }}>
                  {formatINR(item.unitPricePaise * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr style={{ borderTop: "1px dashed black" }} />
        <div style={{ fontSize: "11px", lineHeight: "1.6" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal:</span>
            <span>{formatINR(totals.subtotalPaise)}</span>
          </div>
          {membershipDiscount.discountPaise > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>VIP Discount:</span>
              <span>-{formatINR(membershipDiscount.discountPaise)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>GST (5%):</span>
            <span>{formatINR(totals.totalTaxPaise)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px" }}>
            <span>TOTAL:</span>
            <span>{formatINR(finalTotalPaise)}</span>
          </div>
        </div>
        <hr style={{ borderTop: "1px dashed black" }} />
        <div style={{ textAlign: "center", fontSize: "10px", marginTop: "4px" }}>
          Thank you for visiting CueClub!
        </div>
      </div>
    </div>
  );
}
