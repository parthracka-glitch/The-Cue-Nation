"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { venueStore } from "@/lib/store/venueStore";
import { Session, GameTable, Booking, Bill } from "@/types/database";
import { ProfessionalBillModal } from "@/components/billing/ProfessionalBillModal";
import { formatTimeIST } from "@/lib/time";
import {
  Clock,
  Play,
  Pause,
  StopCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  AlertTriangle,
  Receipt,
  User,
} from "lucide-react";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(Date.now());
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const reloadData = () => {
    setSessions(venueStore.getSessions());
    setTables(venueStore.getTables());
    setBookings(venueStore.getBookings());
  };

  useEffect(() => {
    reloadData();
    const unsub = venueStore.subscribe(reloadData);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const getElapsedMinutes = (startedAt: string) => {
    const diffMs = now - new Date(startedAt).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  };

  const activeSessions = sessions.filter((s) => !s.ended_at);

  const handleEndSession = (sessionId: string) => {
    if (confirm("Are you sure you want to conclude this session as Admin? This will finalize the bill.")) {
      const res = venueStore.endSession(sessionId);
      if (res.success && res.billId) {
        const bill = res.bill || venueStore.getBills().find((b) => b.id === res.billId) || null;
        setSelectedBill(bill);
        setIsBillModalOpen(true);
      }
    }
  };

  const handleAddExtraMinutes = (sessionId: string) => {
    venueStore.addExtraMinutes(sessionId, 30);
  };

  return (
    <div className="min-h-screen bg-midnight text-cream py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNav />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-bronze">
              Administrative Command
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Live Session Timers & Floor Oversight
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={reloadData}
              className="text-ash border-midnight-line hover:text-cream"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Sync Timers
            </Button>
          </div>
        </div>

        {/* Active Session Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSessions.length === 0 ? (
            <div className="col-span-full py-16 text-center text-ash bg-midnight-card/50 rounded-2xl border border-midnight-line">
              <Clock className="w-12 h-12 mx-auto text-ash/30 mb-3" />
              <p className="text-base font-semibold text-cream">No Active Sessions Right Now</p>
              <p className="text-xs text-ash/70 mt-1 max-w-sm mx-auto">
                All pool and snooker tables are currently vacant or awaiting customer check-in.
              </p>
            </div>
          ) : (
            activeSessions.map((session) => {
              const table = tables.find((t) => t.id === session.table_id);
              const booking = bookings.find((b) => b.id === session.booking_id);
              const elapsedMins = getElapsedMinutes(session.started_at);
              const scheduledMins = (session.extra_minutes || 0) + 60;
              const isOvertime = elapsedMins > scheduledMins;

              return (
                <Card
                  key={session.id}
                  variant="dark"
                  className={`p-6 border-midnight-line flex flex-col justify-between space-y-5 transition-all ${
                    isOvertime ? "border-rose-500/50 bg-rose-500/5" : "hover:border-bronze/50"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-baize-light block">
                          {table ? table.name : "Pool Table"}
                        </span>
                        <h3 className="font-display text-lg font-bold text-cream mt-0.5">
                          {booking ? booking.guest_name : "Guest Cueist"}
                        </h3>
                        <span className="text-xs text-ash">{booking?.guest_phone}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                          isOvertime
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {isOvertime ? "Overtime Playing" : "Active Frame"}
                      </span>
                    </div>

                    {/* Big Digital Timer Display */}
                    <div className="p-4 rounded-xl bg-midnight border border-midnight-line text-center space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-ash block">Authoritative Elapsed Time</span>
                      <div className="font-mono text-3xl font-extrabold text-bronze-glow tracking-wider">
                        {Math.floor(elapsedMins / 60)}h {elapsedMins % 60}m
                      </div>
                      <div className="text-[11px] text-ash flex items-center justify-center gap-3 pt-1">
                        <span>Started: {formatTimeIST(session.started_at)}</span>
                        <span>•</span>
                        <span>Current Charge: ₹{session.time_charge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  <div className="pt-2 border-t border-midnight-line flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddExtraMinutes(session.id)}
                      className="text-xs flex-1 text-ash border-midnight-line hover:text-cream"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      +30m Extra
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleEndSession(session.id)}
                      className="text-xs flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                      <StopCircle className="w-3.5 h-3.5 mr-1" />
                      End Session
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* PROFESSIONAL BILL MODAL */}
        <ProfessionalBillModal
          isOpen={isBillModalOpen}
          onClose={() => {
            setIsBillModalOpen(false);
            setSelectedBill(null);
          }}
          bill={selectedBill}
          onPaymentSettled={reloadData}
        />
      </div>
    </div>
  );
}
