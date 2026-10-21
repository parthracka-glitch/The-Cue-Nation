"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { venueStore } from "@/lib/store/venueStore";
import { useAuth } from "@/lib/store/authContext";
import { GameTable, Booking } from "@/types/database";
import { generateDaySlots, TimeSlot, formatTimeIST, formatDateIST } from "@/lib/time";
import confetti from "canvas-confetti";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Check,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";
import { BackButton } from "@/components/ui/BackButton";

function BookingContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<GameTable | null>(null);

  // Selected date (default today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Guest details form
  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{ booking: Booking; pin: string } | null>(null);
  const [hasCopiedPin, setHasCopiedPin] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Load tables
  useEffect(() => {
    const list = venueStore.getTables();
    setTables(list);

    const initialTableId = searchParams.get("poolId") || searchParams.get("tableId");
    if (initialTableId) {
      const match = list.find((t) => t.id === initialTableId);
      if (match) {
        setSelectedTable(match);
        setStep(2);
      }
    }

    const unsub = venueStore.subscribe(() => {
      setTables(venueStore.getTables());
    });
    return unsub;
  }, [searchParams]);

  // Update slots when date or table changes
  useEffect(() => {
    const slots = generateDaySlots(selectedDate);
    setAvailableSlots(slots);
  }, [selectedDate, selectedTable]);

  // Check if slot is booked
  const isSlotBooked = (slot: TimeSlot) => {
    if (!selectedTable) return false;
    const allBookings = venueStore.getBookings();
    const slotStartMs = new Date(slot.startISO).getTime();
    const slotEndMs = new Date(slot.endISO).getTime();

    return allBookings.some((b) => {
      if (b.table_id !== selectedTable.id) return false;
      if (b.status === "cancelled" || b.status === "no_show") return false;

      // Extract interval [start, end)
      const clean = b.during.replace(/[\[\]\(\)"]/g, "");
      const [startStr, endStr] = clean.split(",");
      if (!startStr || !endStr) return false;

      const bStartMs = new Date(startStr).getTime();
      const bEndMs = new Date(endStr).getTime();
      return slotStartMs < bEndMs && slotEndMs > bStartMs;
    });
  };

  const handleTableSelect = (t: GameTable) => {
    setSelectedTable(t);
    setStep(2);
  };

  const handleSlotSelect = (s: TimeSlot) => {
    if (isSlotBooked(s)) return;
    setSelectedSlot(s);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTable || !selectedSlot) return;

    setIsSubmitting(true);
    const hourlyRate = (selectedTable as any).hourly_rate || (selectedTable.type === "snooker" ? 450 : 350);

    try {
      // 1. Post to backend API for atomic anti-double-booking validation & DB persistence
      const apiRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTable.id,
          startISO: selectedSlot.startISO,
          endISO: selectedSlot.endISO,
          guestName: guestName.trim() || "Guest Cueist",
          guestPhone: guestPhone.trim() || "+91 98765 43210",
          guestEmail: user?.email || undefined,
          source: "online",
          userId: user?.id,
          paymentMethod: "pay_at_desk",
        }),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        setConfirmedBooking({
          booking: data.booking,
          pin: data.rawPin || data.pin || "000000",
        });
        venueStore.refresh();
      } else {
        // Fallback to local venueStore
        const result = venueStore.createBooking({
          tableId: selectedTable.id,
          startISO: selectedSlot.startISO,
          endISO: selectedSlot.endISO,
          guestName: guestName.trim() || "Guest Cueist",
          guestPhone: guestPhone.trim() || "+919876543210",
          amount: hourlyRate,
          source: "online",
          userId: user?.id,
        });
        setConfirmedBooking(result);
      }

      setStep(4);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#B8925A", "#0A5551", "#EDDFC2"],
        });
      } catch {
        // ignore
      }
    } catch {
      const result = venueStore.createBooking({
        tableId: selectedTable.id,
        startISO: selectedSlot.startISO,
        endISO: selectedSlot.endISO,
        guestName: guestName.trim() || "Guest Cueist",
        guestPhone: guestPhone.trim() || "+919876543210",
        amount: hourlyRate,
        source: "online",
        userId: user?.id,
      });
      setConfirmedBooking(result);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: "pin" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "pin") {
      setHasCopiedPin(true);
      setTimeout(() => setHasCopiedPin(false), 2000);
    } else {
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-cream-soft py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <BackButton fallbackHref="/" label="Back to Home" variant="light" />
          {step > 1 && step <= 3 && (
            <button
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 hover:border-bronze text-xs font-semibold text-ash hover:text-midnight bg-white shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-bronze" />
              <span>Previous Step</span>
            </button>
          )}
        </div>

        {/* Header and Step Progress */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-baize">
            Live Booking Engine
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-midnight">
            Reserve Your Rack
          </h1>
          <p className="text-sm text-ash max-w-md mx-auto">
            Realtime slot reservation protected against overlapping bookings. Show your 6-digit PIN on arrival.
          </p>

          {/* Stepper (Steps 1, 2, 3) */}
          {step <= 3 && (
            <div className="flex items-center justify-center gap-2 sm:gap-4 pt-4 max-w-md mx-auto">
              {[
                { s: 1, label: "Table" },
                { s: 2, label: "Date & Slot" },
                { s: 3, label: "Confirm" },
              ].map((item, idx) => (
                <React.Fragment key={item.s}>
                  <div
                    onClick={() => {
                      if (item.s < step) setStep(item.s as 1 | 2 | 3);
                    }}
                    className={clsx(
                      "flex items-center gap-2 cursor-pointer select-none",
                      step === item.s
                        ? "text-bronze font-bold"
                        : step > item.s
                        ? "text-baize font-medium"
                        : "text-ash/50"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        step === item.s
                          ? "bg-bronze text-cream shadow-sm"
                          : step > item.s
                          ? "bg-baize text-cream"
                          : "bg-black/10 text-ash"
                      )}
                    >
                      {step > item.s ? "✓" : item.s}
                    </div>
                    <span className="text-xs hidden sm:inline">{item.label}</span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={clsx(
                        "h-0.5 w-8 sm:w-12 transition-colors",
                        step > item.s ? "bg-baize" : "bg-black/10"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* STEP 1: SELECT TABLE */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="font-display text-xl font-bold text-midnight">
              Step 1: Choose Your Table
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tables.map((t) => {
                const isSnooker = t.type === "snooker";
                const hourlyRate = isSnooker ? 450 : 300;
                return (
                  <Card
                    key={t.id}
                    variant="light"
                    className="p-5 flex flex-col justify-between hover:border-bronze hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleTableSelect(t)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-baize">
                          {isSnooker ? "Full Size Snooker" : "Tournament 9ft Pool"}
                        </span>
                        <h3 className="font-display text-lg font-bold text-midnight group-hover:text-bronze mt-0.5">
                          {t.name}
                        </h3>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>

                    <div className="my-4 text-xs text-ash">
                      {isSnooker
                        ? "Strachan 6811 baize, precision Aramith balls & tournament lighting."
                        : "Laser leveled slate, fast felt, and matched cue sets."}
                    </div>

                    <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                      <div className="font-display text-lg font-bold text-bronze tabular-nums">
                        ₹{hourlyRate}
                        <span className="text-xs font-normal text-ash">/hour</span>
                      </div>
                      <Button variant="primary" size="sm" className="gap-1.5">
                        Select Slot
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT DATE & TIME SLOT */}
        {step === 2 && selectedTable && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-cream-card border border-black/10">
              <div>
                <span className="text-xs text-ash">Selected Table:</span>
                <div className="font-display font-bold text-lg text-midnight">
                  {selectedTable.name}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="self-start sm:self-auto text-xs gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Change Table
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg sm:text-xl font-bold text-midnight">
                  Step 2: Choose Slot for {formatDateIST(selectedDate)}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() - 1);
                      if (d >= new Date(new Date().setHours(0, 0, 0, 0))) {
                        setSelectedDate(d);
                      }
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-xs font-bold touch-manipulation min-h-[38px] flex items-center justify-center cursor-pointer"
                  >
                    ← Previous Day
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() + 1);
                      setSelectedDate(d);
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-xs font-bold touch-manipulation min-h-[38px] flex items-center justify-center cursor-pointer"
                  >
                    Next Day →
                  </button>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {availableSlots.map((slot) => {
                  const booked = isSlotBooked(slot);
                  const isSelected = selectedSlot?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      disabled={booked}
                      onClick={() => handleSlotSelect(slot)}
                      className={clsx(
                        "p-3.5 rounded-xl border text-left transition-all cursor-pointer relative",
                        booked
                          ? "bg-black/5 border-black/10 text-ash/50 line-through cursor-not-allowed opacity-60"
                          : isSelected
                          ? "bg-bronze text-cream border-bronze shadow-md ring-2 ring-bronze ring-offset-2"
                          : "bg-cream-card border-black/10 text-midnight hover:border-bronze hover:bg-cream"
                      )}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{slot.displayStart}</span>
                        {slot.isPeak && !booked && (
                          <span
                            className={clsx(
                              "text-[9px] uppercase px-1.5 py-0.5 rounded font-bold",
                              isSelected
                                ? "bg-bronze-glow text-midnight"
                                : "bg-amber/20 text-amber-text"
                            )}
                          >
                            Peak
                          </span>
                        )}
                        {booked && (
                          <span className="text-[10px] text-cue font-bold uppercase no-underline">
                            Booked
                          </span>
                        )}
                      </div>
                      <div
                        className={clsx(
                          "text-[11px] mt-1",
                          isSelected ? "text-cream/80" : "text-ash"
                        )}
                      >
                        1 Hour Duration
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DETAILS & REVIEW */}
        {step === 3 && selectedTable && selectedSlot && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="font-display text-xl font-bold text-midnight">
              Step 3: Confirm Booking Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Form Input */}
              <div className="md:col-span-2 space-y-4 bg-cream-card p-6 rounded-2xl border border-black/10 shadow-sm">
                <h3 className="font-bold text-sm text-midnight uppercase tracking-wider">
                  Guest Information
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ash flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-bronze" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter player name"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-baize"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ash flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-bronze" /> Phone Number (For PIN SMS / WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-baize"
                  />
                </div>

                <div className="p-3 rounded-xl bg-baize/10 border border-baize/20 text-xs text-baize flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Your 6-digit PIN will be generated automatically upon confirmation. Show this PIN to staff on the floor to start your session clock.
                  </span>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-midnight text-cream p-6 rounded-2xl border border-midnight-line space-y-5 flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="font-display font-bold text-lg text-cream border-b border-midnight-line pb-3">
                    Booking Summary
                  </h3>

                  <div className="mt-4 space-y-3 text-xs text-mist">
                    <div className="flex justify-between">
                      <span>Table</span>
                      <span className="font-semibold text-cream text-right">
                        {selectedTable.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="font-semibold text-cream">
                        {formatDateIST(selectedDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slot Time</span>
                      <span className="font-semibold text-cream">
                        {selectedSlot.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="font-semibold text-cream">60 Minutes</span>
                    </div>
                    <div className="flex justify-between border-t border-midnight-line pt-3 text-sm">
                      <span className="text-cream font-bold">Total Payable</span>
                      <span className="font-display text-lg font-bold text-bronze-glow tabular-nums">
                        ₹{selectedTable.type === "snooker" ? 450 : 300}
                      </span>
                    </div>
                    <p className="text-[10px] text-mist/70 italic text-right">
                      *Pay at venue via Cash, UPI, or Card
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    variant="primary-dark"
                    size="lg"
                    className="w-full shadow-lamp"
                    isLoading={isSubmitting}
                    onClick={handleConfirmBooking}
                  >
                    Confirm & Generate PIN
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-mist text-xs"
                    onClick={() => setStep(2)}
                  >
                    Back to Slot Selection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION & SECRET PIN CARD */}
        {step === 4 && confirmedBooking && (
          <div className="max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-baize/20 border-2 border-baize text-baize flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="font-display text-3xl font-bold text-midnight">
                You&apos;re Booked!
              </h2>
              <p className="text-sm text-ash">
                Your table is reserved. Show this PIN to the staff concierge at the parlour desk.
              </p>
            </div>

            {/* Secret PIN Pass Card */}
            <div className="bg-midnight text-cream p-7 rounded-2xl border-2 border-bronze-glow shadow-2xl relative overflow-hidden space-y-6">
              {/* Background badge */}
              <div className="flex items-center justify-between border-b border-midnight-line pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-mist">
                    CONFIRMATION PASS
                  </span>
                  <div className="font-display text-xl font-bold text-cream">
                    Cue Nation Parlour
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-mist">
                    BOOKING CODE
                  </span>
                  <div className="font-mono text-base font-bold text-bronze-glow flex items-center gap-1.5">
                    {confirmedBooking.booking.booking_code}
                    <button
                      onClick={() =>
                        copyToClipboard(confirmedBooking.booking.booking_code, "code")
                      }
                      className="p-1 hover:text-cream text-mist cursor-pointer"
                      title="Copy code"
                    >
                      {hasCopiedCode ? (
                        <Check className="w-3.5 h-3.5 text-baize-light" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* BIG PIN HIGHLIGHT */}
              <div className="bg-midnight-card rounded-xl p-5 border border-midnight-line text-center space-y-2">
                <span className="text-xs uppercase font-bold text-bronze-glow tracking-widest flex items-center justify-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> 6-DIGIT CHECK-IN PIN
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-black tracking-[0.25em] text-cream tabular-nums">
                  {confirmedBooking.pin}
                </div>
                <p className="text-[11px] text-mist">
                  Shown once now and securely retrievable in your profile
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary-dark"
                    size="sm"
                    onClick={() => copyToClipboard(confirmedBooking.pin, "pin")}
                    className="gap-1.5 text-xs"
                  >
                    {hasCopiedPin ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> PIN Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy PIN to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Table and Time Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs text-mist border-t border-midnight-line pt-4">
                <div>
                  <span className="text-mist/70">Table</span>
                  <div className="text-cream font-bold mt-0.5">
                    {selectedTable?.name}
                  </div>
                </div>
                <div>
                  <span className="text-mist/70">Slot & Date</span>
                  <div className="text-cream font-bold mt-0.5">
                    {selectedSlot?.label} · {formatDateIST(selectedDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => (window.location.href = "/profile")}
                className="w-full gap-2"
              >
                <User className="w-4 h-4" /> View in My Profile
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setStep(1);
                  setSelectedSlot(null);
                  setConfirmedBooking(null);
                }}
                className="w-full gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Book Another Table
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-soft p-12 text-center flex items-center justify-center">
          <div className="animate-pulse text-baize font-bold">Loading Booking Engine...</div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
