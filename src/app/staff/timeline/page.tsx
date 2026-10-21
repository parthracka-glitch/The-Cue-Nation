"use client";

import React, { useState, useEffect } from "react";
import { StaffNav } from "@/components/staff/StaffNav";
import { venueStore } from "@/lib/store/venueStore";
import { GameTable, Booking, Session } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { formatTimeIST } from "@/lib/time";
import clsx from "clsx";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Search,
  RefreshCw,
  User,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function TableTimelinePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]!);
  const [disciplineFilter, setDisciplineFilter] = useState<"all" | "pool" | "snooker">("all");
  const [tables, setTables] = useState<GameTable[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<{
    type: "session" | "booking" | "maintenance";
    title: string;
    subtitle: string;
    timeRange: string;
    details?: Record<string, any>;
  } | null>(null);

  const reload = () => {
    setTables(venueStore.getTables());
    setBookings(venueStore.getBookings());
    setSessions(venueStore.getSessions());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]!);
  };

  // Filtered tables (Pool 1-3, Snooker 1-3)
  const displayTables = tables.filter((t) => {
    if (disciplineFilter === "pool") return t.type === "pool";
    if (disciplineFilter === "snooker") return t.type === "snooker";
    return true;
  });

  // Operating hours: 10:00 to 01:00 (15 hours)
  const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />

      <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div className="flex items-center gap-3">
              <Link href="/staff">
                <Button variant="ghost" size="sm" className="text-mist hover:text-cream border border-midnight-line">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Floor
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                  <Clock className="w-3.5 h-3.5" />
                  Table Schedule Engine
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream mt-0.5">
                  Daily Table Timeline
                </h1>
              </div>
            </div>

            {/* Date Nav Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 rounded-xl bg-midnight border border-midnight-line text-mist hover:text-cream transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0]!)}
                className="px-3 py-1.5 rounded-xl bg-midnight border border-midnight-line text-xs font-bold text-cream hover:bg-white/5 transition-colors"
              >
                Today
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-midnight border border-midnight-line rounded-xl px-3 py-1.5 text-xs text-cream font-mono focus:outline-none focus:border-bronze-glow"
              />

              <button
                onClick={() => changeDate(1)}
                className="p-2 rounded-xl bg-midnight border border-midnight-line text-mist hover:text-cream transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

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

          {/* Discipline Filters */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {[
                { id: "all", label: "All 6 Tables" },
                { id: "pool", label: "Pool (Tables 1–3)" },
                { id: "snooker", label: "Snooker (Tables 1–3)" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDisciplineFilter(f.id as any)}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                    disciplineFilter === f.id
                      ? "bg-bronze-glow text-midnight border-bronze-glow shadow-sm"
                      : "bg-midnight-card border-midnight-line text-mist hover:text-cream"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-mist">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-baize-light/40 border border-baize-light" />
                Active Play
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber/40 border border-amber" />
                Reserved Booking
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-700/40 border border-slate-600" />
                Maintenance
              </span>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="bg-midnight-card rounded-2xl border border-midnight-line overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <div className="min-w-[900px] p-5">
                {/* Time Axis Header */}
                <div className="grid grid-cols-16 border-b border-midnight-line pb-2.5 text-[11px] font-mono font-bold text-mist text-center">
                  <div className="text-left font-sans uppercase tracking-wider text-[10px]">Table</div>
                  {hours.map((h) => {
                    const label = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
                    return (
                      <div key={h} className="border-l border-midnight-line/50">
                        {label}
                      </div>
                    );
                  })}
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-midnight-line/70">
                  {displayTables.map((table) => {
                    // Find active sessions on this table today
                    const tableSessions = sessions.filter(
                      (s) => s.table_id === table.id && s.started_at.startsWith(selectedDate)
                    );

                    // Find bookings on this table today
                    const tableBookings = bookings.filter((b) => {
                      if (b.table_id !== table.id) return false;
                      if (b.status === "cancelled" || b.status === "completed") return false;
                      const clean = b.during.replace(/[\[\]\(\)"]/g, "");
                      const [startStr] = clean.split(",");
                      return startStr && startStr.startsWith(selectedDate);
                    });

                    return (
                      <div key={table.id} className="grid grid-cols-16 items-center py-3.5 group hover:bg-midnight/30 transition-colors">
                        {/* Table Header Cell */}
                        <div className="pr-3">
                          <div className="font-display text-sm font-bold text-cream">
                            {table.name}
                          </div>
                          <div className="text-[10px] text-bronze-glow uppercase tracking-wider">
                            {table.type === "snooker" ? "Snooker" : "Pool"} · ₹{table.hourly_rate}/hr
                          </div>
                        </div>

                        {/* 15 Hour Columns */}
                        {hours.map((h) => {
                          const hourStartMs = new Date(`${selectedDate}T${String(h).padStart(2, "0")}:00:00+05:30`).getTime();
                          const hourEndMs = hourStartMs + 60 * 60 * 1000;

                          // Check if any session covers this hour
                          const matchedSession = tableSessions.find((s) => {
                            const sStart = new Date(s.started_at).getTime();
                            const sEnd = s.ended_at ? new Date(s.ended_at).getTime() : sStart + (60 + s.extra_minutes) * 60000;
                            return sStart < hourEndMs && sEnd > hourStartMs;
                          });

                          // Check if any booking covers this hour
                          const matchedBooking = tableBookings.find((b) => {
                            const clean = b.during.replace(/[\[\]\(\)"]/g, "");
                            const [startStr, endStr] = clean.split(",");
                            if (!startStr || !endStr) return false;
                            const bStart = new Date(startStr).getTime();
                            const bEnd = new Date(endStr).getTime();
                            return bStart < hourEndMs && bEnd > hourStartMs;
                          });

                          return (
                            <div
                              key={h}
                              className="h-10 border-l border-midnight-line/40 px-0.5 flex items-center justify-center relative"
                            >
                              {table.status === "maintenance" ? (
                                <div
                                  onClick={() =>
                                    setSelectedBlock({
                                      type: "maintenance",
                                      title: table.name,
                                      subtitle: "Under Scheduled Maintenance",
                                      timeRange: "Full Shift Downtime",
                                    })
                                  }
                                  className="w-full h-8 rounded-lg bg-slate-800/80 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-300 cursor-pointer hover:bg-slate-700"
                                >
                                  Maint
                                </div>
                              ) : matchedSession ? (
                                <div
                                  onClick={() =>
                                    setSelectedBlock({
                                      type: "session",
                                      title: `Session: ${table.name}`,
                                      subtitle: `Session ID: ${matchedSession.id}`,
                                      timeRange: `${formatTimeIST(new Date(matchedSession.started_at))} – ${matchedSession.ended_at ? formatTimeIST(new Date(matchedSession.ended_at)) : "In Play"}`,
                                      details: matchedSession,
                                    })
                                  }
                                  className="w-full h-8 rounded-lg bg-baize-light/30 border border-baize-light/80 text-baize-light flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-baize-light/40 transition-all shadow-sm"
                                  title={`In Play: Started ${formatTimeIST(new Date(matchedSession.started_at))}`}
                                >
                                  Active
                                </div>
                              ) : matchedBooking ? (
                                <div
                                  onClick={() =>
                                    setSelectedBlock({
                                      type: "booking",
                                      title: `Reservation: ${matchedBooking.guest_name || "Guest"}`,
                                      subtitle: `Code: ${matchedBooking.booking_code}`,
                                      timeRange: `${matchedBooking.guest_phone || "Contact on file"}`,
                                      details: matchedBooking,
                                    })
                                  }
                                  className="w-full h-8 rounded-lg bg-amber/25 border border-amber/80 text-amber flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-amber/35 transition-all shadow-sm"
                                  title={`Booked for ${matchedBooking.guest_name}`}
                                >
                                  Booked
                                </div>
                              ) : (
                                <div className="w-full h-8 rounded-lg border border-transparent hover:border-baize-light/30 hover:bg-baize-light/5 transition-all cursor-pointer flex items-center justify-center text-[10px] text-mist/30">
                                  —
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Block Quick Inspector Card */}
          {selectedBlock && (
            <div className="bg-midnight-card border border-bronze-glow/40 rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-bronze-glow/15 border border-bronze-glow/30 flex items-center justify-center text-bronze-glow shrink-0">
                  {selectedBlock.type === "session" ? (
                    <Clock className="w-5 h-5 text-baize-light" />
                  ) : selectedBlock.type === "booking" ? (
                    <CalendarIcon className="w-5 h-5 text-amber" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-cream">{selectedBlock.title}</h4>
                  <p className="text-xs text-mist">{selectedBlock.subtitle}</p>
                  <p className="text-xs font-mono text-bronze-glow mt-0.5">{selectedBlock.timeRange}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/staff">
                  <Button variant="primary-dark" size="sm" className="text-xs font-bold">
                    Floor Actions
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBlock(null)}
                  className="text-mist hover:text-cream border border-midnight-line text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
