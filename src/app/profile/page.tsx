"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/store/authContext";
import { venueStore } from "@/lib/store/venueStore";
import { Booking, GameTable } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { useSessionTimer } from "@/lib/realtime/useSessionTimer";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import {
  User,
  Phone,
  Mail,
  Calendar,
  KeyRound,
  Clock,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  Coffee,
} from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";

function ActiveTimerDisplay({ startedAt }: { startedAt: string }) {
  const { formattedElapsed, isOvertime } = useSessionTimer(startedAt, 60);

  return (
    <div className="bg-midnight-card border border-bronze-glow/40 p-4 rounded-xl flex items-center justify-between text-cream">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full bg-baize-light animate-ping" />
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-mist">
            LIVE FLOOR SESSION
          </span>
          <div className="text-sm font-semibold text-cream">Elapsed Match Time</div>
        </div>
      </div>
      <div className="font-mono text-3xl font-black text-bronze-glow tabular-nums">
        {formattedElapsed}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setBookings(venueStore.getBookings());
    setTables(venueStore.getTables());
    const unsub = venueStore.subscribe(() => {
      setBookings(venueStore.getBookings());
      setTables(venueStore.getTables());
    });
    return unsub;
  }, []);

  const toggleRevealPin = (id: string) => {
    setRevealedPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTableName = (tableId: string) => {
    return tables.find((t) => t.id === tableId)?.name || "Table";
  };

  // Find running session for user's checked-in booking
  const runningSessions = venueStore.getSessions().filter((s) => !s.ended_at);

  return (
    <div className="min-h-screen bg-cream-soft py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="light" />
        </div>

        {/* User Card */}
        <div className="bg-cream-card rounded-2xl p-6 sm:p-8 border border-black/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-baize text-cream flex items-center justify-center font-display text-2xl font-bold border border-baize-dark shadow-sm">
              {user ? user.name.charAt(0).toUpperCase() : "G"}
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold text-midnight">
                {user ? user.name : "Guest Player"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-ash">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-bronze" /> {user?.email || "guest@cuenation.club"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-bronze" /> {user?.phone || "+91 98765 43210"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-baize/10 text-baize font-bold uppercase text-[10px]">
                  {user?.role || "Customer"}
                </span>
              </div>
            </div>
          </div>

          <Link href="/book">
            <Button variant="primary" size="md" className="gap-2 self-start sm:self-auto">
              <Calendar className="w-4 h-4" /> Book Table
            </Button>
          </Link>
        </div>

        {/* Bookings Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-midnight">
              My Reservations & Passes
            </h2>
            <span className="text-xs text-ash font-medium">
              {bookings.length} Total Bookings
            </span>
          </div>

          {bookings.length === 0 ? (
            <Card variant="light" className="text-center py-12 space-y-3">
              <Calendar className="w-10 h-10 text-ash/40 mx-auto" />
              <div className="font-display font-bold text-lg text-midnight">
                No bookings yet
              </div>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Your first rack is waiting. Pick your preferred table and reserve an hourly slot.
              </p>
              <Link href="/book">
                <Button variant="primary" size="sm" className="mt-2">
                  Reserve a Table
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isRevealed = revealedPins[booking.id];
                const activeSession = runningSessions.find(
                  (s) => s.booking_id === booking.id
                );

                const cleanRange = booking.during.replace(/[\[\]\(\)"]/g, "");
                const [startStr] = cleanRange.split(",");
                const formattedDate = startStr ? formatDateIST(startStr) : "Upcoming";
                const formattedTime = startStr ? formatTimeIST(startStr) : "Slot";

                return (
                  <Card
                    key={booking.id}
                    variant="light"
                    className="p-6 border border-black/10 hover:border-bronze/40 transition-all space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-bronze uppercase tracking-wider">
                            {booking.booking_code}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize bg-black/5 text-ash">
                            {booking.status.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-midnight mt-1">
                          {getTableName(booking.table_id)}
                        </h3>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-xs text-ash">{formattedDate}</div>
                        <div className="text-sm font-semibold text-midnight">
                          {formattedTime}
                        </div>
                      </div>
                    </div>

                    {/* Active Running Session Clock */}
                    {activeSession && (
                      <ActiveTimerDisplay startedAt={activeSession.started_at} />
                    )}

                    {/* PIN and Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-bronze/10 text-bronze">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-ash">
                            Check-in PIN
                          </span>
                          <div className="font-mono text-xl font-black text-midnight tracking-wider">
                            {isRevealed ? (
                              booking.pin_hash
                            ) : (
                              "••••••"
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleRevealPin(booking.id)}
                          className="p-1.5 text-ash hover:text-midnight rounded-lg hover:bg-black/5 transition-colors cursor-pointer ml-1"
                          title={isRevealed ? "Hide PIN" : "Reveal PIN"}
                        >
                          {isRevealed ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        {isRevealed && (
                          <button
                            onClick={() => copyPin(booking.pin_hash, booking.id)}
                            className="p-1.5 text-ash hover:text-midnight rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                            title="Copy PIN"
                          >
                            {copiedId === booking.id ? (
                              <Check className="w-4 h-4 text-baize" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="font-display text-lg font-bold text-bronze tabular-nums">
                          ₹{booking.amount}
                        </div>
                        {activeSession && (
                          <Link href={`/t/${booking.table_id}.demo/menu`}>
                            <Button variant="secondary" size="sm" className="gap-1.5">
                              <Coffee className="w-3.5 h-3.5 text-bronze" /> Order Food
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
