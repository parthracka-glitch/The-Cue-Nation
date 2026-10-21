"use client";

import React, { useState, useEffect } from "react";
import { StaffNav } from "@/components/staff/StaffNav";
import { venueStore } from "@/lib/store/venueStore";
import { Session, GameTable, Booking, Order } from "@/types/database";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useSessionTimer } from "@/lib/realtime/useSessionTimer";
import Link from "next/link";
import {
  Clock,
  Play,
  Square,
  Plus,
  UtensilsCrossed,
  Receipt,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

function SessionRowItem({
  session,
  table,
  booking,
  ordersCount,
  onOpenExtraTime,
  onOpenEndSession,
}: {
  session: Session;
  table?: GameTable;
  booking?: Booking;
  ordersCount: number;
  onOpenExtraTime: (s: Session) => void;
  onOpenEndSession: (s: Session) => void;
}) {
  const { formattedElapsed, isOvertime } = useSessionTimer(
    session.started_at,
    60,
    session.extra_minutes || 0
  );

  return (
    <div className="bg-midnight-card border border-midnight-line rounded-2xl p-6 shadow-card hover:border-bronze-glow/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-baize-light animate-ping" />
          <span className="text-xs font-bold uppercase tracking-widest text-baize-light">
            IN PLAY · {table?.type === "snooker" ? "12ft Tournament Snooker" : "9ft Match Pool"}
          </span>
          {session.extra_minutes > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-amber/20 border border-amber/30 text-amber text-[11px] font-bold">
              +{session.extra_minutes}m Extra
            </span>
          )}
        </div>

        <h3 className="font-display text-2xl font-bold text-cream">
          {table ? table.name : "Championship Table"}
        </h3>

        <div className="flex flex-wrap items-center gap-4 text-xs text-mist">
          <span>Guest: <strong className="text-cream">{booking?.guest_name || "Guest Player"}</strong></span>
          <span>Ref: <code className="text-cream">{booking?.booking_code || session.id}</code></span>
          <span>Time Charge: <strong className="text-bronze-glow">₹{session.time_charge}</strong></span>
        </div>
      </div>

      {/* Live Timer Display */}
      <div className="flex flex-col items-center md:items-end justify-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-mist mb-1">
          Server Synced Elapsed Time
        </span>
        <div
          className={`font-mono text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${
            isOvertime ? "text-cue-light animate-pulse" : "text-bronze-glow"
          }`}
        >
          {formattedElapsed}
        </div>
      </div>

      {/* Session Controls */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
        <Link href={`/staff/kitchen`} className="shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-mist hover:text-cream text-xs gap-1.5 px-3 border border-midnight-line"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-bronze-glow" />
            <span>Orders ({ordersCount})</span>
          </Button>
        </Link>

        <Button
          variant="secondary-dark"
          size="sm"
          onClick={() => onOpenExtraTime(session)}
          className="text-xs gap-1.5 font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> Extra Time
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => onOpenEndSession(session)}
          className="text-xs gap-1.5 font-bold"
        >
          <Square className="w-3.5 h-3.5 fill-current" /> End & Bill
        </Button>
      </div>
    </div>
  );
}

export default function StaffSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals
  const [extraTimeSession, setExtraTimeSession] = useState<Session | null>(null);
  const [endSessionItem, setEndSessionItem] = useState<Session | null>(null);

  const reload = () => {
    setSessions(venueStore.getSessions().filter((s) => !s.ended_at));
    setTables(venueStore.getTables());
    setBookings(venueStore.getBookings());
    setOrders(venueStore.getOrders());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const handleAddExtraTime = (minutes: number) => {
    if (!extraTimeSession) return;
    const res = venueStore.addExtraTime(extraTimeSession.id, minutes);
    if (res.success) {
      setExtraTimeSession(null);
    }
  };

  const handleEndSession = () => {
    if (!endSessionItem) return;
    const res = venueStore.endSession(endSessionItem.id);
    if (res.success) {
      setEndSessionItem(null);
      window.location.href = `/staff/payments?billId=${res.billId}`;
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <Clock className="w-3.5 h-3.5" />
                Live Floor Sessions Manager
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Active Match Timers
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-mist font-semibold">
                Active Tables in Play:{" "}
                <strong className="text-baize-light">{sessions.length}</strong>
              </span>
            </div>
          </div>

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <div className="bg-midnight-card border border-midnight-line rounded-3xl p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-midnight border border-midnight-line flex items-center justify-center text-mist mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-cream">
                No Active Sessions Running
              </h3>
              <p className="text-sm text-mist max-w-md mx-auto">
                There are currently no live games running on the floor. Start a match from reservations or record a walk-in player.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/staff/bookings">
                  <Button variant="primary-dark" size="md">
                    Check-in Pending Reservation
                  </Button>
                </Link>
                <Link href="/staff">
                  <Button variant="secondary-dark" size="md">
                    Floor Grid
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((sess) => {
                const table = tables.find((t) => t.id === sess.table_id);
                const booking = bookings.find((b) => b.id === sess.booking_id);
                const ordersCount = orders.filter((o) => o.session_id === sess.id).length;

                return (
                  <SessionRowItem
                    key={sess.id}
                    session={sess}
                    table={table}
                    booking={booking}
                    ordersCount={ordersCount}
                    onOpenExtraTime={(s) => setExtraTimeSession(s)}
                    onOpenEndSession={(s) => setEndSessionItem(s)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Extra Time Modal */}
      <Modal
        isOpen={!!extraTimeSession}
        onClose={() => setExtraTimeSession(null)}
        title="Extend Playing Session"
      >
        <div className="space-y-4">
          <p className="text-xs text-mist">
            Select additional playing duration. System automatically verifies conflicts against upcoming reservations.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[15, 30, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleAddExtraTime(mins)}
                className="p-3 sm:p-4 rounded-xl border border-midnight-line bg-midnight hover:border-bronze-glow hover:bg-bronze/10 text-center transition-all group touch-manipulation min-h-[50px] flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="font-mono text-xl sm:text-2xl font-black text-bronze-glow group-hover:scale-105 transition-transform">
                  +{mins}m
                </div>
                <div className="text-[10px] sm:text-[11px] text-mist mt-0.5">Extra Time</div>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setExtraTimeSession(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* End Session Modal */}
      <Modal
        isOpen={!!endSessionItem}
        onClose={() => setEndSessionItem(null)}
        title="Conclude Playing Session & Generate Bill"
      >
        <div className="space-y-4">
          <p className="text-xs text-mist leading-relaxed">
            Ending this session will freeze the authoritative server match duration, tally all served kitchen café items, and generate the final POS settlement bill.
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setEndSessionItem(null)}>
              Keep Session Active
            </Button>
            <Button variant="danger" size="sm" onClick={handleEndSession} className="font-bold">
              Conclude Match & Open POS
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
