"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { PaymentRecord } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  CreditCard,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  DollarSign,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refundTarget, setRefundTarget] = useState<PaymentRecord | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  const reload = () => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((data) => {
        if (data.payments) setPayments(data.payments);
      })
      .catch(() => {});
  };

  useEffect(() => {
    reload();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = p.id.toLowerCase().includes(q);
      const refMatch = p.provider_ref ? p.provider_ref.toLowerCase().includes(q) : false;
      const bMatch = p.booking_id ? p.booking_id.toLowerCase().includes(q) : false;
      return idMatch || refMatch || bMatch;
    }
    return true;
  });

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget) return;
    setIsRefunding(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin",
        },
        body: JSON.stringify({
          action: "refund",
          paymentId: refundTarget.id,
          amount: refundTarget.amount,
          reason: refundReason.trim() || "Administrative refund approval",
        }),
      });

      if (res.ok) {
        setRefundTarget(null);
        setRefundReason("");
        reload();
      }
    } catch {
      // ignore
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <CreditCard className="w-3.5 h-3.5" />
                Financial Audit & Reconciliation
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Transaction Ledger & Refunds
              </h1>
            </div>

            <div className="text-xs text-mist font-semibold">
              Total Recorded Transactions: <strong className="text-cream">{filteredPayments.length}</strong>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-midnight-card p-4 rounded-2xl border border-midnight-line flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transaction ID, booking, or provider ref..."
                className="w-full bg-midnight border border-midnight-line rounded-xl pl-9 pr-4 py-2 text-xs text-cream placeholder-mist/40 focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
              <Search className="w-4 h-4 text-mist absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              >
                <option value="all">All Payment States</option>
                <option value="paid">Paid (Settled)</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Tx ID</th>
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-4">Channel / Mode</th>
                    <th className="py-3.5 px-4">Amount (INR)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-14 px-4 text-mist">
                        <div className="max-w-xs mx-auto space-y-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-mist">
                            <CreditCard className="w-5 h-5 text-bronze-glow" />
                          </div>
                          <div>
                            <div className="font-semibold text-cream text-sm">No Transactions Found</div>
                            <p className="text-xs text-mist mt-0.5">
                              {searchQuery || statusFilter !== "all"
                                ? "No payments match your active filter criteria."
                                : "No transaction records found in the system."}
                            </p>
                          </div>
                          {(searchQuery || statusFilter !== "all") && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bronze/20 border border-bronze/40 text-xs font-semibold text-bronze-glow hover:bg-bronze/30 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reset Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-cream">
                          {p.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-mist">
                          {p.provider_ref || p.booking_id || "POS Direct"}
                        </td>
                        <td className="py-3.5 px-4 font-bold uppercase tracking-wider text-bronze-glow">
                          {p.method}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-baize-light text-sm">
                          ₹{p.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.status === "paid"
                                ? "bg-baize/20 text-baize-light border border-baize/30"
                                : p.status === "refunded"
                                ? "bg-cue-light/20 text-cue-light border border-cue-light/30"
                                : "bg-amber/20 text-amber border border-amber/30"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-mist">
                          {new Date(p.created_at).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {p.status === "paid" && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setRefundTarget(p);
                                setRefundReason("");
                              }}
                              className="text-[11px] font-bold"
                            >
                              Authorize Refund
                            </Button>
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

      {/* Refund Modal */}
      <Modal
        isOpen={!!refundTarget}
        onClose={() => setRefundTarget(null)}
        title="Authorize Customer Refund"
      >
        {refundTarget && (
          <form onSubmit={handleProcessRefund} className="space-y-4 text-left">
            <div className="p-3 bg-midnight-card border border-midnight-line rounded-xl text-xs space-y-1">
              <div>Transaction ID: <span className="font-mono text-cream">{refundTarget.id}</span></div>
              <div>Refund Amount: <span className="font-mono font-bold text-cue-light text-base">₹{refundTarget.amount}</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Mandatory Audit Refund Reason:
              </label>
              <input
                type="text"
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation outside window"
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" size="sm" type="button" onClick={() => setRefundTarget(null)}>
                Dismiss
              </Button>
              <Button variant="danger" size="sm" type="submit" disabled={isRefunding} className="font-bold">
                {isRefunding ? "Processing..." : "Confirm & Execute Refund"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
