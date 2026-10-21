"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StaffNav } from "@/components/staff/StaffNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { venueStore } from "@/lib/store/venueStore";
import { Booking, Session, Bill } from "@/types/database";
import { formatTimeIST, formatDateIST } from "@/lib/time";
import {
  History,
  CheckCircle2,
  Clock,
  Search,
  Calendar,
  Receipt,
  User,
  Filter,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function StaffHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "completed" | "cancelled">("all");

  const reload = () => {
    setBookings(venueStore.getBookings());
    setBills(venueStore.getBills());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filterType === "completed" && b.status !== "completed") return false;
    if (filterType === "cancelled" && b.status !== "cancelled") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.booking_code.toLowerCase().includes(q) ||
        (b.guest_name || "").toLowerCase().includes(q) ||
        (b.guest_phone || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-bronze">
              Floor Records
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Session & Check-In History
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={reload}
            className="text-ash border-midnight-line hover:text-cream self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh History
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All Records" },
              { id: "completed", label: "Completed Sessions" },
              { id: "cancelled", label: "Cancelled / No-Show" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  filterType === f.id
                    ? "bg-bronze text-midnight border-bronze font-bold"
                    : "bg-midnight-card border-midnight-line text-ash hover:text-cream"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, guest, phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-midnight-card border border-midnight-line rounded-lg text-xs text-cream placeholder-ash/50 focus:outline-none focus:border-bronze"
            />
          </div>
        </div>

        {/* History Table */}
        <Card variant="dark" className="p-0 overflow-hidden border-midnight-line">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight-card/80 border-b border-midnight-line text-ash uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Guest Info</th>
                  <th className="py-3 px-4">Table / Pool</th>
                  <th className="py-3 px-4">Time Window</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-line/60">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ash">
                      No matching records found in session history.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const table = venueStore.getTable(b.table_id);
                    return (
                      <tr key={b.id} className="hover:bg-midnight-card/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-bronze-glow">
                          {b.booking_code}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-cream">{b.guest_name}</div>
                          <div className="text-[11px] text-ash">{b.guest_phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-ash">
                          {table ? table.name : b.table_id}
                        </td>
                        <td className="py-3.5 px-4 text-ash">
                          <div>{b.booking_date || formatDateIST(b.created_at)}</div>
                          <div className="text-[11px] text-ash/70">{formatTimeIST(b.created_at)}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-cream">
                          ₹{b.amount}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              b.status === "completed"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : b.status === "checked_in"
                                ? "bg-baize/20 border-baize/40 text-baize-light"
                                : b.status === "confirmed"
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/staff/billing`}>
                            <Button size="sm" variant="ghost" className="text-xs text-ash hover:text-cream">
                              View Bill
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
        </div>
      </main>
    </div>
  );
}
