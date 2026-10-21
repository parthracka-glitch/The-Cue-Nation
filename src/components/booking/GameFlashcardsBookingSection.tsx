"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { venueStore } from "@/lib/store/venueStore";
import { useAuth } from "@/lib/store/authContext";
import { Booking, GameTable } from "@/types/database";
import { generateDaySlots, TimeSlot, formatTimeIST, formatDateIST } from "@/lib/time";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RotateCcw,
  Zap,
  Award,
  Layers,
  CircleDot,
  CheckCheck,
} from "lucide-react";
import clsx from "clsx";

export function GameFlashcardsBookingSection() {
  const { user } = useAuth();

  // Selected game for booking modal
  const [activeModalGame, setActiveModalGame] = useState<"pool" | "snooker" | null>(null);

  // Booking Flow Steps: 1: Slot, 2: Details, 3: PIN Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Date selection (default today)
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [durationHours, setDurationHours] = useState<number>(1);
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
    const unsub = venueStore.subscribe(() => {
      setTables(venueStore.getTables());
    });
    return unsub;
  }, []);

  // Update date based on offset
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDateOffset);
    setSelectedDate(d);
    setSelectedSlot(null);
  }, [selectedDateOffset]);

  // Generate slots for selected date
  useEffect(() => {
    const slots = generateDaySlots(selectedDate);
    setAvailableSlots(slots);
  }, [selectedDate]);

  // Handle open booking modal
  const handleOpenBooking = (gameType: "pool" | "snooker") => {
    setActiveModalGame(gameType);
    setStep(1);
    setSelectedSlot(null);
    setConfirmedBooking(null);
    setHasCopiedPin(false);
  };

  const handleCloseModal = () => {
    setActiveModalGame(null);
    setStep(1);
    setSelectedSlot(null);
    setConfirmedBooking(null);
  };

  // Calculate live capacity for each slot across the 3 tables
  const getSlotCapacity = (slot: TimeSlot) => {
    if (!activeModalGame) return { freeCount: 3, isAvailable: true };
    const freeCount = venueStore.getAvailableTablesCount(
      activeModalGame,
      slot.startISO,
      slot.endISO
    );
    return {
      freeCount,
      isAvailable: freeCount > 0,
    };
  };

  // Pricing
  const hourlyRate = activeModalGame === "snooker" ? 450 : 300;
  const totalAmount = hourlyRate * durationHours;

  // Submit Booking
  const handleConfirmBooking = () => {
    if (!activeModalGame || !selectedSlot) return;
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
      // Find one of the 3 available candidate tables for this slot
      const allocatedCandidate = venueStore.findAvailableTableForSlot(
        activeModalGame,
        selectedSlot.startISO,
        selectedSlot.endISO
      );

      const tableId = allocatedCandidate?.id || `${activeModalGame}-1`;

      const result = venueStore.createBooking({
        tableId,
        startISO: selectedSlot.startISO,
        endISO: selectedSlot.endISO,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        source: "online",
        amount: totalAmount,
        userId: user?.id || null,
      });

      setConfirmedBooking(result);
      setStep(3);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#C5A059", "#1B4D3E", "#E6C687", "#FFFFFF"],
        });
      } catch {
        // ignore confetti errors
      }
    } catch (err: any) {
      alert(err.message || "Failed to reserve slot. Please select another slot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy PIN
  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setHasCopiedPin(true);
    setTimeout(() => setHasCopiedPin(false), 2500);
  };

  // Copy Code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  // Count active tables
  const poolTables = tables.filter((t) => t.type === "pool" && t.active);
  const snookerTables = tables.filter((t) => t.type === "snooker" && t.active);

  return (
    <section id="tables" className="py-20 bg-cream-soft text-midnight relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-baize/10 text-baize font-bold text-xs uppercase tracking-widest border border-baize/20">
            <Sparkles className="w-3.5 h-3.5" />
            Championship Floor · 6 Synchronized Tables
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-midnight tracking-tight">
            Select Your Game: Pool or Snooker
          </h2>

          <p className="text-ash text-sm sm:text-base leading-relaxed">
            Choose your preferred discipline below to check live hourly slots across our 3 tournament Pool tables and 3 full-size Snooker tables. Book your slot in seconds and receive an instant PIN for automated table allocation upon arrival.
          </p>
        </div>

        {/* TWO MASTER FLASHCARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* FLASHCARD 1: POOL */}
          <div
            onClick={() => handleOpenBooking("pool")}
            className="group relative bg-midnight rounded-3xl overflow-hidden border border-midnight-line shadow-card hover:shadow-2xl hover:border-baize-light/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Background Image Banner */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-midnight">
              <img
                src="https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=1200&q=80"
                alt="American Tournament Pool"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-baize text-cream shadow-sm flex items-center gap-1.5 border border-baize-light/40">
                  <span className="w-2 h-2 rounded-full bg-cream animate-pulse" />
                  3 Tables Available
                </span>
              </div>

              <div className="absolute top-4 right-4 bg-midnight/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cream border border-midnight-line">
                9ft Tournament Slate
              </div>

              {/* Rate Overlay */}
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-cream">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-mist font-semibold">Standard Hourly Rate</span>
                  <div className="text-3xl font-display font-black text-bronze-glow tabular-nums">
                    ₹300<span className="text-sm font-normal text-mist">/hour</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-midnight/70 backdrop-blur-md border border-midnight-line text-xs text-baize-light font-semibold">
                  Automatic Table Allocation
                </div>
              </div>
            </div>

            {/* Flashcard Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream group-hover:text-baize-light transition-colors">
                    American Pool
                  </h3>
                  <span className="text-xs font-mono font-bold text-mist uppercase tracking-widest bg-midnight-card px-2.5 py-1 rounded-md border border-midnight-line">
                    3 Arena Tables
                  </span>
                </div>

                <p className="text-mist text-sm leading-relaxed">
                  Fast-paced 8-ball and 9-ball on precision 9ft tournament slates. Fitted with responsive K55 cushions, authentic drop pockets, and Super Aramith Pro-Cup balls under overhead brass canopy lighting.
                </p>

                {/* Table specs list */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-cream/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-baize-light shrink-0" />
                    <span>3 Brazilian 9ft Tables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-baize-light shrink-0" />
                    <span>Instant Check-in PIN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-baize-light shrink-0" />
                    <span>Laser-Leveled Slates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-baize-light shrink-0" />
                    <span>Zero Double-Booking</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center gap-2 text-sm font-bold shadow-md group-hover:scale-[1.01] transition-transform"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Select Slot & Book Pool Table
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* FLASHCARD 2: SNOOKER */}
          <div
            onClick={() => handleOpenBooking("snooker")}
            className="group relative bg-midnight rounded-3xl overflow-hidden border border-midnight-line shadow-card hover:shadow-2xl hover:border-bronze-glow/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Background Image Banner */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-midnight">
              <img
                src="https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=1200&q=80"
                alt="English Championship Snooker"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-bronze text-cream shadow-sm flex items-center gap-1.5 border border-bronze-glow/40">
                  <span className="w-2 h-2 rounded-full bg-cream animate-pulse" />
                  3 Tables Available
                </span>
              </div>

              <div className="absolute top-4 right-4 bg-midnight/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cream border border-midnight-line">
                12ft Full-Size Championship
              </div>

              {/* Rate Overlay */}
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-cream">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-mist font-semibold">Standard Hourly Rate</span>
                  <div className="text-3xl font-display font-black text-bronze-glow tabular-nums">
                    ₹450<span className="text-sm font-normal text-mist">/hour</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-midnight/70 backdrop-blur-md border border-midnight-line text-xs text-bronze-glow font-semibold">
                  Automatic Table Allocation
                </div>
              </div>
            </div>

            {/* Flashcard Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream group-hover:text-bronze-glow transition-colors">
                    English Snooker
                  </h3>
                  <span className="text-xs font-mono font-bold text-mist uppercase tracking-widest bg-midnight-card px-2.5 py-1 rounded-md border border-midnight-line">
                    3 Arena Tables
                  </span>
                </div>

                <p className="text-mist text-sm leading-relaxed">
                  Aristocrat-class 12ft tournament tables crafted from 5-piece Italian slate and 100% fine wool Strachan 6811 tournament baize. Hand-pressed Northern rubber cushions for true rebound fidelity.
                </p>

                {/* Table specs list */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-cream/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-bronze-glow shrink-0" />
                    <span>3 Full-Size 12ft Tables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-bronze-glow shrink-0" />
                    <span>Instant Check-in PIN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-bronze-glow shrink-0" />
                    <span>Strachan 6811 Wool Baize</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-bronze-glow shrink-0" />
                    <span>Zero Double-Booking</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center gap-2 text-sm font-bold shadow-md group-hover:scale-[1.01] transition-transform"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Select Slot & Book Snooker Table
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE BOOKING MODAL */}
      <Modal
        isOpen={!!activeModalGame}
        onClose={handleCloseModal}
        title={
          step === 3
            ? "Booking Confirmed & PIN Generated!"
            : activeModalGame === "snooker"
            ? "Reserve English Snooker Table"
            : "Reserve American Pool Table"
        }
        description={
          step === 3
            ? "Your table is reserved. Show this PIN to the staff upon arrival."
            : `Synchronized across all 3 ${
                activeModalGame === "snooker" ? "Snooker" : "Pool"
              } tables.`
        }
        maxWidth="lg"
        isDark
      >
        <div className="space-y-6 pt-2">
          {/* STEP 1: SELECT DATE & TIME SLOT */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Game Type Switcher */}
              <div className="flex items-center justify-between p-1 bg-midnight-card rounded-xl border border-midnight-line">
                <button
                  type="button"
                  onClick={() => setActiveModalGame("pool")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeModalGame === "pool"
                      ? "bg-baize text-cream shadow-sm"
                      : "text-mist hover:text-cream"
                  }`}
                >
                  🎱 American Pool (3 Tables) · ₹300/hr
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalGame("snooker")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeModalGame === "snooker"
                      ? "bg-bronze text-cream shadow-sm"
                      : "text-mist hover:text-cream"
                  }`}
                >
                  🔴 English Snooker (3 Tables) · ₹450/hr
                </button>
              </div>

              {/* Date Pills Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-mist flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-bronze-glow" />
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
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-bronze text-cream border-bronze shadow-md font-bold"
                            : "bg-midnight-card border-midnight-line text-mist hover:text-cream hover:border-bronze/40"
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
                <label className="text-xs font-bold uppercase tracking-wider text-mist flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-bronze-glow" />
                  Select Duration
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
                          : "bg-midnight-card border-midnight-line text-mist hover:text-cream"
                      }`}
                    >
                      {hrs} Hour{hrs > 1 ? "s" : ""} (₹{hourlyRate * hrs})
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Grid with 3 Tables Capacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-mist">
                    Available Hourly Slots ({formatDateIST(selectedDate)})
                  </label>
                  <span className="text-[11px] text-baize-light font-medium">
                    ● Real-time capacity across 3 tables
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {availableSlots.map((slot, idx) => {
                    const { freeCount, isAvailable } = getSlotCapacity(slot);
                    const isSelected = selectedSlot?.startISO === slot.startISO;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          !isAvailable
                            ? "bg-midnight-card/40 border-midnight-line/40 opacity-40 cursor-not-allowed"
                            : isSelected
                            ? "bg-bronze/20 border-bronze-glow text-cream ring-2 ring-bronze-glow/50 shadow-md"
                            : "bg-midnight-card border-midnight-line text-cream hover:border-bronze-glow/40 cursor-pointer"
                        }`}
                      >
                        <div className="text-xs font-bold font-mono tracking-tight text-cream">
                          {slot.displayStart} – {slot.displayEnd}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              !isAvailable
                                ? "bg-red-500/20 text-red-400"
                                : freeCount === 1
                                ? "bg-amber/20 text-amber"
                                : "bg-baize/30 text-baize-light"
                            }`}
                          >
                            {!isAvailable
                              ? "Sold Out"
                              : freeCount === 1
                              ? "1 Table Left!"
                              : `${freeCount}/3 Free`}
                          </span>

                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-bronze-glow shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-2 flex items-center justify-between border-t border-midnight-line">
                <div className="text-xs text-mist">
                  {selectedSlot ? (
                    <span>
                      Selected: <strong className="text-cream">{selectedSlot.displayStart}</strong> · ₹{totalAmount}
                    </span>
                  ) : (
                    <span>Please choose a time slot to proceed</span>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedSlot}
                  onClick={() => setStep(2)}
                  className="gap-1.5"
                >
                  Enter Details
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: GUEST DETAILS & PAYMENT */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Summary Pill */}
              <div className="bg-midnight-card rounded-2xl border border-midnight-line p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="text-mist uppercase font-bold tracking-wider text-[10px]">
                    Booking Summary
                  </div>
                  <div className="font-display font-bold text-base text-cream mt-0.5">
                    {activeModalGame === "snooker" ? "English Snooker" : "American Pool"}
                  </div>
                  <div className="text-mist font-mono mt-0.5">
                    {selectedSlot?.displayStart} – {selectedSlot?.displayEnd} ({formatDateIST(selectedDate)})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-mist text-[10px] uppercase font-bold">Total Bill</div>
                  <div className="text-xl font-bold font-display text-bronze-glow tabular-nums">
                    ₹{totalAmount}
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-mist uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-mist absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Parth Racka"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-midnight-card border border-midnight-line rounded-xl pl-9 pr-3 py-2.5 text-sm text-cream placeholder-mist/40 focus:border-bronze focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mist uppercase tracking-wider mb-1">
                    Mobile Phone Number (For PIN confirmation) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-mist absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-midnight-card border border-midnight-line rounded-xl pl-9 pr-3 py-2.5 text-sm text-cream placeholder-mist/40 focus:border-bronze focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mist uppercase tracking-wider mb-1">
                    Email Address (Optional for e-receipt)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. player@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-midnight-card border border-midnight-line rounded-xl px-3 py-2.5 text-sm text-cream placeholder-mist/40 focus:border-bronze focus:outline-none"
                  />
                </div>

                {/* Payment Option */}
                <div>
                  <label className="block text-xs font-bold text-mist uppercase tracking-wider mb-2">
                    Payment Preference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pay_at_venue")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === "pay_at_venue"
                          ? "bg-bronze/20 border-bronze-glow text-cream font-bold"
                          : "bg-midnight-card border-midnight-line text-mist hover:text-cream"
                      }`}
                    >
                      <div className="text-xs font-bold text-cream">Pay at Venue</div>
                      <div className="text-[11px] text-mist mt-0.5">Cash / UPI upon check-in</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === "online"
                          ? "bg-bronze/20 border-bronze-glow text-cream font-bold"
                          : "bg-midnight-card border-midnight-line text-mist hover:text-cream"
                      }`}
                    >
                      <div className="text-xs font-bold text-cream">Instant Online Pay</div>
                      <div className="text-[11px] text-mist mt-0.5">UPI / Net Banking / Card</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-midnight-line">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setStep(1)}
                  className="gap-1.5 text-mist hover:text-cream"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Slots
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <span>Generating PIN...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Confirm & Generate PIN
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PIN GENERATED SCREEN */}
          {step === 3 && confirmedBooking && (
            <div className="space-y-6 text-center">
              {/* Success Badge */}
              <div className="w-16 h-16 rounded-full bg-baize/20 border border-baize-light/40 flex items-center justify-center mx-auto text-baize-light animate-bounce">
                <CheckCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-display text-2xl font-bold text-cream">
                  Table Reserved Successfully!
                </h3>
                <p className="text-xs text-mist mt-1 max-w-md mx-auto">
                  Your reservation is confirmed. Say your 6-digit PIN to the staff upon arrival to automatically allocate an active table.
                </p>
              </div>

              {/* GLOWING PIN CARD */}
              <div className="bg-midnight-card border-2 border-bronze-glow/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-bronze-glow to-transparent" />

                <div className="text-xs font-bold uppercase tracking-[0.2em] text-bronze-glow">
                  Your 6-Digit Check-In PIN
                </div>

                {/* PIN Code Box */}
                <div className="flex items-center justify-center gap-3">
                  <div className="font-mono text-4xl sm:text-5xl font-black text-cream tracking-[0.3em] bg-midnight px-6 py-3 rounded-2xl border border-bronze-glow/40 shadow-inner select-all">
                    {confirmedBooking.pin}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPin(confirmedBooking.pin)}
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

                {/* Staff Allocation Instruction Box */}
                <div className="bg-baize/10 border border-baize/30 rounded-2xl p-4 text-left flex items-start gap-3 mt-4">
                  <KeyRound className="w-5 h-5 text-baize-light shrink-0 mt-0.5" />
                  <div className="text-xs text-cream/90 leading-relaxed">
                    <strong className="text-baize-light">How it works:</strong> When you arrive at Cue Nation, simply say this PIN <code className="bg-midnight px-1.5 py-0.5 rounded text-bronze-glow font-bold">{confirmedBooking.pin}</code> to the counter staff. The system will verify your slot and automatically allocate an available {activeModalGame === "snooker" ? "Snooker" : "Pool"} table right away!
                  </div>
                </div>
              </div>

              {/* Reservation Details Breakdown */}
              <div className="bg-midnight-card rounded-2xl border border-midnight-line p-4 text-xs space-y-2 text-left">
                <div className="flex justify-between items-center py-1 border-b border-midnight-line/40">
                  <span className="text-mist">Booking Reference</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cream">{confirmedBooking.booking.booking_code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(confirmedBooking.booking.booking_code)}
                      className="text-bronze-glow hover:text-cream text-[11px]"
                    >
                      {hasCopiedCode ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-midnight-line/40">
                  <span className="text-mist">Game Discipline</span>
                  <span className="font-bold text-cream capitalize">{activeModalGame} (3 Synchronized Tables)</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-midnight-line/40">
                  <span className="text-mist">Scheduled Slot</span>
                  <span className="font-mono text-cream">{selectedSlot?.displayStart} – {selectedSlot?.displayEnd}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-mist">Total Amount</span>
                  <span className="font-bold text-bronze-glow text-sm">₹{confirmedBooking.booking.amount}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link href={`/booking/${confirmedBooking.booking.id}`} className="w-full sm:flex-1">
                  <Button variant="secondary-dark" size="md" className="w-full justify-center text-xs">
                    View Full Reservation
                  </Button>
                </Link>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCloseModal}
                  className="w-full sm:flex-1 justify-center text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
}
