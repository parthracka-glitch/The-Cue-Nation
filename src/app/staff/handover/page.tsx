"use client";

import React, { useState, useEffect } from "react";
import { StaffNav } from "@/components/staff/StaffNav";
import { venueStore } from "@/lib/store/venueStore";
import { ShiftHandover, Session, Bill } from "@/types/database";
import {
  Users,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  RefreshCw,
  Send,
  ArrowRightLeft,
  Calendar,
} from "lucide-react";
import clsx from "clsx";

export default function StaffShiftHandoverPage() {
  const [handovers, setHandovers] = useState<ShiftHandover[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [outgoingStaff, setOutgoingStaff] = useState("");
  const [cashDeclared, setCashDeclared] = useState<number>(0);
  const [operationalNotes, setOperationalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Acknowledging modal/action
  const [incomingStaffName, setIncomingStaffName] = useState("");
  const [selectedHandoverId, setSelectedHandoverId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    const allHandovers = venueStore.getShiftHandovers();
    const sessions = venueStore.getSessions().filter((s) => !s.ended_at);
    const bills = venueStore.getBills().filter((b) => !b.paid);

    setHandovers(
      [...allHandovers].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    );
    setActiveSessions(sessions);
    setUnpaidBills(bills);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    try {
      const user = localStorage.getItem("cn_staff_user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed.name) setOutgoingStaff(parsed.name);
      }
    } catch {
      // ignore
    }
  }, []);

  const today = new Date().toISOString().split("T")[0]!;
  const closingSummary = venueStore.computeDailyClosingSummary(today);
  const expectedCash = closingSummary.expectedCash;
  const cashVariance = cashDeclared - expectedCash;

  const handleSubmitHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outgoingStaff.trim()) {
      alert("Please enter the outgoing staff member's name.");
      return;
    }

    setSubmitting(true);
    try {
      const record = venueStore.submitShiftHandover({
        outgoingStaffId: "staff-curr",
        outgoingStaffName: outgoingStaff.trim(),
        cashDrawerActual: Number(cashDeclared) || 0,
        operationalNotes: operationalNotes.trim(),
      });

      setSuccessMessage(`Shift handover #${record.id} logged successfully!`);
      setOperationalNotes("");
      loadData();
    } catch (err) {
      alert("Failed to submit shift handover: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = (handoverId: string) => {
    if (!incomingStaffName.trim()) {
      alert("Please enter incoming staff member's name to acknowledge.");
      return;
    }

    try {
      venueStore.acknowledgeShiftHandover(handoverId, "staff-in", incomingStaffName.trim());
      setSelectedHandoverId(null);
      setIncomingStaffName("");
      loadData();
    } catch (err) {
      alert("Failed to acknowledge: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-brass text-xs font-bold uppercase tracking-wider">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Operations & Integrity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-cream mt-1">
              Staff Shift Handover
            </h1>
            <p className="text-xs sm:text-sm text-mist">
              Ensure flawless accountability between outgoing and incoming duty shifts.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-cream transition"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} />
            <span>Refresh State</span>
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-forest/20 border border-forest/40 text-emerald-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-xs text-mist hover:text-cream underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Current Floor Snapshot for Outgoing Staff */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-midnight-card border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-mist uppercase font-semibold">Active Sessions on Floor</p>
              <p className="text-2xl font-bold text-cream mt-1">{activeSessions.length} Tables Active</p>
              <p className="text-[11px] text-brass mt-0.5">Ensure timers are transferred</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brass/10 border border-brass/20 flex items-center justify-center text-brass">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-midnight-card border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-mist uppercase font-semibold">Unsettled / Open Bills</p>
              <p className="text-2xl font-bold text-cream mt-1">{unpaidBills.length} Pending</p>
              <p className="text-[11px] text-amber-400 mt-0.5">Flag to incoming staff</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-midnight-card border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-mist uppercase font-semibold">Calculated Drawer Cash (Today)</p>
              <p className="text-2xl font-bold text-cream mt-1">₹{expectedCash.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-mist mt-0.5">Physical cash collected</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Two Column Layout: New Handover Form + Recent Handover History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Handover Form */}
          <div className="lg:col-span-5 bg-midnight-card border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-brass border-b border-white/10 pb-3">
              <FileText className="w-4 h-4" />
              <h2 className="text-base font-bold text-cream">Submit Outgoing Shift Handover</h2>
            </div>

            <form onSubmit={handleSubmitHandover} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mist uppercase mb-1">
                  Outgoing Staff Name *
                </label>
                <input
                  type="text"
                  required
                  value={outgoingStaff}
                  onChange={(e) => setOutgoingStaff(e.target.value)}
                  placeholder="e.g., Parth R. (Shift Lead)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-cream text-sm focus:outline-none focus:border-brass"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-mist uppercase">
                    Counted Physical Drawer Cash (₹) *
                  </label>
                  <span className="text-[11px] text-mist">
                    Expected: ₹{expectedCash.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={cashDeclared || ""}
                  onChange={(e) => setCashDeclared(Number(e.target.value))}
                  placeholder="Count all physical cash in drawer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-cream text-sm focus:outline-none focus:border-brass"
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-mist">Cash Variance:</span>
                  <span
                    className={clsx(
                      "font-bold",
                      cashVariance === 0 && "text-emerald-400",
                      cashVariance > 0 && "text-amber-400",
                      cashVariance < 0 && "text-rose-400"
                    )}
                  >
                    {cashVariance === 0
                      ? "₹0 (Balanced)"
                      : cashVariance > 0
                      ? `+₹${cashVariance} (Surplus)`
                      : `-₹${Math.abs(cashVariance)} (Shortage)`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mist uppercase mb-1">
                  Operational Notes & Customer Messages
                </label>
                <textarea
                  rows={4}
                  value={operationalNotes}
                  onChange={(e) => setOperationalNotes(e.target.value)}
                  placeholder="e.g., Table 2 requested 30 min extension at 7 PM. VIP member Rajesh arriving at 8 PM."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-cream text-xs focus:outline-none focus:border-brass resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-brass text-midnight font-bold text-xs uppercase tracking-wider hover:bg-brass/90 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Submitting..." : "Sign & Submit Shift Handover"}</span>
              </button>
            </form>
          </div>

          {/* Handover Logs & History */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-cream">Recent Shift Handover Logs</h2>
              <span className="text-xs text-mist">{handovers.length} records</span>
            </div>

            {handovers.length === 0 ? (
              <div className="p-8 rounded-2xl bg-midnight-card border border-white/10 text-center text-mist text-sm">
                No shift handovers logged yet. Complete the form to initiate the first duty shift record.
              </div>
            ) : (
              <div className="space-y-3">
                {handovers.map((h) => {
                  const isAcknowledged = h.status === "acknowledged";
                  const variance = h.cash_variance;

                  return (
                    <div
                      key={h.id}
                      className={clsx(
                        "p-4 sm:p-5 rounded-2xl border transition-all space-y-3",
                        isAcknowledged
                          ? "bg-midnight-card/80 border-white/10"
                          : "bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/5"
                      )}
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-mist font-mono">
                            {new Date(h.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isAcknowledged ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-forest/30 border border-forest/50 text-emerald-400 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Acknowledged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-bold animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Pending Inbound Acknowledgment
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Staff & Cash Summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-mist block text-[10px] uppercase font-semibold">Outgoing Staff</span>
                          <span className="font-bold text-cream">{h.outgoing_staff_name}</span>
                        </div>
                        <div>
                          <span className="text-mist block text-[10px] uppercase font-semibold">Incoming Staff</span>
                          <span className="font-bold text-cream">
                            {h.incoming_staff_name || "Awaiting Sign-in"}
                          </span>
                        </div>
                        <div>
                          <span className="text-mist block text-[10px] uppercase font-semibold">Drawer Cash</span>
                          <span className="font-mono text-cream font-bold">
                            ₹{h.cash_drawer_actual.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span className="text-mist block text-[10px] uppercase font-semibold">Variance</span>
                          <span
                            className={clsx(
                              "font-mono font-bold",
                              variance === 0 && "text-emerald-400",
                              variance > 0 && "text-amber-400",
                              variance < 0 && "text-rose-400"
                            )}
                          >
                            {variance === 0
                              ? "₹0"
                              : variance > 0
                              ? `+₹${variance}`
                              : `-₹${Math.abs(variance)}`}
                          </span>
                        </div>
                      </div>

                      {/* Floor Snapshot */}
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] flex items-center justify-between text-mist">
                        <span>Sessions at handover: {h.completed_sessions_count} logged</span>
                        <span>{h.unpaid_bills_count} open bills transferred</span>
                      </div>

                      {/* Operational Notes */}
                      {h.operational_notes && (
                        <div className="text-xs bg-black/20 p-2.5 rounded-xl border border-white/5">
                          <span className="text-brass font-semibold block text-[10px] uppercase">Notes:</span>
                          <p className="text-cream mt-0.5 whitespace-pre-wrap">{h.operational_notes}</p>
                        </div>
                      )}

                      {/* Action for Incoming Staff */}
                      {!isAcknowledged && (
                        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2 justify-end">
                          {selectedHandoverId === h.id ? (
                            <div className="w-full flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Incoming Staff Name (e.g., Karan S.)"
                                value={incomingStaffName}
                                onChange={(e) => setIncomingStaffName(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-xl bg-midnight border border-white/20 text-cream text-xs focus:outline-none focus:border-brass"
                              />
                              <button
                                onClick={() => handleAcknowledge(h.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-midnight font-bold text-xs transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setSelectedHandoverId(null)}
                                className="px-2 py-1.5 text-xs text-mist hover:text-cream"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedHandoverId(h.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Acknowledge as Incoming Staff</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
