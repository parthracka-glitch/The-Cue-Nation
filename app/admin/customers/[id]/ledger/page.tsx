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
import { formatINR, rupeesToPaise } from "@/lib/money";
import {
  ArrowLeft,
  CreditCard,
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CustomerLedgerPage() {
  const params = useParams();
  const customerId = params.id as string;

  const { data, mutate, isLoading } = useSWR(
    `/api/admin/customers/${customerId}/ledger`,
    fetcher
  );

  const [repayAmount, setRepayAmount] = useState("");
  const [repayMethod, setRepayMethod] = useState("UPI");
  const [repayNote, setRepayNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
        Loading customer ledger...
      </div>
    );
  }

  if (data?.error || !data?.id) {
    return (
      <div className="p-8 rounded-xl border border-destructive/40 bg-destructive/10 text-center max-w-lg mx-auto my-16">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg">Customer Not Found</h3>
        <p className="text-sm text-muted-foreground mt-2">{data?.error || "Customer ledger could not be retrieved."}</p>
        <Link href="/admin/customers">
          <Button variant="outline" className="mt-4">
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  async function handleRepayment(e: React.FormEvent) {
    e.preventDefault();
    const paise = rupeesToPaise(parseFloat(repayAmount));
    if (!paise || paise <= 0) return;
    setSubmitting(true);

    try {
      await fetch(`/api/admin/customers/${customerId}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REPAYMENT",
          amountPaise: paise,
          method: repayMethod,
          note: repayNote,
        }),
      });
      setRepayAmount("");
      setRepayNote("");
      mutate();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendReminder() {
    try {
      await fetch(`/api/admin/customers/${customerId}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_REMINDER" }),
      });
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Khata Ledger • {data.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Phone: {data.phone} | Credit Limit: {formatINR(data.creditLimit)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Outstanding Balance</span>
          <span className="text-2xl font-black text-amber-400">
            {formatINR(data.creditBalance)}
          </span>
        </div>
      </div>

      {reminderSent && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-300 font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Payment reminder written to simulated WhatsApp notification log!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Record Repayment Form (1 col) */}
        <div>
          <Card className="border-border bg-card/90 sticky top-20">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-semibold text-white">
                Record Repayment
              </CardTitle>
              <CardDescription className="text-[11px]">
                Collect cash or UPI payment to reduce outstanding khata
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleRepayment} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <Label className="text-xs">Amount (₹) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Payment Method</Label>
                  <select
                    value={repayMethod}
                    onChange={(e) => setRepayMethod(e.target.value)}
                    className="flex h-9 w-full rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Notes</Label>
                  <Input
                    placeholder="Received at desk..."
                    value={repayNote}
                    onChange={(e) => setRepayNote(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 text-xs font-semibold mt-2"
                >
                  {submitting ? "Processing..." : "Record Payment"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendReminder}
                  className="w-full h-9 text-xs text-amber-300 border-amber-600/40 gap-1.5 mt-2"
                >
                  <Send className="h-3.5 w-3.5" /> Send WhatsApp Reminder
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Entries Table (2 cols) */}
        <div className="md:col-span-2">
          <Card className="border-border bg-card/80">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-semibold text-white">
                Ledger Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2.5">
                {data.ledgerEntries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs">
                    No transactions recorded for this customer yet.
                  </div>
                ) : (
                  data.ledgerEntries.map((entry: any) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                            entry.type.includes("GIVEN")
                              ? "bg-rose-950/40 text-rose-400"
                              : "bg-emerald-950/40 text-emerald-400"
                          }`}
                        >
                          {entry.type.includes("GIVEN") ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">
                            {entry.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                            {entry.note ? ` • ${entry.note}` : ""}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          entry.type.includes("GIVEN")
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {formatINR(entry.amountPaise)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
