"use client";

import React, { useState, useEffect } from "react";
import { venueStore } from "@/lib/store/venueStore";
import { GameTable, Session, Booking, Order, Bill } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProfessionalBillModal } from "@/components/billing/ProfessionalBillModal";
import { useSessionTimer } from "@/lib/realtime/useSessionTimer";
import Link from "next/link";
import clsx from "clsx";
import {
  Clock,
  Play,
  Plus,
  Square,
  KeyRound,
  UtensilsCrossed,
  Receipt,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Zap,
} from "lucide-react";
import { StaffNav } from "@/components/staff/StaffNav";

// Individual Table Card with Active Timer
function TableFloorCard({
  table,
  session,
  booking,
  ordersCount,
  onOpenPinModal,
  onOpenExtraTime,
  onOpenEndSession,
  onOpenWalkIn,
}: {
  table: GameTable;
  session?: Session;
  booking?: Booking;
  ordersCount: number;
  onOpenPinModal: (table: GameTable) => void;
  onOpenExtraTime: (session: Session) => void;
  onOpenEndSession: (session: Session) => void;
  onOpenWalkIn: (table: GameTable) => void;
}) {
  const isRunning = table.status === "running" && !!session;
  const { formattedElapsed, isOvertime } = useSessionTimer(
    session?.started_at,
    60,
    session?.extra_minutes || 0
  );

  const leftBorderColor = {
    free: "border-l-baize-light",
    booked: "border-l-amber",
    running: "border-l-cream",
    maintenance: "border-l-slate-dark",
  }[table.status];

  return (
    <div
      className={clsx(
        "bg-midnight-card rounded-2xl border border-midnight-line p-5 flex flex-col justify-between transition-all relative overflow-hidden shadow-card border-l-[6px]",
        leftBorderColor,
        isRunning && "ring-1 ring-bronze-glow/30"
      )}
    >
      {/* Top row: Name & Status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-mist">
            {table.type === "snooker" ? "12ft Tournament Snooker" : "9ft Match Pool"}
          </span>
          <h3 className="font-display text-xl font-bold text-cream mt-0.5">
            {table.name}
          </h3>
        </div>
        <StatusBadge status={table.status} isDark />
      </div>

      {/* Middle row: Timer or Table State */}
      <div className="my-6">
        {isRunning ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-mist">
              <span className="flex items-center gap-1.5 text-baize-light font-bold">
                <span className="w-2 h-2 rounded-full bg-baize-light animate-ping" />
                SESSION IN PLAY
              </span>
              {session?.extra_minutes > 0 && (
                <span className="text-amber font-semibold text-[11px]">
                  +{session.extra_minutes}m Extra
                </span>
              )}
            </div>
            <div
              className={clsx(
                "font-mono text-4xl sm:text-5xl font-black tracking-tight tabular-nums mt-1",
                isOvertime ? "text-cue-light animate-pulse" : "text-bronze-glow"
              )}
            >
              {formattedElapsed}
            </div>
            {booking?.guest_name && (
              <div className="text-xs text-mist pt-1">
                Player: <span className="text-cream font-semibold">{booking.guest_name}</span>
                {booking.guest_phone && ` (${booking.guest_phone})`}
              </div>
            )}
          </div>
        ) : table.status === "booked" ? (
          <div className="space-y-1 py-2">
            <div className="text-xs text-amber font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> RESERVED — AWAITING CHECK-IN
            </div>
            <div className="text-lg font-display font-bold text-cream">
              {booking ? booking.guest_name : "Customer Reservation"}
            </div>
            <div className="text-xs text-mist">Show PIN to commence clock</div>
          </div>
        ) : (
          <div className="py-3 space-y-1">
            <div className="text-xs font-semibold text-baize-light uppercase tracking-wider">
              Ready for Play
            </div>
            <div className="text-sm text-mist">Table cleared & vacuumed</div>
          </div>
        )}
      </div>

      {/* Bottom row: Operations Control Buttons */}
      <div className="pt-3 border-t border-midnight-line flex items-center justify-between gap-2">
        {isRunning ? (
          <>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary-dark"
                size="sm"
                onClick={() => onOpenExtraTime(session)}
                className="text-xs gap-1"
                title="Add extra session minutes"
              >
                <Plus className="w-3.5 h-3.5" /> +Time
              </Button>
              <Link href="/staff/kitchen">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-mist hover:text-cream text-xs gap-1 px-2.5 border border-midnight-line"
                >
                  <UtensilsCrossed className="w-3 h-3 text-bronze-glow" />
                  <span>{ordersCount}</span>
                </Button>
              </Link>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => onOpenEndSession(session)}
              className="text-xs gap-1 shadow-sm font-semibold"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> End & Bill
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary-dark"
              size="sm"
              onClick={() => onOpenPinModal(table)}
              className="gap-1.5 text-xs font-bold w-full sm:w-auto"
            >
              <KeyRound className="w-3.5 h-3.5" /> Check-in PIN
            </Button>
            <Button
              variant="secondary-dark"
              size="sm"
              onClick={() => onOpenWalkIn(table)}
              className="gap-1.5 text-xs w-full sm:w-auto"
            >
              <UserPlus className="w-3.5 h-3.5" /> Walk-in
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function StaffFloorPage() {
  const [tables, setTables] = useState<GameTable[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals state
  const [pinModalTable, setPinModalTable] = useState<GameTable | null>(null);
  const [bookingCodeInput, setBookingCodeInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Quick PIN Check-in & Auto-Allocation
  const [quickPinInput, setQuickPinInput] = useState("");
  const [quickPinError, setQuickPinError] = useState("");
  const [allocationSuccess, setAllocationSuccess] = useState("");

  const [extraTimeSession, setExtraTimeSession] = useState<Session | null>(null);
  const [endSessionItem, setEndSessionItem] = useState<Session | null>(null);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [activeBill, setActiveBill] = useState<Bill | null>(null);

  // Walk-in modal state
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInDiscipline, setWalkInDiscipline] = useState<"pool" | "snooker">("pool");
  const [walkInTable, setWalkInTable] = useState<GameTable | null>(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInMinutes, setWalkInMinutes] = useState(60);
  const [walkInError, setWalkInError] = useState("");

  const reloadData = () => {
    setTables(venueStore.getTables());
    setSessions(venueStore.getSessions());
    setBookings(venueStore.getBookings());
    setOrders(venueStore.getOrders());
  };

  useEffect(() => {
    reloadData();
    const unsub = venueStore.subscribe(reloadData);
    return unsub;
  }, []);

  const handleOpenWalkIn = (discipline: "pool" | "snooker" = "pool", table: GameTable | null = null) => {
    setWalkInDiscipline(table ? table.type : discipline);
    setWalkInTable(table);
    setWalkInName("");
    setWalkInPhone("");
    setWalkInMinutes(60);
    setWalkInError("");
    setIsWalkInModalOpen(true);
  };

  // Quick PIN Auto-Allocate Submit
  const handleQuickPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickPinError("");
    setAllocationSuccess("");

    if (!quickPinInput.trim()) {
      setQuickPinError("Please enter the customer's 6-digit PIN");
      return;
    }

    const res = venueStore.checkInWithPinAutoAllocate(quickPinInput.trim());
    if (!res.success) {
      setQuickPinError(res.error || "PIN verification failed");
      return;
    }

    setAllocationSuccess(
      `✅ Verified! Automatically allocated ${res.table?.name} for ${res.booking?.guest_name || "Guest"}. Session timer started.`
    );
    setQuickPinInput("");
  };

  // PIN Check-in Submit
  const handleStartSessionWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    const pinToTry = pinInput.trim() || bookingCodeInput.trim();
    if (!pinToTry) {
      setPinError("Please enter the 6-digit PIN");
      return;
    }

    const res = venueStore.checkInWithPinAutoAllocate(pinToTry);
    if (!res.success) {
      setPinError(res.error || "Verification failed");
      return;
    }

    // Success
    setPinModalTable(null);
    setBookingCodeInput("");
    setPinInput("");
    setPinError("");
  };

  // Add Extra Time
  const handleAddExtraTime = (minutes: number) => {
    if (!extraTimeSession) return;
    const res = venueStore.addExtraTime(extraTimeSession.id, minutes);
    if (res.success) {
      setExtraTimeSession(null);
    }
  };

  // End Session & Generate Bill
  const handleEndSession = () => {
    if (!endSessionItem) return;
    const res = venueStore.endSession(endSessionItem.id);
    if (res.success && res.billId) {
      setEndSessionItem(null);
      const generatedBill = res.bill || venueStore.getBills().find((b) => b.id === res.billId) || null;
      setActiveBill(generatedBill);
      setBillModalOpen(true);
    }
  };

  // Handle Walk-in submission with automated table allocation
  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError("");

    let targetTable: GameTable | undefined = walkInTable || undefined;

    // If no specific table was picked, auto-allocate from the 3 tables of the chosen discipline
    if (!targetTable) {
      const candidates = tables.filter((t) => t.type === walkInDiscipline && t.active);
      targetTable = candidates.find((t) => {
        const hasRunning = sessions.some((s) => s.table_id === t.id && !s.ended_at);
        return t.status === "free" && !hasRunning;
      });
    }

    if (!targetTable) {
      setWalkInError(
        `All 3 ${walkInDiscipline === "snooker" ? "Snooker" : "Pool"} tables are currently occupied. Cannot start walk-in session.`
      );
      return;
    }

    const hourlyRate = targetTable.type === "snooker" ? 450 : 300;
    const amount = Math.round((walkInMinutes / 60) * hourlyRate);

    const now = new Date();
    const end = new Date(now.getTime() + walkInMinutes * 60 * 1000);

    const { booking, pin } = venueStore.createBooking({
      tableId: targetTable.id,
      startISO: now.toISOString(),
      endISO: end.toISOString(),
      guestName: walkInName.trim() || "Walk-in Guest",
      guestPhone: walkInPhone.trim() || "+91 99999 99999",
      amount,
      source: "offline",
    });

    // Auto-start session for walk-in
    venueStore.startSessionWithPin(booking.booking_code, pin);

    // Synchronize with backend API in background
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableId: targetTable.id,
        isWalkIn: true,
      }),
    }).catch(() => {});

    setAllocationSuccess(
      `✅ Walk-in started! Automatically allocated ${targetTable.name} for ${walkInName.trim() || "Walk-in Guest"}. Session timer is running.`
    );

    setIsWalkInModalOpen(false);
    setWalkInTable(null);
    setWalkInName("");
    setWalkInPhone("");
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Floor Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-midnight-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-baize-light animate-ping" />
              <span className="text-xs uppercase tracking-widest font-bold text-mist">
                STAFF LIVE FLOOR · ASIA/KOLKATA
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-cream mt-1">
              Table Matrix & Live Timers
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/staff/kitchen">
              <Button variant="secondary-dark" size="sm" className="gap-2">
                <ChefHat className="w-4 h-4 text-bronze-glow" />
                Kitchen Display System
              </Button>
            </Link>
            <Link href="/staff/billing">
              <Button variant="secondary-dark" size="sm" className="gap-2">
                <Receipt className="w-4 h-4 text-bronze-glow" />
                Combined POS Bills
              </Button>
            </Link>
            <Button
              variant="primary-dark"
              size="sm"
              onClick={() => handleOpenWalkIn("pool", null)}
              className="gap-2 bg-baize hover:bg-baize-light text-cream font-bold shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-cream" />
              Walk-in Booking
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={reloadData}
              className="text-mist hover:text-cream border border-midnight-line"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* FAST PIN CHECK-IN & AUTO ALLOCATION BAR */}
        <div className="bg-midnight-card border-2 border-bronze-glow/40 rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-bronze-glow">
                <KeyRound className="w-4 h-4 text-bronze-glow" />
                Customer Arrival · Fast PIN Check-In & Auto Table Allocation
              </div>
              <p className="text-xs text-mist mt-0.5">
                Customer gives their 6-digit PIN. The system verifies the reservation and automatically allocates an available Pool or Snooker table.
              </p>
            </div>

            <form onSubmit={handleQuickPinSubmit} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN (e.g. 481920)"
                value={quickPinInput}
                onChange={(e) => setQuickPinInput(e.target.value)}
                className="bg-midnight border border-midnight-line rounded-xl px-4 py-2 text-sm font-mono text-cream placeholder-mist/40 focus:border-bronze-glow focus:outline-none w-full md:w-64 tracking-[0.2em] text-center"
              />
              <Button
                variant="primary-dark"
                size="sm"
                type="submit"
                className="shrink-0 gap-1.5 font-bold cursor-pointer"
              >
                <Zap className="w-4 h-4 text-midnight" />
                Verify & Allocate Table
              </Button>
            </form>
          </div>

          {allocationSuccess && (
            <div className="p-3 bg-baize/20 border border-baize/40 rounded-xl text-xs text-baize-light flex items-center justify-between animate-in fade-in">
              <span>{allocationSuccess}</span>
              <button
                type="button"
                onClick={() => setAllocationSuccess("")}
                className="text-mist hover:text-cream text-xs ml-3"
              >
                Dismiss
              </button>
            </div>
          )}

          {quickPinError && (
            <div className="p-3 bg-cue/20 border border-cue/40 rounded-xl text-xs text-cue-light flex items-center justify-between animate-in fade-in">
              <span>{quickPinError}</span>
              <button
                type="button"
                onClick={() => setQuickPinError("")}
                className="text-mist hover:text-cream text-xs ml-3"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* 6 Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => {
            const session = sessions.find(
              (s) => s.table_id === table.id && !s.ended_at
            );
            const booking = bookings.find(
              (b) => b.table_id === table.id && (b.status === "checked_in" || b.status === "confirmed")
            );
            const tableOrders = orders.filter((o) => o.table_id === table.id);

            return (
              <TableFloorCard
                key={table.id}
                table={table}
                session={session}
                booking={booking}
                ordersCount={tableOrders.length}
                onOpenPinModal={(t) => {
                  setPinModalTable(t);
                  setPinError("");
                  if (booking) setBookingCodeInput(booking.booking_code);
                }}
                onOpenExtraTime={(s) => setExtraTimeSession(s)}
                onOpenEndSession={(s) => setEndSessionItem(s)}
                onOpenWalkIn={(t) => handleOpenWalkIn(t.type, t)}
              />
            );
          })}
        </div>

        {/* PIN CHECK-IN MODAL */}
        <Modal
          isOpen={!!pinModalTable}
          onClose={() => setPinModalTable(null)}
          title={`Check-in: ${pinModalTable?.name}`}
          description="Enter player's Booking Code and 6-digit PIN to initialize clock."
          isDark
        >
          <form onSubmit={handleStartSessionWithPin} className="space-y-4 pt-2">
            {pinError && (
              <div className="p-3 rounded-xl bg-cue/20 border border-cue/40 text-xs text-cue-light flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-mist uppercase tracking-wider">
                Booking Code
              </label>
              <input
                type="text"
                value={bookingCodeInput}
                onChange={(e) => setBookingCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. CN-7K3F9Q"
                className="w-full px-4 py-2.5 rounded-xl border border-midnight-line bg-midnight text-cream font-mono text-base tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-bronze-glow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-mist uppercase tracking-wider">
                6-Digit PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-midnight-line bg-midnight text-cream font-mono text-2xl tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-bronze-glow"
              />
              <p className="text-[11px] text-mist/70">
                5 consecutive wrong attempts will lock this booking code.
              </p>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <Button variant="primary-dark" size="md" type="submit" className="w-full">
                Verify PIN & Start Table
              </Button>
              <Button
                variant="ghost"
                size="md"
                type="button"
                onClick={() => setPinModalTable(null)}
                className="text-mist"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* EXTRA TIME MODAL */}
        <Modal
          isOpen={!!extraTimeSession}
          onClose={() => setExtraTimeSession(null)}
          title="Add Extra Playing Time"
          description="Extend active session. Rate will prorate automatically into final bill."
          isDark
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleAddExtraTime(mins)}
                  className="p-3 sm:p-4 rounded-xl bg-midnight border border-midnight-line hover:border-bronze-glow text-center cursor-pointer transition-all hover:bg-midnight-card touch-manipulation min-h-[50px] flex flex-col items-center justify-center"
                >
                  <div className="font-display text-xl sm:text-2xl font-bold text-bronze-glow">
                    +{mins}
                  </div>
                  <div className="text-[11px] sm:text-xs text-mist mt-0.5">Minutes</div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-baize-dark/40 border border-baize/30 text-xs text-baize-light flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Checked for overlap against upcoming reservations.</span>
            </div>
          </div>
        </Modal>

        {/* END SESSION CONFIRMATION MODAL */}
        <Modal
          isOpen={!!endSessionItem}
          onClose={() => setEndSessionItem(null)}
          title="End Game Session?"
          description="Stopping the clock will conclude the table time and generate the final combined bill."
          isDark
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-mist leading-relaxed">
              All unserved kitchen tickets will be automatically tallied. A combined bill will be created for immediate Cash, UPI, or Card settlement.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button variant="danger" size="md" onClick={handleEndSession} className="w-full">
                Yes, Stop Clock & Open Bill
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setEndSessionItem(null)}
                className="text-mist"
              >
                Keep Playing
              </Button>
            </div>
          </div>
        </Modal>

        {/* WALK-IN OFFLINE BOOKING MODAL */}
        <Modal
          isOpen={isWalkInModalOpen}
          onClose={() => {
            setIsWalkInModalOpen(false);
            setWalkInTable(null);
          }}
          title={walkInTable ? `Walk-in: ${walkInTable.name}` : "Walk-in Playing Session"}
          description="Select discipline and duration. The system automatically allocates an available table and commences the session clock."
          isDark
        >
          <form onSubmit={handleCreateWalkIn} className="space-y-4 pt-2">
            {walkInError && (
              <div className="p-3 rounded-xl bg-cue/20 border border-cue/40 text-xs text-cue-light flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            {/* Discipline Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-mist uppercase tracking-wider">
                Game Discipline
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWalkInDiscipline("pool");
                    setWalkInTable(null);
                  }}
                  className={clsx(
                    "p-3 rounded-xl border text-left transition-all",
                    walkInDiscipline === "pool"
                      ? "bg-baize/20 border-baize text-cream shadow-sm"
                      : "bg-midnight border-midnight-line text-mist hover:text-cream"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm">🎱 American Pool</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-baize/30 text-baize-light">
                      {tables.filter((t) => t.type === "pool" && t.active && t.status === "free" && !sessions.some((s) => s.table_id === t.id && !s.ended_at)).length}/3 Free
                    </span>
                  </div>
                  <div className="text-[11px] text-mist mt-1">₹300/hour · 9ft Match</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWalkInDiscipline("snooker");
                    setWalkInTable(null);
                  }}
                  className={clsx(
                    "p-3 rounded-xl border text-left transition-all",
                    walkInDiscipline === "snooker"
                      ? "bg-bronze/20 border-bronze text-cream shadow-sm"
                      : "bg-midnight border-midnight-line text-mist hover:text-cream"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm">🔴 English Snooker</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bronze/30 text-bronze-glow">
                      {tables.filter((t) => t.type === "snooker" && t.active && t.status === "free" && !sessions.some((s) => s.table_id === t.id && !s.ended_at)).length}/3 Free
                    </span>
                  </div>
                  <div className="text-[11px] text-mist mt-1">₹450/hour · 12ft Championship</div>
                </button>
              </div>
            </div>

            {walkInTable && (
              <div className="p-2.5 rounded-lg bg-midnight border border-midnight-line text-xs text-mist flex items-center justify-between">
                <span>Selected Table: <strong className="text-cream">{walkInTable.name}</strong></span>
                <button
                  type="button"
                  onClick={() => setWalkInTable(null)}
                  className="text-bronze-glow hover:underline text-[11px]"
                >
                  Switch to Auto-Allocate
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-mist uppercase tracking-wider">
                Guest Name
              </label>
              <input
                type="text"
                required
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                placeholder="Walk-in guest name"
                className="w-full px-4 py-2.5 rounded-xl border border-midnight-line bg-midnight text-cream text-sm focus:outline-none focus:ring-2 focus:ring-bronze-glow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-mist uppercase tracking-wider">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-midnight-line bg-midnight text-cream text-sm focus:outline-none focus:ring-2 focus:ring-bronze-glow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-mist uppercase tracking-wider">
                Initial Session Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[60, 90, 120].map((m) => {
                  const rate = walkInTable ? (walkInTable.type === "snooker" ? 450 : 300) : (walkInDiscipline === "snooker" ? 450 : 300);
                  const price = Math.round((m / 60) * rate);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setWalkInMinutes(m)}
                      className={clsx(
                        "py-2.5 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold border transition-all cursor-pointer touch-manipulation min-h-[44px] flex flex-col items-center justify-center",
                        walkInMinutes === m
                          ? "bg-bronze-glow text-midnight border-bronze-glow shadow-sm"
                          : "bg-midnight border-midnight-line text-mist hover:text-cream"
                      )}
                    >
                      <span>{m} min</span>
                      <span className="text-[10px] opacity-80 font-normal">₹{price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <Button variant="primary-dark" size="md" type="submit" className="w-full">
                {walkInTable ? `Confirm ${walkInTable.name} & Start Timer` : `Auto-Allocate & Start Timer`}
              </Button>
              <Button
                variant="ghost"
                size="md"
                type="button"
                onClick={() => {
                  setIsWalkInModalOpen(false);
                  setWalkInTable(null);
                }}
                className="text-mist"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* PROFESSIONAL BILL / INVOICE PREVIEW & ACTIONS MODAL */}
        <ProfessionalBillModal
          isOpen={billModalOpen}
          onClose={() => {
            setBillModalOpen(false);
            setActiveBill(null);
          }}
          bill={activeBill}
          onPaymentSettled={reloadData}
        />
      </div>
    </div>
    </div>
  );
}
