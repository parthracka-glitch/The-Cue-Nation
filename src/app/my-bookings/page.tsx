"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/store/authContext";
import { venueStore } from "@/lib/store/venueStore";
import { Booking, GameTable } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import {
  Calendar,
  Search,
  KeyRound,
  ExternalLink,
  Plus,
  AlertCircle,
  Clock,
  Phone,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"account" | "lookup">("account");

  useEffect(() => {
    setAllBookings(venueStore.getBookings());
    setTables(venueStore.getTables());
    const unsub = venueStore.subscribe(() => {
      setAllBookings(venueStore.getBookings());
      setTables(venueStore.getTables());
    });
    return unsub;
  }, []);

  // Filter bookings for user or searched guest
  const userBookings = allBookings.filter((b) => {
    if (activeTab === "account") {
      if (!user) return true; // show all local bookings if not strictly bound
      return b.user_id === user.id || b.guest_name === user.name;
    } else {
      if (!searchQuery.trim()) return false;
      const q = searchQuery.trim().toLowerCase();
      return (
        b.booking_code.toLowerCase().includes(q) ||
        (b.guest_phone && b.guest_phone.includes(q))
      );
    }
  });

  const getTableName = (tableId: string) => {
    return tables.find((t) => t.id === tableId)?.name || "Championship Table";
  };

  return (
    <div className="min-h-screen bg-cream-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Back Navigation */}
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="light" />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-midnight tracking-tight">
               My Reservations
            </h1>
            <p className="text-ash text-sm mt-1">
              View upcoming table slots, retrieve check-in PINs, or lookup guest reservations.
            </p>
          </div>
          <Link href="/book">
            <Button variant="primary" size="sm" className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Book New Table
            </Button>
          </Link>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-3 border-b border-black/5 pb-2">
          <button
            onClick={() => setActiveTab("account")}
            className={`pb-2 px-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "account"
                ? "border-bronze text-midnight font-bold"
                : "border-transparent text-ash hover:text-midnight"
            }`}
          >
            My Account Bookings
          </button>
          <button
            onClick={() => setActiveTab("lookup")}
            className={`pb-2 px-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "lookup"
                ? "border-bronze text-midnight font-bold"
                : "border-transparent text-ash hover:text-midnight"
            }`}
          >
            Guest Lookup by Phone / Code
          </button>
        </div>

        {/* Guest Search Bar */}
        {activeTab === "lookup" && (
          <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-sm flex items-center gap-3">
            <Search className="w-5 h-5 text-ash shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter 10-digit mobile number or booking code (e.g. CN-A78B92)..."
              className="w-full text-sm focus:outline-none bg-transparent text-midnight"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-ash hover:text-midnight px-2"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Bookings List */}
        {userBookings.length === 0 ? (
          <Card className="bg-white rounded-3xl p-12 text-center space-y-4 border-black/10 shadow-card">
            <div className="w-12 h-12 rounded-full bg-cream-soft border border-bronze/20 flex items-center justify-center text-bronze mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-midnight">
              {activeTab === "lookup" && searchQuery
                ? "No matching reservation found"
                : "No active reservations"}
            </h3>
            <p className="text-sm text-ash max-w-md mx-auto">
              {activeTab === "lookup"
                ? "Please verify the booking code (e.g. CN-XXXXXX) or mobile number used during reservation."
                : "Reserve a championship pool or snooker table now with guaranteed zero double-booking."}
            </p>
            <div className="pt-2">
              <Link href="/booking">
                <Button variant="primary" size="md">
                  Reserve a Table Now
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {userBookings.map((b) => {
              const clean = b.during.replace(/[\[\]\(\)"]/g, "");
              const [startStr, endStr] = clean.split(",");
              const startDate = startStr ? new Date(startStr) : new Date();
              const endDate = endStr ? new Date(endStr) : new Date();

              return (
                <div
                  key={b.id}
                  className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-black text-midnight">
                        {b.booking_code}
                      </span>
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-ash font-medium">
                        {b.source === "offline" ? "Walk-In" : "Online"}
                      </span>
                    </div>

                    <div className="text-base font-semibold text-midnight">
                      {getTableName(b.table_id)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-ash">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-bronze" />
                        {formatDateIST(startDate)}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-baize" />
                        {formatTimeIST(startDate)} — {formatTimeIST(endDate)}
                      </span>
                      <span className="font-mono font-bold text-midnight">
                        ₹{b.amount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                    <Link href={`/booking/${b.id}`} className="w-full md:w-auto">
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-bronze" />
                        View PIN & Check-in
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
