"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { venueStore } from "@/lib/store/venueStore";
import { DailyClosing } from "@/types/database";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import clsx from "clsx";
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
  CheckCircle2,
  Banknote,
  Receipt,
  UserCheck,
} from "lucide-react";

export default function AdminClosingPage() {
  const [closings, setClosings] = useState<DailyClosing[]>([]);

  const reload = () => {
    setClosings(venueStore.getDailyClosings());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const handleApprove = (id: string) => {
    venueStore.approveDailyClosing(id, "Parth Racka (Owner)");
    reload();
  };

  return (
    <div className="min-h-screen bg-midnight text-cream py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNav />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-bronze-glow">
              Executive Financial Governance
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream mt-0.5">
              Daily Closing Audits & Cash Reconciliation
            </h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={reload}
            className="text-ash border-midnight-line hover:text-cream self-start sm:self-auto gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Audits
          </Button>
        </div>

        {/* Closings Table */}
        <div className="bg-midnight-card rounded-2xl border border-midnight-line overflow-hidden shadow-card">
          <div className="p-4 border-b border-midnight-line flex items-center justify-between">
            <div className="text-sm font-bold text-cream flex items-center gap-2">
              <Calculator className="w-4 h-4 text-bronze-glow" />
              All Submitted Shift Closings ({closings.length} Total)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-mist">
              <thead className="bg-midnight text-xs uppercase font-bold text-mist border-b border-midnight-line">
                <tr>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Staff Member</th>
                  <th className="py-3.5 px-6">Total Billed</th>
                  <th className="py-3.5 px-6">Expected Cash</th>
                  <th className="py-3.5 px-6">Actual Cash</th>
                  <th className="py-3.5 px-6">Variance</th>
                  <th className="py-3.5 px-6">Notes</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-line">
                {closings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-mist">
                      No daily closing reports submitted yet. Staff can submit closing declarations from the Staff Portal.
                    </td>
                  </tr>
                ) : (
                  closings.map((c) => (
                    <tr key={c.id} className="hover:bg-midnight/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-cream">
                        {c.closing_date}
                      </td>
                      <td className="py-4 px-6 text-cream font-medium">
                        {c.closed_by_name}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-cream">
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
                      <td className="py-4 px-6 text-xs text-mist max-w-xs truncate">
                        {c.closing_notes || "—"}
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
                            <Clock className="w-3.5 h-3.5 text-amber" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {c.status !== "approved" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(c.id)}
                            className="text-xs font-bold bg-baize hover:bg-baize-light text-cream gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Approve Audit
                          </Button>
                        ) : (
                          <span className="text-xs text-mist font-mono">
                            Approved by {c.approved_by?.split(" ")[0]}
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
  );
}
