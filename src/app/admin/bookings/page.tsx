"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { venueStore } from "@/lib/store/venueStore";
import { Booking, GameTable } from "@/types/database";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import {
  Calendar,
  Search,
  Filter,
  XCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Plus,
  DollarSign,
  TrendingUp,
  User,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "upcoming">("all");

  // Status Action Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<"cancel" | "complete" | "confirm" | null>(null);
  const [reason, setReason] = useState("");

  // Walk-in booking modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTableId, setCreateTableId] = useState("main-pool");
  const [createDate, setCreateDate] = useState(new Date().toISOString().split("T")[0]);
  const [createStartTime, setCreateStartTime] = useState("14:00");
  const [createDuration, setCreateDuration] = useState("60");
  const [createGuestName, setCreateGuestName] = useState("");
  const [createGuestPhone, setCreateGuestPhone] = useState("");
  const [createGuestEmail, setCreateGuestEmail] = useState("");
  const [createError, setCreateError] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const reload = () => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (data.bookings) setBookings(data.bookings);
      })
      .catch(() => {
        setBookings(venueStore.getBookings());
      });

    setTables(venueStore.getTables());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const getTableName = (tableId: string) => {
    if (tableId === "main-pool") return "Main Pool (Championship)";
    if (tableId === "smoker-pool") return "Smoker Pool (Cigar Lounge)";
    return tables.find((t) => t.id === tableId)?.name || tableId;
  };

  // Metrics
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed" || b.status === "checked_in").length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (tableFilter !== "all" && b.table_id !== tableFilter && b.pool_id !== tableFilter) return false;

    // Date filter
    const clean = b.during.replace(/[\[\]\(\)"]/g, "");
    const [startStr] = clean.split(",");
    if (startStr) {
      const bDate = new Date(startStr);
      const bDateStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, "0")}-${String(bDate.getDate()).padStart(2, "0")}`;
      if (dateFilter === "today" && bDateStr !== todayStr) return false;
      if (dateFilter === "upcoming" && bDate < now) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = b.booking_code.toLowerCase().includes(q);
      const nameMatch = b.guest_name ? b.guest_name.toLowerCase().includes(q) : false;
      const phoneMatch = b.guest_phone ? b.guest_phone.includes(q) : false;
      return codeMatch || nameMatch || phoneMatch;
    }
    return true;
  });

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !actionType) return;

    try {
      const targetStatus = actionType === "cancel" ? "cancelled" : actionType === "complete" ? "completed" : "confirmed";
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus, note: reason }),
      });

      if (res.ok) {
        setSelectedBooking(null);
        setActionType(null);
        setReason("");
        reload();
      }
    } catch {
      // ignore
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createGuestName.trim() || !createGuestPhone.trim()) {
      setCreateError("Customer name and phone number are required");
      return;
    }

    setIsSubmittingCreate(true);
    setCreateError("");

    try {
      const startDateTime = new Date(`${createDate}T${createStartTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(createDuration, 10) * 60 * 1000);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: createTableId,
          tableId: createTableId,
          startISO: startDateTime.toISOString(),
          endISO: endDateTime.toISOString(),
          guestName: createGuestName.trim(),
          guestPhone: createGuestPhone.trim(),
          guestEmail: createGuestEmail.trim() || undefined,
          source: "offline",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setCreateError(data.error || "Conflict: slot is already reserved for this pool");
        setIsSubmittingCreate(false);
        return;
      }

      setShowCreateModal(false);
      setCreateGuestName("");
      setCreateGuestPhone("");
      setCreateGuestEmail("");
      reload();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header & New Booking Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <Calendar className="w-3.5 h-3.5" />
                CueNation Pool • Master Booking Ledger
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Reservations & Booking Operations
              </h1>
            </div>

            <Button
              variant="primary-dark"
              size="sm"
              onClick={() => {
                setCreateError("");
                setShowCreateModal(true);
              }}
              className="gap-2 font-bold shadow-lamp bg-brass hover:bg-brass-glow text-ink"
            >
              <Plus className="w-4 h-4" />
              <span>Create Walk-In Booking</span>
            </Button>
          </div>

          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-midnight-card border border-midnight-line">
              <span className="text-[11px] uppercase tracking-wider text-mist block">Total Bookings</span>
              <span className="text-2xl font-display font-bold text-cream tabular-nums">{totalBookings}</span>
            </div>
            <div className="p-4 rounded-2xl bg-midnight-card border border-emerald-500/30">
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 block">Confirmed / Active</span>
              <span className="text-2xl font-display font-bold text-emerald-300 tabular-nums">{confirmedCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-midnight-card border border-amber-500/30">
              <span className="text-[11px] uppercase tracking-wider text-amber-400 block">Pending Hold</span>
              <span className="text-2xl font-display font-bold text-amber-300 tabular-nums">{pendingCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-midnight-card border border-red-500/30">
              <span className="text-[11px] uppercase tracking-wider text-red-400 block">Cancelled</span>
              <span className="text-2xl font-display font-bold text-red-400 tabular-nums">{cancelledCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-midnight-card border border-bronze-glow/30">
              <span className="text-[11px] uppercase tracking-wider text-bronze-glow block">Total Gross Value</span>
              <span className="text-2xl font-display font-bold text-brass tabular-nums">₹{totalRevenue}</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-midnight-card p-4 rounded-2xl border border-midnight-line flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search booking code, customer name, or phone..."
                className="w-full bg-midnight border border-midnight-line rounded-xl pl-9 pr-4 py-2 text-xs text-cream placeholder-mist/40 focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
              <Search className="w-4 h-4 text-mist absolute left-3 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter */}
              <div className="inline-flex p-1 bg-midnight rounded-xl border border-midnight-line text-xs">
                {(["all", "today", "upcoming"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDateFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                      dateFilter === mode ? "bg-brass text-ink" : "text-mist hover:text-cream"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Pool Filter */}
              <select
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                className="bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow cursor-pointer"
              >
                <option value="all">All Pools & Tables</option>
                <option value="main-pool">Main Pool</option>
                <option value="smoker-pool">Smoker Pool</option>
                {tables
                  .filter((t) => t.id !== "main-pool" && t.id !== "smoker-pool")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-midnight/80 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Pool / Table</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Playing Interval</th>
                    <th className="py-3.5 px-4">Fee</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-14 px-4 text-mist">
                        <div className="max-w-xs mx-auto space-y-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-mist">
                            <Calendar className="w-5 h-5 text-bronze-glow" />
                          </div>
                          <div>
                            <div className="font-semibold text-cream text-sm">No Bookings Found</div>
                            <p className="text-xs text-mist mt-0.5">
                              {searchQuery || statusFilter !== "all" || tableFilter !== "all" || dateFilter !== "all"
                                ? "No reservations match your active filter criteria."
                                : "No booking records found in the database."}
                            </p>
                          </div>
                          {(searchQuery || statusFilter !== "all" || tableFilter !== "all" || dateFilter !== "all") && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                                setTableFilter("all");
                                setDateFilter("all");
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
                          <td className="py-3.5 px-4 font-semibold text-brass">
                            {getTableName(b.pool_id || b.table_id)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-cream">{b.guest_name || "Guest Customer"}</div>
                            <div className="text-[11px] text-mist font-mono">{b.guest_phone || "—"}</div>
                            {b.guest_email && <div className="text-[10px] text-mist/70 truncate">{b.guest_email}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-cream">{formatDateIST(startDate)}</div>
                            <div className="text-[11px] text-mist font-mono">
                              {formatTimeIST(startDate)} — {formatTimeIST(endDate)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-brass tabular-nums">
                            ₹{b.amount}
                          </td>
                          <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-mist">
                            {b.source}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={b.status} isDark />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {b.status === "pending" && (
                                <button
                                  onClick={() => {
                                    setSelectedBooking(b);
                                    setActionType("confirm");
                                    setReason("");
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-semibold text-[11px] cursor-pointer"
                                >
                                  Confirm
                                </button>
                              )}

                              {b.status === "confirmed" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      setActionType("complete");
                                      setReason("");
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-brass/20 hover:bg-brass/40 text-brass font-semibold text-[11px] cursor-pointer"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      setActionType("cancel");
                                      setReason("");
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 font-semibold text-[11px] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
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

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={actionType === "cancel" ? "Cancel Customer Booking" : actionType === "complete" ? "Mark Booking Completed" : "Confirm Pending Booking"}
      >
        {selectedBooking && (
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-left text-xs">
            <p className="text-mist">
              Are you sure you want to {actionType} booking <strong className="text-cream">{selectedBooking.booking_code}</strong> for <strong className="text-cream">{selectedBooking.guest_name}</strong>?
            </p>

            {actionType === "cancel" && (
              <p className="text-red-300 bg-red-950/40 p-2.5 rounded-xl border border-red-500/20">
                Cancelling will immediately release the time slot back to the live booking pool.
              </p>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-mist mb-1">
                Admin Note / Audit Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional explanation for internal audit log..."
                className="w-full bg-midnight border border-midnight-line rounded-xl p-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                Dismiss
              </Button>
              <Button
                type="submit"
                variant={actionType === "cancel" ? "danger" : "primary-dark"}
                size="sm"
                className="font-bold capitalize"
              >
                Confirm {actionType}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Walk-in Booking Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Walk-In / Phone Booking"
      >
        <form onSubmit={handleCreateWalkIn} className="space-y-4 text-left text-xs">
          {createError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200">
              {createError}
            </div>
          )}

          <div>
            <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
              Select Pool / Arena *
            </label>
            <select
              value={createTableId}
              onChange={(e) => setCreateTableId(e.target.value)}
              className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow cursor-pointer"
            >
              <option value="main-pool">Main Pool (Championship Arena)</option>
              <option value="smoker-pool">Smoker Pool (Cigar Lounge)</option>
              {tables
                .filter((t) => t.id !== "main-pool" && t.id !== "smoker-pool")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                Booking Date *
              </label>
              <input
                type="date"
                required
                value={createDate}
                onChange={(e) => setCreateDate(e.target.value)}
                className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={createStartTime}
                onChange={(e) => setCreateStartTime(e.target.value)}
                className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
              Playing Duration *
            </label>
            <select
              value={createDuration}
              onChange={(e) => setCreateDuration(e.target.value)}
              className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow cursor-pointer"
            >
              <option value="60">60 mins (1 hour)</option>
              <option value="90">90 mins (1.5 hours)</option>
              <option value="120">120 mins (2 hours)</option>
              <option value="180">180 mins (3 hours)</option>
            </select>
          </div>

          <div className="space-y-3 pt-1 border-t border-midnight-line">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                value={createGuestName}
                onChange={(e) => setCreateGuestName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                Customer Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={createGuestPhone}
                onChange={(e) => setCreateGuestPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={createGuestEmail}
                onChange={(e) => setCreateGuestEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingCreate}
              variant="primary-dark"
              size="sm"
              className="font-bold bg-brass text-ink hover:bg-brass-glow"
            >
              {isSubmittingCreate ? "Validating & Creating..." : "Confirm Walk-In Booking"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
