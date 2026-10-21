"use client";

import React, { useState, useEffect } from "react";
import { StaffNav } from "@/components/staff/StaffNav";
import { venueStore } from "@/lib/store/venueStore";
import { Booking } from "@/types/database";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  KeyRound,
} from "lucide-react";

interface CustomerAgg {
  name: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string;
  latestBooking?: Booking;
}

export default function StaffCustomersPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const reload = () => {
    setBookings(venueStore.getBookings());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  // Aggregate customer details from bookings
  const customerMap = new Map<string, CustomerAgg>();

  bookings.forEach((b) => {
    const key = (b.guest_phone || b.guest_name || "Unknown").trim().toLowerCase();
    const clean = b.during.replace(/[\[\]\(\)"]/g, "");
    const [startStr] = clean.split(",");

    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: b.guest_name || "Guest Cueist",
        phone: b.guest_phone || "—",
        totalBookings: 1,
        totalSpent: b.amount,
        lastBookingDate: startStr || b.created_at,
        latestBooking: b,
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.totalBookings += 1;
      existing.totalSpent += b.amount;
    }
  });

  const customerList = Array.from(customerMap.values()).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <Users className="w-3.5 h-3.5" />
                Floor Concierge Registry
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Customer Directory & Profiles
              </h1>
            </div>

            <div className="text-xs text-mist font-semibold">
              Total Recorded Cueists: <strong className="text-cream">{customerList.length}</strong>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-midnight-card p-4 rounded-2xl border border-midnight-line shadow-md max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name or phone number..."
                className="w-full bg-midnight border border-midnight-line rounded-xl pl-9 pr-4 py-2 text-xs text-cream placeholder-mist/40 focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
              <Search className="w-4 h-4 text-mist absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Player Name</th>
                    <th className="py-3.5 px-4">Mobile Contact</th>
                    <th className="py-3.5 px-4">Total Reservations</th>
                    <th className="py-3.5 px-4">Lifetime Spend</th>
                    <th className="py-3.5 px-4">Active Booking Status</th>
                    <th className="py-3.5 px-4 text-right">Floor Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {customerList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-mist">
                        No customer profiles match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    customerList.map((cust, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-cream">
                          {cust.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-mist">
                          {cust.phone}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-cream">
                          {cust.totalBookings}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-bronze-glow">
                          ₹{cust.totalSpent}
                        </td>
                        <td className="py-3.5 px-4">
                          {cust.latestBooking ? (
                            <div className="flex flex-col gap-1">
                              <StatusBadge status={cust.latestBooking.status} isDark />
                              {(() => {
                                const mem = venueStore.getCustomerMemberships().find(
                                  (m) => m.customer_phone.replace(/\D/g, "") === cust.phone.replace(/\D/g, "") && m.active
                                );
                                if (!mem) return null;
                                return (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                                    ★ {mem.plan_name} ({mem.points_balance} pts)
                                  </span>
                                );
                              })()}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Link
                            href={`/staff?guestName=${encodeURIComponent(cust.name)}&guestPhone=${encodeURIComponent(cust.phone)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brass/20 hover:bg-brass/30 text-brass border border-brass/40 text-[11px] font-bold transition"
                            title="Quick repeat walk-in booking"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Repeat</span>
                          </Link>
                          {cust.latestBooking?.status === "confirmed" && (
                            <Link href="/staff/bookings">
                              <Button variant="primary-dark" size="sm" className="gap-1 text-xs font-bold">
                                <KeyRound className="w-3 h-3" />
                                Check-in
                              </Button>
                            </Link>
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
    </div>
  );
}
