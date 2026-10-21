"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  Sparkles,
  Award,
  Layers,
  CheckCheck,
} from "lucide-react";
import clsx from "clsx";
import { BackButton } from "@/components/ui/BackButton";

function BookingContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedGameType, setSelectedGameType] = useState<"pool" | "snooker">("pool");
  const [durationHours, setDurationHours] = useState<number>(1);

  // Selected date (default today)
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Guest details form
  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [paymentMethod, setPaymentMethod] = useState<"pay_at_venue" | "online">("pay_at_venue");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{ booking: Booking; pin: string } | null>(null);
  const [hasCopiedPin, setHasCopiedPin] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Tables sync
  const [tables, setTables] = useState<GameTable[]>([]);

  useEffect(() => {
    setTables(venueStore.getTables());

    const initialType = searchParams.get("type");
    if (initialType === "snooker" || initialType === "pool") {
      setSelectedGameType(initialType);
      setStep(2);
    }

    const unsub = venueStore.subscribe(() => {
      setTables(venueStore.getTables());
    });
    return unsub;
  }, [searchParams]);

  // Update date based on offset
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDateOffset);
    setSelectedDate(d);
    setSelectedSlot(null);
  }, [selectedDateOffset]);

  // Update slots when date changes
  useEffect(() => {
    const slots = generateDaySlots(selectedDate);
    setAvailableSlots(slots);
  }, [selectedDate]);

  // Live slot capacity across the 3 tables
  const getSlotCapacity = (slot: TimeSlot) => {
    const freeCount = venueStore.getAvailableTablesCount(
      selectedGameType,
      slot.startISO,
      slot.endISO
    );
    return {
      freeCount,
      isAvailable: freeCount > 0,
    };
  };

  const hourlyRate = selectedGameType === "snooker" ? 450 : 300;
  const totalAmount = hourlyRate * durationHours;

  const handleSelectGame = (type: "pool" | "snooker") => {
    setSelectedGameType(type);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSlotSelect = (s: TimeSlot) => {
    const { isAvailable } = getSlotCapacity(s);
    if (!isAvailable) return;
    setSelectedSlot(s);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    if (!guestName.trim()) {
      alert("Please provide your name.");
      return;
    }
    if (!guestPhone.trim() || guestPhone.replace(/\D/g, "").length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find candidate table among 3 tables
      const candidateTable = venueStore.findAvailableTableForSlot(
        selectedGameType,
        selectedSlot.startISO,
        selectedSlot.endISO
      );
      const tableId = candidateTable?.id || `${selectedGameType}-1`;

      const result = venueStore.createBooking({
        tableId,
        startISO: selectedSlot.startISO,
        endISO: selectedSlot.endISO,
        guestName: guestName.trim() || "Guest Cueist",
        guestPhone: guestPhone.trim(),
        amount: totalAmount,
        source: "online",
        userId: user?.id || null,
      });

      setConfirmedBooking(result);
      setStep(4);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#C5A059", "#1B4D3E", "#E6C687", "#FFFFFF"],
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      alert(err.message || "Failed to reserve slot. Please pick another slot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: "pin" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "pin") {
      setHasCopiedPin(true);
      setTimeout(() => setHasCopiedPin(false), 2500);
    } else {
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2500);
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
            Live Booking Engine · 3 Pool & 3 Snooker Tables
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-midnight">
            Reserve Your Rack
          </h1>
          <p className="text-sm text-ash max-w-md mx-auto">
            Synchronized slot reservation across 6 tables with zero double-booking. Receive your 6-digit PIN instantly for automatic table allocation.
          </p>

          {/* Stepper (Steps 1, 2, 3) */}
          {step <= 3 && (
            <div className="flex items-center justify-center gap-2 sm:gap-4 pt-4 max-w-md mx-auto">
              {[
                { s: 1, label: "Discipline" },
                { s: 2, label: "Date & Slot" },
                { s: 3, label: "Confirm Details" },
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

        {/* STEP 1: TWO MASTER FLASHCARDS */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="font-display text-xl font-bold text-midnight text-center">
              Step 1: Choose Your Discipline (Pool or Snooker)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pool Card */}
              <div
                onClick={() => handleSelectGame("pool")}
                className="bg-midnight rounded-3xl overflow-hidden border border-midnight-line shadow-card hover:shadow-2xl hover:border-baize-light/50 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=1200&q=80"
                    alt="American Pool"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-baize text-cream text-xs font-bold px-3 py-1 rounded-full border border-baize-light/40">
                    3 Tables Available
                  </div>
                  <div className="absolute top-4 right-4 bg-midnight/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cream">
                    9ft Tournament
                  </div>
                  <div className="absolute bottom-4 left-6 right-6 flex items-baseline justify-between text-cream">
                    <div>
                      <span className="text-[10px] text-mist uppercase font-semibold">Rate</span>
                      <div className="text-2xl font-display font-black text-bronze-glow">
                        ₹300<span className="text-xs font-normal text-mist">/hour</span>
                      </div>
                    </div>
                    <span className="text-xs text-baize-light font-bold">Auto Table Allocation</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-cream group-hover:text-baize-light transition-colors">
                      American Pool
                    </h3>
                    <p className="text-xs text-mist mt-1 leading-relaxed">
                      3 Brazilian slate 9ft tables with fast felt, responsive K55 cushions, and precision drop pockets.
                    </p>
                  </div>
                  <Button variant="primary" size="md" className="w-full justify-center gap-2">
                    Select Pool Slots
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Snooker Card */}
              <div
                onClick={() => handleSelectGame("snooker")}
                className="bg-midnight rounded-3xl overflow-hidden border border-midnight-line shadow-card hover:shadow-2xl hover:border-bronze-glow/50 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=1200&q=80"
                    alt="English Snooker"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-bronze text-cream text-xs font-bold px-3 py-1 rounded-full border border-bronze-glow/40">
                    3 Tables Available
                  </div>
                  <div className="absolute top-4 right-4 bg-midnight/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cream">
                    12ft Full-Size
                  </div>
                  <div className="absolute bottom-4 left-6 right-6 flex items-baseline justify-between text-cream">
                    <div>
                      <span className="text-[10px] text-mist uppercase font-semibold">Rate</span>
                      <div className="text-2xl font-display font-black text-bronze-glow">
                        ₹450<span className="text-xs font-normal text-mist">/hour</span>
                      </div>
                    </div>
                    <span className="text-xs text-bronze-glow font-bold">Auto Table Allocation</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-cream group-hover:text-bronze-glow transition-colors">
                      English Snooker
                    </h3>
                    <p className="text-xs text-mist mt-1 leading-relaxed">
                      3 full-size 12ft championship tables with Strachan 6811 100% wool cloth & Northern rubber cushions.
                    </p>
                  </div>
                  <Button variant="primary" size="md" className="w-full justify-center gap-2">
                    Select Snooker Slots
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT DATE & TIME SLOT */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Selected Game Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-midnight text-cream border border-midnight-line shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-mist tracking-wider">
                  Selected Discipline
                </span>
                <div className="font-display font-bold text-xl text-cream">
                  {selectedGameType === "snooker" ? "🔴 English Snooker (3 Tables)" : "🎱 American Pool (3 Tables)"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-display font-bold text-bronze-glow">
                  ₹{hourlyRate}/hr
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-xs gap-1 border-white/20 text-cream hover:bg-white/10"
                >
                  <ArrowLeft className="w-3 h-3" /> Change Game
                </Button>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ash flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-bronze" />
                Select Booking Date
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((offset) => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const dayLabel = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
                  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const isSelected = selectedDateOffset === offset;

                  return (
                    <button
                      key={offset}
                      type="button"
                      onClick={() => setSelectedDateOffset(offset)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-bronze text-cream border-bronze shadow-md font-bold"
                          : "bg-white border-black/10 text-ash hover:text-midnight hover:border-bronze/40"
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wider">{dayLabel}</div>
                      <div className="text-sm font-semibold mt-0.5">{dateStr}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ash flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-bronze" />
                Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDurationHours(hrs)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      durationHours === hrs
                        ? "bg-baize text-cream border-baize shadow-sm"
                        : "bg-white border-black/10 text-ash hover:text-midnight"
                    }`}
                  >
                    {hrs} Hour{hrs > 1 ? "s" : ""} (₹{hourlyRate * hrs})
                  </button>
                ))}
              </div>
            </div>

            {/* Slots Grid with 3 Tables Capacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ash">
                  Available Slots for {formatDateIST(selectedDate)}
                </h3>
                <span className="text-[11px] text-baize font-bold">
                  ● Real-time capacity across 3 tables
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSlots.map((slot, idx) => {
                  const { freeCount, isAvailable } = getSlotCapacity(slot);
                  const isSelected = selectedSlot?.startISO === slot.startISO;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleSlotSelect(slot)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        !isAvailable
                          ? "bg-black/5 border-black/5 opacity-40 cursor-not-allowed"
                          : isSelected
                          ? "bg-bronze/10 border-bronze text-midnight ring-2 ring-bronze shadow-md"
                          : "bg-white border-black/10 text-midnight hover:border-bronze hover:shadow-sm cursor-pointer"
                      }`}
                    >
                      <div className="text-xs font-bold font-mono tracking-tight text-midnight">
                        {slot.displayStart} – {slot.displayEnd}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            !isAvailable
                              ? "bg-red-500/10 text-red-500"
                              : freeCount === 1
                              ? "bg-amber/15 text-amber-700"
                              : "bg-baize/15 text-baize"
                          }`}
                        >
                          {!isAvailable
                            ? "Sold Out"
                            : freeCount === 1
                            ? "1 Table Left!"
                            : `${freeCount}/3 Free`}
                        </span>

                        <span className="text-xs text-bronze font-bold">
                          Select →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: GUEST DETAILS & CONFIRM */}
        {step === 3 && selectedSlot && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Booking Summary Box */}
            <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ash tracking-wider">
                  Reservation Summary
                </span>
                <div className="font-display font-bold text-xl text-midnight">
                  {selectedGameType === "snooker" ? "English Snooker (3 Tables)" : "American Pool (3 Tables)"}
                </div>
                <div className="text-xs text-ash font-mono flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-baize" />
                  <span>{selectedSlot.displayStart} – {selectedSlot.displayEnd} ({formatDateIST(selectedDate)})</span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-ash tracking-wider">Total Charge</span>
                <div className="text-2xl font-display font-black text-bronze tabular-nums">
                  ₹{totalAmount}
                </div>
              </div>
            </div>

            {/* Customer Details Form */}
            <Card className="bg-white p-6 space-y-4 border-black/10 shadow-card rounded-2xl">
              <h3 className="font-display text-lg font-bold text-midnight">
                Guest Player Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ash uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ash absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Parth Racka"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-cream-soft border border-black/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-midnight placeholder-ash/50 focus:border-bronze focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ash uppercase tracking-wider mb-1">
                    Mobile Phone Number (For PIN confirmation) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-ash absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-cream-soft border border-black/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-midnight placeholder-ash/50 focus:border-bronze focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ash uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. player@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-cream-soft border border-black/10 rounded-xl px-3 py-2.5 text-sm text-midnight placeholder-ash/50 focus:border-bronze focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ash uppercase tracking-wider mb-2">
                    Payment Preference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pay_at_venue")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === "pay_at_venue"
                          ? "bg-bronze/10 border-bronze text-midnight font-bold shadow-sm"
                          : "bg-cream-soft border-black/10 text-ash"
                      }`}
                    >
                      <div className="text-xs font-bold text-midnight">Pay at Counter</div>
                      <div className="text-[11px] text-ash mt-0.5">Cash / UPI upon check-in</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === "online"
                          ? "bg-bronze/10 border-bronze text-midnight font-bold shadow-sm"
                          : "bg-cream-soft border-black/10 text-ash"
                      }`}
                    >
                      <div className="text-xs font-bold text-midnight">Online Prepay</div>
                      <div className="text-[11px] text-ash mt-0.5">UPI / Net Banking</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-black/10">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setStep(2)}
                  className="gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Slots
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <span>Securing Table...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Confirm & Generate PIN
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 4: INSTANT PIN PRESENTATION */}
        {step === 4 && confirmedBooking && (
          <div className="space-y-6 max-w-lg mx-auto text-center animate-in zoom-in-95 duration-400">
            <div className="w-16 h-16 rounded-full bg-baize/15 text-baize flex items-center justify-center mx-auto shadow-sm">
              <CheckCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-midnight">
                Booking Confirmed!
              </h2>
              <p className="text-xs text-ash">
                Your reservation has been locked into the system. Tell your PIN to the staff upon arrival to automatically allocate your table.
              </p>
            </div>

            {/* Glowing PIN Card */}
            <div className="bg-midnight text-cream rounded-3xl p-6 sm:p-8 border border-bronze-glow/40 shadow-2xl space-y-4">
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-bronze-glow">
                Your Check-In PIN
              </span>

              <div className="flex items-center justify-center gap-3">
                <div className="font-mono text-4xl sm:text-5xl font-black tracking-[0.3em] bg-black/40 px-6 py-3 rounded-2xl border border-bronze-glow/50 text-cream select-all">
                  {confirmedBooking.pin}
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(confirmedBooking.pin, "pin")}
                  className="p-3.5 rounded-2xl bg-bronze hover:bg-bronze-glow text-midnight font-bold transition-all shadow-md shrink-0 cursor-pointer"
                  title="Copy PIN"
                >
                  {hasCopiedPin ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {hasCopiedPin && (
                <div className="text-xs font-semibold text-baize-light animate-pulse">
                  ✓ PIN copied to clipboard!
                </div>
              )}

              {/* Instructions */}
              <div className="bg-baize/20 border border-baize/40 rounded-2xl p-4 text-left flex items-start gap-3 mt-4 text-xs text-cream/90 leading-relaxed">
                <KeyRound className="w-5 h-5 text-baize-light shrink-0 mt-0.5" />
                <div>
                  <strong className="text-baize-light">How it works:</strong> When you arrive at Cue Nation, simply say this PIN <code className="bg-midnight px-1.5 py-0.5 rounded text-bronze-glow font-bold">{confirmedBooking.pin}</code> to the staff. The system will automatically allocate an available {selectedGameType === "snooker" ? "Snooker" : "Pool"} table and start your session!
                </div>
              </div>
            </div>

            {/* Summary Details */}
            <div className="bg-white rounded-2xl border border-black/10 p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center py-1 border-b border-black/5">
                <span className="text-ash">Booking Code</span>
                <span className="font-mono font-bold text-midnight">{confirmedBooking.booking.booking_code}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-black/5">
                <span className="text-ash">Discipline</span>
                <span className="font-bold text-midnight capitalize">{selectedGameType} (3 Tables Sync)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-black/5">
                <span className="text-ash">Scheduled Time</span>
                <span className="font-mono text-midnight">{selectedSlot?.displayStart} – {selectedSlot?.displayEnd}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-ash">Amount</span>
                <span className="font-bold text-bronze text-sm">₹{confirmedBooking.booking.amount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => (window.location.href = `/booking/${confirmedBooking.booking.id}`)}
                className="w-full sm:flex-1 justify-center text-xs"
              >
                View Full Pass
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setStep(1);
                  setSelectedSlot(null);
                  setConfirmedBooking(null);
                }}
                className="w-full sm:flex-1 justify-center text-xs"
              >
                Book Another Slot
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
