"use client";

import React, { useState, useEffect } from "react";
import { StaffNav } from "@/components/staff/StaffNav";
import { venueStore } from "@/lib/store/venueStore";
import { DailyClosing, Bill } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { formatDateTimeIST } from "@/lib/time";
import Link from "next/link";
import clsx from "clsx";
import {
  Receipt,
  Banknote,
  QrCode,
  CreditCard,
  Globe,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function DailyClosingPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]!);
  const [actualCashInput, setActualCashInput] = useState<string>("");
  const [closingNotes, setClosingNotes] = useState("");
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  const [summary, setSummary] = useState(() => venueStore.computeDailyClosingSummary(selectedDate));
  const [submitSuccess, setSubmitSuccess] = useState("");

  const reload = () => {
    setClosings(venueStore.getDailyClosings());
    setSummary(venueStore.computeDailyClosingSummary(selectedDate));
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, [selectedDate]);

  const actualCash = Number(actualCashInput) || 0;
  const cashVariance = actualCash - summary.expectedCash;

  const handleSubmitClosing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualCashInput) {
      alert("Please enter the actual cash counted in the drawer.");
      return;
    }

    const record = venueStore.submitDailyClosing({
      closedById: "STAFF-FLOOR",
      closedByName: "Floor Concierge",
      actualCash,
      closingNotes,
      dateStr: selectedDate,
    });

    setSubmitSuccess(`✅ Daily closing for ${selectedDate} submitted successfully! Record #${record.id}`);
    setActualCashInput("");
    setClosingNotes("");
    reload();
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-midnight-line">
            <div className="flex items-center gap-3">
              <Link href="/staff">
                <Button variant="ghost" size="sm" className="text-mist hover:text-cream border border-midnight-line">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Floor
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                  <Calculator className="w-3.5 h-3.5" />
                  Financial Settlement Engine
                </div>
                <h1 className="font-display text-3xl font-bold text-cream mt-0.5">
                  Daily Closing & Cash Reconciliation
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-midnight border border-midnight-line rounded-xl px-3 py-1.5 text-xs text-cream font-mono focus:outline-none focus:border-bronze-glow"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={reload}
                className="text-mist hover:text-cream border border-midnight-line p-2"
                title="Refresh Summary"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Success Notification */}
          {submitSuccess && (
            <div className="bg-baize-light/15 border border-baize-light/40 rounded-2xl p-4 text-xs text-cream flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-baize-light">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {submitSuccess}
              </div>
              <button onClick={() => setSubmitSuccess("")} className="text-mist hover:text-cream">
                Dismiss
              </button>
            </div>
          )}

          {/* 4-Card Revenue & Collections Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-midnight-card border border-midnight-line rounded-2xl p-5 shadow-card space-y-2">
              <div className="text-xs text-mist uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Total Billable</span>
                <Receipt className="w-4 h-4 text-bronze-glow" />
              </div>
              <div className="font-display text-2xl font-black text-cream">
                ₹{summary.totalRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-mist">{summary.totalSessions} Sessions concluded</div>
            </div>

            {/* Cash Collected */}
            <div className="bg-midnight-card border border-midnight-line rounded-2xl p-5 shadow-card space-y-2">
              <div className="text-xs text-mist uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Cash in Register</span>
                <Banknote className="w-4 h-4 text-baize-light" />
              </div>
              <div className="font-display text-2xl font-black text-baize-light font-mono">
                ₹{summary.cashCollected.toFixed(2)}
              </div>
              <div className="text-[11px] text-mist">Expected physical bills</div>
            </div>

            {/* UPI & Digital Collections */}
            <div className="bg-midnight-card border border-midnight-line rounded-2xl p-5 shadow-card space-y-2">
              <div className="text-xs text-mist uppercase font-bold tracking-wider flex items-center justify-between">
                <span>UPI / QR & Cards</span>
                <QrCode className="w-4 h-4 text-sky-400" />
              </div>
              <div className="font-display text-2xl font-black text-sky-400 font-mono">
                ₹{(summary.upiCollected + summary.cardCollected).toFixed(2)}
              </div>
              <div className="text-[11px] text-mist">
                UPI: ₹{summary.upiCollected.toFixed(2)} · Card: ₹{summary.cardCollected.toFixed(2)}
              </div>
            </div>

            {/* Outstanding Balance */}
            <div className="bg-midnight-card border border-midnight-line rounded-2xl p-5 shadow-card space-y-2">
              <div className="text-xs text-mist uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Unsettled Due</span>
                <Clock className="w-4 h-4 text-amber" />
              </div>
              <div className="font-display text-2xl font-black text-amber font-mono">
                ₹{summary.outstandingBalance.toFixed(2)}
              </div>
              <div className="text-[11px] text-mist">Pending customer payments</div>
            </div>
          </div>

          {/* Cash Drawer Counting & Closing Submission Form */}
          <div className="bg-midnight-card border-2 border-bronze-glow/30 rounded-2xl p-6 shadow-card space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                <Calculator className="w-5 h-5 text-bronze-glow" />
                Physical Cash Drawer Reconciliation
              </h2>
              <p className="text-xs text-mist mt-1">
                Count the physical rupee currency notes in the cash drawer at end of day and record the actual count. The system will automatically compute any surplus or shortage variance.
              </p>
            </div>

            <form onSubmit={handleSubmitClosing} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Expected Cash Card */}
                <div className="bg-midnight p-4 rounded-xl border border-midnight-line space-y-1">
                  <span className="text-xs text-mist font-bold uppercase tracking-wider">
                    Calculated Expected Cash
                  </span>
                  <div className="text-2xl font-mono font-bold text-baize-light">
                    ₹{summary.expectedCash.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-mist block">Derived from settled Cash bills</span>
                </div>

                {/* Actual Counted Input */}
                <div className="space-y-1">
                  <label className="text-xs text-mist font-bold uppercase tracking-wider block">
                    Actual Cash Counted (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Enter counted cash in drawer"
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-3 text-lg font-mono text-cream focus:border-bronze-glow focus:outline-none"
                  />
                </div>

                {/* Variance Display */}
                <div
                  className={clsx(
                    "p-4 rounded-xl border flex flex-col justify-between",
                    actualCashInput === ""
                      ? "bg-midnight border-midnight-line text-mist"
                      : cashVariance === 0
                      ? "bg-baize-light/10 border-baize-light/40 text-baize-light"
                      : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                  )}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">Cash Variance</span>
                  <div className="text-2xl font-mono font-black">
                    {actualCashInput === "" ? "—" : `₹${cashVariance.toFixed(2)}`}
                  </div>
                  <span className="text-[10px]">
                    {actualCashInput === ""
                      ? "Awaiting count"
                      : cashVariance === 0
                      ? "Exact Balance (No discrepancy)"
                      : cashVariance > 0
                      ? `Surplus of ₹${cashVariance.toFixed(2)}`
                      : `Shortage of ₹${Math.abs(cashVariance).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-mist font-bold uppercase tracking-wider block">
                  Staff Shift & Reconciliation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Record any cash discrepancies, customer refunds, or drawer handover details..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 text-xs text-cream focus:border-bronze-glow focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-mist">
                  Submitting will create an immutable audit record for management review.
                </div>
                <Button
                  variant="primary-dark"
                  size="md"
                  type="submit"
                  className="font-bold text-xs bg-baize hover:bg-baize-light text-cream shadow-sm px-6"
                >
                  Submit Daily Closing Report
                </Button>
              </div>
            </form>
          </div>

          {/* Historical Closing Reports Table */}
          <div className="bg-midnight-card rounded-2xl border border-midnight-line overflow-hidden shadow-card">
            <div className="p-4 border-b border-midnight-line flex items-center justify-between">
              <div className="text-sm font-bold text-cream flex items-center gap-2">
                <FileText className="w-4 h-4 text-bronze-glow" />
                Submitted Daily Closing History ({closings.length} Reports)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-mist">
                <thead className="bg-midnight text-xs uppercase font-bold text-mist border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-6">Closing Date</th>
                    <th className="py-3.5 px-6">Closed By</th>
                    <th className="py-3.5 px-6">Total Revenue</th>
                    <th className="py-3.5 px-6">Expected Cash</th>
                    <th className="py-3.5 px-6">Actual Cash</th>
                    <th className="py-3.5 px-6">Variance</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line">
                  {closings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-mist">
                        No previous daily closing reports submitted yet.
                      </td>
                    </tr>
                  ) : (
                    closings.map((c) => (
                      <tr key={c.id} className="hover:bg-midnight/40 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-cream">
                          {c.closing_date}
                        </td>
                        <td className="py-4 px-6 text-cream">
                          {c.closed_by_name}
                        </td>
                        <td className="py-4 px-6 font-mono font-semibold text-cream">
                          ₹{c.total_revenue.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 font-mono text-mist">
                          ₹{c.expected_cash.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-cream">
                          ₹{c.actual_cash.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold">
                          <span className={c.cash_variance === 0 ? "text-baize-light" : "text-rose-400"}>
                            {c.cash_variance > 0 ? "+" : ""}₹{c.cash_variance.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {c.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-baize-light/15 text-baize-light border border-baize-light/30">
                              <ShieldCheck className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : c.status === "discrepancy" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3.5 h-3.5" /> Discrepancy
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-mist border border-white/10">
                              <Clock className="w-3.5 h-3.5 text-amber" /> Submitted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
