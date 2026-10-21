"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";
import { PoolSummary } from "@/components/pools/PoolShowcaseCards";
import { SlotStatusInfo, PoolDaySchedule } from "@/lib/services/poolScheduleService";

interface PoolBookingModalProps {
  pool: PoolSummary;
  isOpen: boolean;
  onClose: () => void;
}

export function PoolBookingModal({ pool, isOpen, onClose }: PoolBookingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Step: 1 = Date & Time Slots, 2 = Customer Details, 3 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Date selection (next 7 days)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [durationMinutes, setDurationMinutes] = useState<number>(60);

  // Schedule & slots
  const [schedule, setSchedule] = useState<PoolDaySchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<SlotStatusInfo | null>(null);

  // Customer Form
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation Result
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingCode: string;
    pin: string;
    booking: any;
  } | null>(null);
  const [hasCopiedPin, setHasCopiedPin] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Generate next 7 selectable dates
  const selectableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDateParam = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Fetch dynamic pool schedule whenever pool, selectedDate or duration changes
  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const dateStr = formatDateParam(selectedDate);
      const res = await fetch(`/api/pools/${pool.id}?date=${dateStr}&duration=${durationMinutes}`);
      const data = await res.json();
      if (data.schedule) {
        setSchedule(data.schedule);
        // Deselect slot if it's no longer available
        if (selectedSlot) {
          const matching = data.schedule.slots.find((s: SlotStatusInfo) => s.id === selectedSlot.id);
          if (!matching || matching.status !== "available") {
            setSelectedSlot(null);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load schedule", e);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSchedule();
    }
  }, [isOpen, pool.id, selectedDate, durationMinutes]);

  if (!isOpen || !mounted) return null;

  // Handle slot selection (only Green / available allowed)
  const handleSlotClick = (slot: SlotStatusInfo) => {
    if (slot.status !== "available") return;
    setSelectedSlot(slot);
    setFormError("");
  };

  // Submit Booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setFormError("Please select an available time slot");
      return;
    }
    if (!guestName.trim()) {
      setFormError("Full Name is required");
      return;
    }
    if (!guestPhone.trim() || guestPhone.trim().length < 10) {
      setFormError("A valid 10-digit mobile number is required");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: pool.id,
          tableId: pool.id,
          startISO: selectedSlot.startISO,
          endISO: selectedSlot.endISO,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          guestEmail: guestEmail.trim() || undefined,
          source: "online",
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setFormError(data.error || "Slot is no longer available. Please select another slot.");
        fetchSchedule(); // Refresh to show newly booked state
        setIsSubmitting(false);
        return;
      }

      setConfirmedBooking({
        bookingCode: data.booking.booking_code,
        pin: data.rawPin,
        booking: data.booking,
      });

      setStep(3);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#C5A059", "#0A5551", "#2FA39A", "#F6EFDF"],
        });
      } catch (_) {}
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Booking request failed";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedPrice = selectedSlot ? selectedSlot.price : Math.round((pool.hourly_rate * durationMinutes) / 60);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-charcoal border border-ivory/15 shadow-2xl overflow-hidden text-ivory flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="relative p-4 sm:p-5 border-b border-ivory/10 flex items-center justify-between bg-midnight/95">
          <div className="flex items-center gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as 1 | 2)}
                className="p-2 rounded-xl text-ivory/70 hover:text-brass hover:bg-ivory/10 border border-ivory/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 text-brass" />
                <span className="hidden sm:inline">Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-ivory/70 hover:text-brass hover:bg-ivory/10 border border-ivory/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Back to Venue"
              >
                <ArrowLeft className="w-4 h-4 text-brass" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <div className="w-10 h-10 rounded-xl overflow-hidden bg-midnight border border-brass/30 flex-shrink-0">
              <img src={pool.image_url} alt={pool.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg sm:text-2xl font-bold text-ivory">
                  {pool.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-brass/20 text-brass border border-brass/30 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
                  {pool.category === "main" ? "Tournament Pool" : "Smoking Lounge"}
                </span>
              </div>
              <p className="text-xs text-ivory/60 mt-0.5 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-brass" />
                <span>Operating Hours: {pool.opening_time} – {pool.closing_time}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ivory/60 hover:text-ivory hover:bg-ivory/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: DATE, DURATION & TIME SLOTS */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Current Closure Warning Banner */}
              {schedule?.isCurrentlyClosed && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-3 text-red-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block">Currently Closed</span>
                    <span>This pool is currently outside operating hours. {schedule.nextOpeningTimeLabel}</span>
                  </div>
                </div>
              )}

              {/* 1. Date Selector Pills */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-ivory/70 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-brass" />
                  <span>Select Playing Date (Next 7 Days)</span>
                </label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-7 sm:gap-2">
                  {selectableDates.map((date, idx) => {
                    const isSelected =
                      date.getDate() === selectedDate.getDate() &&
                      date.getMonth() === selectedDate.getMonth();
                    const dayLabel = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "short" });
                    const dateNum = date.getDate();
                    const monthLabel = date.toLocaleDateString("en-US", { month: "short" });

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`min-w-[62px] sm:min-w-0 flex-shrink-0 py-2.5 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center touch-manipulation min-h-[58px] ${
                          isSelected
                            ? "bg-brass text-ink border-brass font-bold shadow-md shadow-brass/20 scale-[1.02]"
                            : "bg-midnight-card/80 border-ivory/10 text-ivory/80 hover:border-ivory/30 hover:text-ivory"
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-wider block opacity-80 truncate max-w-full">{dayLabel}</span>
                        <span className="text-sm sm:text-base font-semibold block leading-tight">{dateNum}</span>
                        <span className="text-[10px] opacity-70 block">{monthLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Duration Selector */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-ivory/70 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brass" />
                  <span>Select Duration</span>
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDurationMinutes(dur)}
                      className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold touch-manipulation min-h-[44px] flex items-center justify-center ${
                        durationMinutes === dur
                          ? "bg-brass/20 border-brass text-brass shadow-sm font-bold"
                          : "bg-midnight-card/60 border-ivory/10 text-ivory/70 hover:border-ivory/30 hover:text-ivory"
                      }`}
                    >
                      {dur === 60 ? "60m (1 hr)" : dur === 90 ? "90m (1.5 hrs)" : "120m (2 hrs)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Visual Status Color Legend */}
              <div className="p-3.5 rounded-2xl bg-midnight/90 border border-ivory/10 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory/60 block">
                  Slot Status Legend:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-emerald-400 font-medium">Green = Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-red-500/80" />
                    <span className="text-red-400 font-medium">Red = Booked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-amber-500" />
                    <span className="text-amber-400 font-medium">Orange = Reserved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-stone-700" />
                    <span className="text-stone-400 font-medium">Grey = Closed / Past</span>
                  </div>
                </div>
              </div>

              {/* 4. Time Slots Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider font-semibold text-ivory/70">
                    Available Time Slots ({durationMinutes} mins)
                  </label>
                  {selectedSlot && (
                    <span className="text-xs text-brass font-semibold">
                      Selected: {selectedSlot.startTimeLabel} – {selectedSlot.endTimeLabel}
                    </span>
                  )}
                </div>

                {loadingSchedule ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-brass border-t-transparent animate-spin" />
                    <span className="text-xs text-ivory/60">Calculating real-time pool availability...</span>
                  </div>
                ) : schedule?.noSlotsAvailable ? (
                  <div className="py-10 text-center rounded-2xl bg-midnight-card/50 border border-ivory/10 space-y-2">
                    <AlertTriangle className="w-7 h-7 text-amber-400 mx-auto" />
                    <p className="text-sm font-semibold text-ivory">No Slots Available for This Date</p>
                    <p className="text-xs text-ivory/60">
                      All slots for this day are either fully reserved or outside operating hours. Please pick another date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 max-h-60 sm:max-h-64 overflow-y-auto pr-1">
                    {schedule?.slots.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;

                      // Status Styles mapping exactly to prompt specification:
                      // Green = Available, Red = Booked, Grey = Unavailable/Past, Orange = Reserved/Pending
                      let statusClasses = "";
                      let badgeText = slot.statusLabel;

                      if (slot.status === "available") {
                        statusClasses = isSelected
                          ? "bg-emerald-500 text-ink border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold scale-[1.02]"
                          : "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/60 hover:border-emerald-400 cursor-pointer";
                      } else if (slot.status === "booked") {
                        statusClasses = "bg-red-950/30 border-red-900/40 text-red-400/70 cursor-not-allowed opacity-60";
                      } else if (slot.status === "reserved") {
                        statusClasses = "bg-amber-950/30 border-amber-800/40 text-amber-400/80 cursor-not-allowed opacity-75";
                      } else {
                        // unavailable / past / closure
                        statusClasses = "bg-stone-900/40 border-stone-800/30 text-stone-500 cursor-not-allowed opacity-50";
                      }

                      return (
                        <button
                          key={slot.id}
                          disabled={slot.status !== "available"}
                          onClick={() => handleSlotClick(slot)}
                          className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all touch-manipulation min-h-[52px] ${statusClasses}`}
                        >
                          <span className="text-xs font-semibold tabular-nums">{slot.startTimeLabel}</span>
                          <span className="text-[10px] opacity-75 block truncate max-w-full">
                            {slot.endTimeLabel}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider mt-1 opacity-90 font-medium">
                            {badgeText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price Breakdown Preview */}
              <div className="pt-3 border-t border-ivory/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-ivory/60 block">Estimated Session Fee:</span>
                  <span className="text-xl font-bold font-display text-brass tabular-nums">
                    ₹{calculatedPrice}
                    <span className="text-xs font-normal text-ivory/60"> ({durationMinutes} mins)</span>
                  </span>
                </div>

                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(2)}
                  className={`py-3 px-6 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                    selectedSlot
                      ? "bg-gradient-to-r from-brass to-brass-dark hover:from-brass-glow hover:to-brass text-ink shadow-lg shadow-brass/25 cursor-pointer"
                      : "bg-ivory/10 text-ivory/30 cursor-not-allowed"
                  }`}
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOMER DETAILS & SERVER VALIDATION */}
          {step === 2 && (
            <form onSubmit={handleConfirmBooking} className="space-y-5">
              {/* Selected Slot Summary Header */}
              <div className="p-4 rounded-2xl bg-midnight/90 border border-brass/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-ivory/60 block uppercase tracking-wider">Booking Slot</span>
                  <span className="text-sm font-bold text-ivory block mt-0.5">
                    {pool.name} • {selectedSlot?.startTimeLabel} – {selectedSlot?.endTimeLabel}
                  </span>
                  <span className="text-ivory/70">
                    {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ({durationMinutes} mins)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-ivory/60 block uppercase tracking-wider">Amount Due</span>
                  <span className="text-lg font-bold font-display text-brass tabular-nums">₹{calculatedPrice}</span>
                </div>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-ivory/80 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <User className="w-3.5 h-3.5 text-brass" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Parth Racka"
                    className="w-full px-4 py-3 rounded-xl bg-midnight-card border border-ivory/15 text-ivory placeholder:text-ivory/30 text-base sm:text-sm focus:outline-none focus:border-brass transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory/80 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-brass" />
                    <span>Mobile Number (for SMS & Check-in PIN) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-midnight-card border border-ivory/15 text-ivory placeholder:text-ivory/30 text-base sm:text-sm focus:outline-none focus:border-brass transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory/80 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-brass" />
                    <span>Email Address (for receipt & confirmation)</span>
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="e.g. parth@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-midnight-card border border-ivory/15 text-ivory placeholder:text-ivory/30 text-base sm:text-sm focus:outline-none focus:border-brass transition-colors"
                  />
                </div>
              </div>

              {/* Anti-double booking guarantee notice */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero Double-Booking Guaranteed: availability is atomically locked by the backend engine.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-5 rounded-xl border border-ivory/20 hover:bg-ivory/10 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Slots</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3.5 px-7 rounded-xl bg-gradient-to-r from-brass to-brass-dark hover:from-brass-glow hover:to-brass text-ink font-bold text-sm shadow-lg shadow-brass/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                      <span>Verifying & Locking Slot...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm & Lock Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: BOOKING CONFIRMATION & PIN RECEIPT */}
          {step === 3 && confirmedBooking && (
            <div className="space-y-6 text-center py-2 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold uppercase tracking-wider">
                  Booking Confirmed
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-ivory mt-2">
                  Session Locked Successfully!
                </h3>
                <p className="text-xs text-ivory/70 mt-1">
                  Your pool session is guaranteed. Present your confidential 6-digit PIN at the parlour desk on arrival.
                </p>
              </div>

              {/* Booking Reference Card */}
              <div className="p-5 rounded-2xl bg-midnight/90 border border-brass/40 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                  <div>
                    <span className="text-[10px] text-ivory/60 uppercase tracking-widest block font-semibold">
                      Booking Reference ID
                    </span>
                    <span className="text-xl font-bold font-display text-brass tabular-nums">
                      {confirmedBooking.bookingCode}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedBooking.bookingCode);
                      setHasCopiedCode(true);
                      setTimeout(() => setHasCopiedCode(false), 2000);
                    }}
                    className="p-2 rounded-lg bg-charcoal border border-ivory/15 hover:border-brass/40 text-xs text-ivory flex items-center gap-1.5 cursor-pointer"
                  >
                    {hasCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopiedCode ? "Copied" : "Copy ID"}</span>
                  </button>
                </div>

                {/* 6-Digit PIN Spotlight */}
                <div className="p-4 rounded-xl bg-charcoal/90 border border-brass/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-6 h-6 text-brass flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-ivory/60 font-semibold block">
                        Desk Check-in PIN
                      </span>
                      <span className="text-2xl font-mono font-bold text-ivory tracking-widest tabular-nums">
                        {confirmedBooking.pin}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedBooking.pin);
                      setHasCopiedPin(true);
                      setTimeout(() => setHasCopiedPin(false), 2000);
                    }}
                    className="p-2 rounded-lg bg-midnight border border-ivory/15 hover:border-brass/40 text-xs text-ivory flex items-center gap-1.5 cursor-pointer"
                  >
                    {hasCopiedPin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopiedPin ? "Copied" : "Copy PIN"}</span>
                  </button>
                </div>

                {/* Booking Breakdown Details */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-ivory/60 block">Customer Name:</span>
                    <span className="font-medium text-ivory">{guestName}</span>
                  </div>
                  <div>
                    <span className="text-ivory/60 block">Mobile Number:</span>
                    <span className="font-medium text-ivory">{guestPhone}</span>
                  </div>
                  <div>
                    <span className="text-ivory/60 block">Reserved Pool:</span>
                    <span className="font-medium text-ivory">{pool.name}</span>
                  </div>
                  <div>
                    <span className="text-ivory/60 block">Session Date:</span>
                    <span className="font-medium text-ivory">
                      {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-ivory/60 block">Playing Window:</span>
                    <span className="font-medium text-ivory">
                      {selectedSlot?.startTimeLabel} – {selectedSlot?.endTimeLabel} ({durationMinutes} mins)
                    </span>
                  </div>
                  <div>
                    <span className="text-ivory/60 block">Total Price:</span>
                    <span className="font-bold font-display text-brass tabular-nums">₹{calculatedPrice}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-midnight-card hover:bg-charcoal border border-ivory/20 hover:border-brass/40 text-ivory font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <a
                  href="/my-bookings"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-midnight-card hover:bg-charcoal border border-brass/40 text-brass font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors text-center"
                >
                  <span>My Bookings</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brass hover:bg-brass-glow text-ink font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-brass/20"
                >
                  <span>Done / Back to Venue</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
