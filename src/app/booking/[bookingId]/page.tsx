"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Booking, GameTable, Session } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { venueStore } from "@/lib/store/venueStore";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import QRCode from "qrcode";
import {
  Calendar,
  Clock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Receipt,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [table, setTable] = useState<GameTable | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [pinRevealed, setPinRevealed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadBooking = () => {
    // Try from venueStore first
    const allBookings = venueStore.getBookings();
    const found = allBookings.find(
      (b) => b.id === bookingId || b.booking_code.toUpperCase() === bookingId.toUpperCase()
    );

    if (found) {
      setBooking(found);
      const tbl = venueStore.getTables().find((t) => t.id === found.table_id);
      setTable(tbl || null);
      const sess = venueStore.getSessions().find((s) => s.booking_id === found.id);
      setSession(sess || null);
      setIsLoading(false);

      // Generate QR Code
      QRCode.toDataURL(found.booking_code, { width: 220, margin: 1 })
        .then(setQrDataUrl)
        .catch(() => {});
    } else {
      // Fallback to fetch from /api/bookings/[id]
      fetch(`/api/bookings/${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.booking) {
            setBooking(data.booking);
            setTable(data.table || null);
            setSession(data.session || null);
            QRCode.toDataURL(data.booking.booking_code, { width: 220, margin: 1 })
              .then(setQrDataUrl)
              .catch(() => {});
          }
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    loadBooking();
    const unsub = venueStore.subscribe(loadBooking);
    return unsub;
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-soft flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-bronze border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-ash font-medium">Retrieving booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-cream-soft flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 bg-white rounded-2xl shadow-card">
          <AlertTriangle className="w-12 h-12 text-amber mx-auto" />
          <h2 className="font-display text-2xl font-bold text-midnight">Reservation Not Found</h2>
          <p className="text-ash text-sm">
            We could not find a reservation matching identifier &quot;{bookingId}&quot;. Please verify your booking reference.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link href="/my-bookings">
              <Button variant="primary" className="w-full">
                Look Up My Bookings
              </Button>
            </Link>
            <Link href="/booking">
              <Button variant="outline" className="w-full">
                Make a New Booking
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Parse time interval
  const clean = booking.during.replace(/[\[\]\(\)"]/g, "");
  const [startStr, endStr] = clean.split(",");
  const startDate = startStr ? new Date(startStr) : new Date();
  const endDate = endStr ? new Date(endStr) : new Date();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.booking_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: cancelReason }),
      });
      if (res.ok) {
        setCancelModal(false);
        loadBooking();
      }
    } catch {
      // ignore
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Back Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BackButton fallbackHref="/my-bookings" label="My Bookings" variant="light" />
          <BackButton fallbackHref="/" label="Home" variant="light" />
        </div>

        {/* Status Stepper Card */}
        <Card className="bg-white rounded-3xl p-6 sm:p-8 border-black/10 shadow-card space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-bronze">
                Booking Reference
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="font-mono text-3xl sm:text-4xl font-black text-midnight tracking-tight">
                  {booking.booking_code}
                </h1>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg border border-black/10 hover:bg-cream-soft text-ash transition-all"
                  title="Copy Reference"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-baize" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={booking.status} />
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-baize/10 text-baize">
                Confirmed Slot
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <div className="text-xs text-ash">Allocated Table</div>
              <div className="font-display text-lg font-bold text-midnight">
                {table ? table.name : "Championship Table"}
              </div>
              <div className="text-xs text-bronze font-medium capitalize">
                {table?.type === "snooker" ? "12ft Tournament Snooker" : "9ft Match Pool"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-ash">Date & Scheduled Time</div>
              <div className="font-semibold text-midnight">
                {formatDateIST(startDate)}
              </div>
              <div className="text-xs text-ash font-mono">
                {formatTimeIST(startDate)} — {formatTimeIST(endDate)} (IST)
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-ash">Primary Guest</div>
              <div className="font-semibold text-midnight">{booking.guest_name || "Guest"}</div>
              <div className="text-xs text-ash font-mono">{booking.guest_phone || "—"}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-ash">Authoritative Price</div>
              <div className="font-mono text-xl font-bold text-baize">
                ₹{booking.amount}
              </div>
              <div className="text-xs text-ash">Payment: Pay at Venue / Settled</div>
            </div>
          </div>

          {/* PIN & QR Check-in Box */}
          <div className="bg-midnight rounded-2xl p-6 sm:p-8 text-cream border border-midnight-line flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 text-center md:text-left">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-bronze-glow">
                  Concierge Check-in Verification
                </span>
                <h3 className="font-display text-xl font-bold text-cream mt-0.5">
                  Arrival Check-in PIN
                </h3>
                <p className="text-mist text-xs leading-relaxed max-w-sm mt-1">
                  Show this PIN or QR code to the floor concierge upon arrival to immediately allocate and start your table session.
                </p>
              </div>

              {/* Reveal PIN */}
              <div className="inline-flex items-center gap-3 bg-midnight-card border border-midnight-line px-4 py-2.5 rounded-xl">
                <KeyRound className="w-5 h-5 text-bronze-glow" />
                <span className="font-mono text-2xl font-black tracking-widest text-cream">
                  {pinRevealed ? "441199" : "••••••"}
                </span>
                <button
                  onClick={() => setPinRevealed(!pinRevealed)}
                  className="text-mist hover:text-cream text-xs flex items-center gap-1 pl-2 border-l border-midnight-line"
                >
                  {pinRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {pinRevealed ? "Hide" : "Reveal PIN"}
                </button>
              </div>
            </div>

            {/* QR Code */}
            {qrDataUrl && (
              <div className="bg-white p-3 rounded-2xl shrink-0 shadow-lg border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="Booking QR" className="w-32 h-32" />
                <div className="text-center text-[10px] text-midnight font-bold font-mono mt-1">
                  SCAN AT FLOOR
                </div>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          {booking.status === "confirmed" && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModal(true)}
                className="text-cue-light border-cue-light/20 hover:bg-cue-light/10"
              >
                Cancel Reservation
              </Button>
            </div>
          )}
        </Card>

        {/* Cancellation Modal */}
        <Modal
          isOpen={cancelModal}
          onClose={() => setCancelModal(false)}
          title="Cancel Reservation"
        >
          <div className="space-y-4">
            <p className="text-sm text-ash leading-relaxed">
              Are you sure you want to cancel booking <strong>{booking.booking_code}</strong>? Your table slot will be
              released for other players.
            </p>
            <div>
              <label className="block text-xs font-semibold text-ash mb-1">
                Reason for cancellation (optional):
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Change of schedule, unwell, etc."
                className="w-full px-3 py-2 border border-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" size="sm" onClick={() => setCancelModal(false)}>
                Keep Reservation
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="bg-cue-light hover:bg-cue-dark"
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
