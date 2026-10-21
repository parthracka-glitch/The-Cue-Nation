"use client";

import React, { useState, useEffect } from "react";
import { StaffNav } from "@/components/staff/StaffNav";
import { venueStore } from "@/lib/store/venueStore";
import { WaitingListEntry, GameTable } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatTimeIST } from "@/lib/time";
import { normalizeWhatsAppNumber } from "@/lib/billing/whatsappHelper";
import Link from "next/link";
import clsx from "clsx";
import {
  Users,
  Clock,
  UserPlus,
  CheckCircle2,
  BellRing,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Phone,
  Flame,
  Layers,
} from "lucide-react";

export default function WaitingListPage() {
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [poolWaitMins, setPoolWaitMins] = useState(0);
  const [snookerWaitMins, setSnookerWaitMins] = useState(0);

  // New entry modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discipline, setDiscipline] = useState<"pool" | "snooker">("pool");
  const [partySize, setPartySize] = useState(2);
  const [durationMins, setDurationMins] = useState(60);
  const [notes, setNotes] = useState("");

  // Seating modal
  const [seatingEntry, setSeatingEntry] = useState<WaitingListEntry | null>(null);
  const [seatTableId, setSeatTableId] = useState("");

  const reload = () => {
    setWaitingList(venueStore.getWaitingList());
    setTables(venueStore.getTables());
    setPoolWaitMins(venueStore.getEstimatedWaitMinutes("pool"));
    setSnookerWaitMins(venueStore.getEstimatedWaitMinutes("snooker"));
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    venueStore.addToWaitingList({
      customerName,
      customerPhone,
      discipline,
      partySize,
      preferredDuration: durationMins,
      notes,
    });

    setIsAddModalOpen(false);
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
  };

  const handleNotify = (entry: WaitingListEntry) => {
    venueStore.updateWaitingListStatus(entry.id, "notified");
    const norm = normalizeWhatsAppNumber(entry.customer_phone);
    if (norm.isValid) {
      const msg = encodeURIComponent(
        `Hello ${entry.customer_name},\n\nGreat news! Your ${entry.discipline === "snooker" ? "Snooker" : "Pool"} table is ready at Cue Nation.\n\nPlease proceed to the reception concierge within 10 minutes to commence your session.\n\nCue Nation Parlour & Lounge`
      );
      window.open(`https://wa.me/${norm.normalizedNumber}?text=${msg}`, "_blank");
    }
  };

  const handleConfirmSeat = () => {
    if (!seatingEntry || !seatTableId) return;

    // Start walk-in booking and session on selected table
    const targetTable = tables.find((t) => t.id === seatTableId);
    if (!targetTable) return;

    const rate = targetTable.type === "snooker" ? 450 : 300;
    const amount = Math.round((seatingEntry.preferred_duration / 60) * rate);
    const now = new Date();
    const end = new Date(now.getTime() + seatingEntry.preferred_duration * 60000);

    const { booking, pin } = venueStore.createBooking({
      tableId: targetTable.id,
      startISO: now.toISOString(),
      endISO: end.toISOString(),
      guestName: seatingEntry.customer_name,
      guestPhone: seatingEntry.customer_phone,
      amount,
      source: "offline",
    });

    venueStore.startSessionWithPin(booking.booking_code, pin);
    venueStore.updateWaitingListStatus(seatingEntry.id, "seated", targetTable.id);
    setSeatingEntry(null);
    setSeatTableId("");
  };

  const handleCancel = (id: string) => {
    if (confirm("Cancel this waiting list entry?")) {
      venueStore.updateWaitingListStatus(id, "cancelled");
    }
  };

  const activeWaiting = waitingList.filter((w) => w.status === "waiting" || w.status === "notified");
  const seatedOrDone = waitingList.filter((w) => w.status === "seated" || w.status === "cancelled");

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
                  <Users className="w-3.5 h-3.5" />
                  Walk-In Queue Engine
                </div>
                <h1 className="font-display text-3xl font-bold text-cream mt-0.5">
                  Live Waiting List & Wait Times
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary-dark"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2 font-bold text-xs bg-baize hover:bg-baize-light text-cream shadow-sm"
              >
                <UserPlus className="w-4 h-4" /> Add to Queue
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={reload}
                className="text-mist hover:text-cream border border-midnight-line p-2"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dynamic Estimated Wait Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pool Wait Card */}
            <div className="bg-midnight-card border border-midnight-line rounded-2xl p-5 shadow-card flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs uppercase font-bold text-mist tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Pool Tables (3 Tables)
                </div>
                <div className="font-display text-3xl font-black text-cream">
                  {poolWaitMins === 0 ? "Immediate Table" : `~${poolWaitMins} mins wait`}
                </div>
                <div className="text-xs text-mist">
                  {poolWaitMins === 0
                    ? "At least 1 Pool table is free right now"
                    : "Estimated until next match concludes"}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-baize-light/10 border border-baize-light/30 flex items-center justify-center text-baize-light">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            {/* Snooker Wait Card */}
            <div className="bg-midnight-card border border-midnight-line rounded-2xl p-5 shadow-card flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs uppercase font-bold text-mist tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber" />
                  Snooker Tables (3 Tables)
                </div>
                <div className="font-display text-3xl font-black text-cream">
                  {snookerWaitMins === 0 ? "Immediate Table" : `~${snookerWaitMins} mins wait`}
                </div>
                <div className="text-xs text-mist">
                  {snookerWaitMins === 0
                    ? "At least 1 Snooker table is free right now"
                    : "Estimated until next frame concludes"}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber/10 border border-amber/30 flex items-center justify-center text-amber">
                <Flame className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Active Waiting Queue Table */}
          <div className="bg-midnight-card rounded-2xl border border-midnight-line overflow-hidden shadow-card">
            <div className="p-4 border-b border-midnight-line flex items-center justify-between">
              <div className="text-sm font-bold text-cream flex items-center gap-2">
                <Clock className="w-4 h-4 text-bronze-glow" />
                Active Queue ({activeWaiting.length} Cueists Waiting)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-mist">
                <thead className="bg-midnight text-xs uppercase font-bold text-mist border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Discipline</th>
                    <th className="py-3.5 px-6">Party Size</th>
                    <th className="py-3.5 px-6">Wait Est.</th>
                    <th className="py-3.5 px-6">Joined At</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line">
                  {activeWaiting.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-mist">
                        No customers currently on the waiting list. All walk-ins can be seated immediately!
                      </td>
                    </tr>
                  ) : (
                    activeWaiting.map((entry) => (
                      <tr key={entry.id} className="hover:bg-midnight/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-cream">{entry.customer_name}</div>
                          <div className="text-xs text-mist flex items-center gap-1">
                            <Phone className="w-3 h-3 text-bronze-glow" />
                            {entry.customer_phone}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={clsx(
                              "inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase",
                              entry.discipline === "snooker"
                                ? "bg-amber/15 text-amber border border-amber/30"
                                : "bg-baize-light/15 text-baize-light border border-baize-light/30"
                            )}
                          >
                            {entry.discipline}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-cream font-mono">
                          {entry.party_size} {entry.party_size === 1 ? "player" : "players"}
                        </td>

                        <td className="py-4 px-6 text-bronze-glow font-bold font-mono">
                          ~{entry.estimated_wait_minutes || 15}m
                        </td>

                        <td className="py-4 px-6 text-mist font-mono text-xs">
                          {formatTimeIST(new Date(entry.created_at))}
                        </td>

                        <td className="py-4 px-6">
                          {entry.status === "notified" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-bronze-glow/20 text-bronze-glow border border-bronze-glow/40 animate-pulse">
                              <BellRing className="w-3.5 h-3.5" /> Notified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-mist border border-white/10">
                              <Clock className="w-3.5 h-3.5 text-amber" /> In Queue
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                          <Button
                            variant="primary-dark"
                            size="sm"
                            onClick={() => {
                              setSeatingEntry(entry);
                              // Auto-pick first available table of this discipline
                              const free = tables.find(
                                (t) => t.type === entry.discipline && t.status === "free" && t.active
                              );
                              if (free) setSeatTableId(free.id);
                            }}
                            className="text-xs font-bold gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Seat Now
                          </Button>

                          <Button
                            variant="secondary-dark"
                            size="sm"
                            onClick={() => handleNotify(entry)}
                            className="text-xs gap-1 border-midnight-line"
                            title="Send WhatsApp Ready Alert"
                          >
                            <BellRing className="w-3.5 h-3.5 text-bronze-glow" /> Notify
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(entry.id)}
                            className="text-xs text-mist hover:text-cue-light p-2"
                            title="Drop from Queue"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADD TO WAITING LIST MODAL */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Add Customer to Waiting List"
            description="Record guest details to calculate estimated wait and notify them when a table frees up."
            isDark
          >
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-mist uppercase tracking-wider">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varun Reddy"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 text-sm text-cream focus:border-bronze-glow focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-mist uppercase tracking-wider">
                  WhatsApp Contact Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 text-sm text-cream focus:border-bronze-glow focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-mist uppercase tracking-wider">
                    Game Discipline
                  </label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value as any)}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2.5 text-sm text-cream focus:border-bronze-glow focus:outline-none"
                  >
                    <option value="pool">9ft Match Pool</option>
                    <option value="snooker">12ft Tournament Snooker</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-mist uppercase tracking-wider">
                    Party Size
                  </label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2.5 text-sm text-cream focus:border-bronze-glow focus:outline-none"
                  >
                    <option value={1}>1 Player (Solo practice)</option>
                    <option value={2}>2 Players (Singles)</option>
                    <option value={4}>4 Players (Doubles)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-mist uppercase tracking-wider">
                  Requested Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[60, 90, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMins(m)}
                      className={clsx(
                        "py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        durationMins === m
                          ? "bg-bronze-glow text-midnight border-bronze-glow shadow-sm"
                          : "bg-midnight border-midnight-line text-mist hover:text-cream"
                      )}
                    >
                      {m} mins
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <Button variant="primary-dark" size="md" type="submit" className="w-full font-bold text-xs">
                  Save to Queue
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-mist"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>

          {/* SEAT CUSTOMER MODAL */}
          <Modal
            isOpen={!!seatingEntry}
            onClose={() => setSeatingEntry(null)}
            title={`Seat ${seatingEntry?.customer_name}`}
            description={`Allocate a physical ${seatingEntry?.discipline.toUpperCase()} table to commence session clock.`}
            isDark
          >
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-mist uppercase tracking-wider">
                  Select Physical Table
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {tables
                    .filter((t) => t.type === seatingEntry?.discipline && t.active)
                    .map((t) => {
                      const isFree = t.status === "free";
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSeatTableId(t.id)}
                          className={clsx(
                            "p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer",
                            seatTableId === t.id
                              ? "bg-bronze-glow/15 border-bronze-glow text-cream font-bold"
                              : "bg-midnight border-midnight-line text-mist hover:text-cream"
                          )}
                        >
                          <div>
                            <div className="text-sm font-bold text-cream">{t.name}</div>
                            <div className="text-xs text-mist">
                              Rate: ₹{t.hourly_rate}/hr · Status:{" "}
                              <span
                                className={clsx(
                                  "font-bold uppercase",
                                  isFree ? "text-baize-light" : "text-amber"
                                )}
                              >
                                {t.status}
                              </span>
                            </div>
                          </div>
                          {seatTableId === t.id && <CheckCircle2 className="w-5 h-5 text-bronze-glow" />}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  variant="primary-dark"
                  size="md"
                  onClick={handleConfirmSeat}
                  disabled={!seatTableId}
                  className="w-full font-bold text-xs bg-baize hover:bg-baize-light text-cream shadow-sm"
                >
                  Confirm Table & Start Timer
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setSeatingEntry(null)}
                  className="text-mist"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
