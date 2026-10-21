"use client";

import React, { useState, useEffect } from "react";
import { StaffNav } from "@/components/staff/StaffNav";
import { venueStore } from "@/lib/store/venueStore";
import { Booking, GameTable, Session } from "@/types/database";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import {
  Calendar,
  Search,
  KeyRound,
  CheckCircle2,
  Clock,
  Filter,
  UserCheck,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

export default function StaffBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today");

  // Check-in PIN modal
  const [checkInBooking, setCheckInBooking] = useState<Booking | null>(null);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  const reload = () => {
    setBookings(venueStore.getBookings());
    setTables(venueStore.getTables());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const getTableName = (tableId: string) => {
    return tables.find((t) => t.id === tableId)?.name || "Championship Table";
  };

  // Filter logic
  const todayDateStr = new Date().toISOString().split("T")[0];

  const filteredBookings = bookings.filter((b) => {
    // Status filter
    if (statusFilter !== "all" && b.status !== statusFilter) return false;

    // Date filter
    if (dateFilter === "today") {
      const clean = b.during.replace(/[\[\]\(\)"]/g, "");
      const [startStr] = clean.split(",");
      if (startStr && !startStr.startsWith(todayDateStr!)) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const codeMatch = b.booking_code.toLowerCase().includes(q);
      const nameMatch = b.guest_name ? b.guest_name.toLowerCase().includes(q) : false;
      const phoneMatch = b.guest_phone ? b.guest_phone.includes(q) : false;
      return codeMatch || nameMatch || phoneMatch;
    }

    return true;
  });

  const handleConfirmCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInBooking) return;
    setPinError(null);

    const res = venueStore.startSessionWithPin(checkInBooking.booking_code, enteredPin.trim());
    if (res.success) {
      setCheckInBooking(null);
      setEnteredPin("");
      // Redirect to floor sessions
      window.location.href = "/staff/sessions";
    } else {
      setPinError(res.error || "Incorrect check-in PIN");
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
                <Calendar className="w-3.5 h-3.5" />
                Floor Concierge Reservations Desk
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Reservations & Check-ins
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-mist font-medium">
                Total Listed: <strong className="text-cream">{filteredBookings.length}</strong>
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-midnight-card p-4 rounded-2xl border border-midnight-line flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Booking Code, Guest Name, or Mobile..."
                  className="w-full bg-midnight border border-midnight-line rounded-xl pl-9 pr-4 py-2 text-xs text-cream placeholder-mist/40 focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                />
                <Search className="w-4 h-4 text-mist absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter */}
              <div className="flex items-center bg-midnight rounded-xl p-1 border border-midnight-line text-xs font-medium">
                <button
                  onClick={() => setDateFilter("today")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    dateFilter === "today" ? "bg-bronze-glow text-midnight font-bold" : "text-mist hover:text-cream"
                  }`}
                >
                  Today&apos;s Bookings
                </button>
                <button
                  onClick={() => setDateFilter("all")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    dateFilter === "all" ? "bg-bronze-glow text-midnight font-bold" : "text-mist hover:text-cream"
                  }`}
                >
                  All Dates
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Ref Code</th>
                    <th className="py-3.5 px-4">Table</th>
                    <th className="py-3.5 px-4">Guest Info</th>
                    <th className="py-3.5 px-4">Reserved Interval</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Floor Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-mist">
                        No reservations match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const clean = b.during.replace(/[\[\]\(\)"]/g, "");
                      const [startStr, endStr] = clean.split(",");
                      const startDate = startStr ? new Date(startStr) : new Date();
                      const endDate = endStr ? new Date(endStr) : new Date();

                      return (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-cream">
                            {b.booking_code}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-mist">
                            {getTableName(b.table_id)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-cream">{b.guest_name || "Guest"}</div>
                            <div className="text-[11px] text-mist font-mono">{b.guest_phone || "—"}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-cream">{formatDateIST(startDate)}</div>
                            <div className="text-[11px] text-mist font-mono">
                              {formatTimeIST(startDate)} — {formatTimeIST(endDate)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-bronze-glow">
                            ₹{b.amount}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={b.status} isDark />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {b.status === "confirmed" && (
                              <Button
                                variant="primary-dark"
                                size="sm"
                                onClick={() => {
                                  setCheckInBooking(b);
                                  setEnteredPin("");
                                  setPinError(null);
                                }}
                                className="gap-1.5 font-bold"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-midnight" />
                                Check-in with PIN
                              </Button>
                            )}
                            {b.status === "checked_in" && (
                              <span className="text-[11px] font-bold text-baize-light flex items-center justify-end gap-1">
                                <span className="w-2 h-2 rounded-full bg-baize-light animate-ping" />
                                Active Floor Session
                              </span>
                            )}
                            {b.status === "completed" && (
                              <span className="text-mist text-xs">Completed</span>
                            )}
                            {b.status === "cancelled" && (
                              <span className="text-cue-light/60 text-xs">Cancelled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in PIN Modal */}
      <Modal
        isOpen={!!checkInBooking}
        onClose={() => setCheckInBooking(null)}
        title="Concierge Customer Check-in"
      >
        {checkInBooking && (
          <form onSubmit={handleConfirmCheckIn} className="space-y-4 text-left">
            <div className="p-3 bg-midnight-card border border-midnight-line rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-mist">Reservation:</span>
                <span className="font-mono font-bold text-cream">{checkInBooking.booking_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist">Customer:</span>
                <span className="font-bold text-cream">{checkInBooking.guest_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist">Allocated Table:</span>
                <span className="font-bold text-bronze-glow">{getTableName(checkInBooking.table_id)}</span>
              </div>
            </div>

            {pinError && (
              <div className="p-2.5 rounded-lg bg-cue-light/10 border border-cue-light/30 text-cue-light text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Enter Customer 6-Digit Check-in PIN
              </label>
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="441199"
                className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-3 font-mono text-2xl font-black text-center tracking-widest text-cream focus:outline-none focus:ring-2 focus:ring-bronze-glow"
              />
              <div className="text-[11px] text-mist/70 mt-1 text-center">
                Default demonstration PIN: <code className="text-cream">441199</code>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" size="sm" type="button" onClick={() => setCheckInBooking(null)}>
                Cancel
              </Button>
              <Button variant="primary-dark" size="sm" type="submit" className="font-bold">
                Verify & Start Table Session
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
