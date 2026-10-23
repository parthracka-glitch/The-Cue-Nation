"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { venueStore } from "@/lib/store/venueStore";
import { useAuth } from "@/lib/store/authContext";
import { Booking, GameTable } from "@/types/database";
import { generateDaySlots, TimeSlot } from "@/lib/time";
import confetti from "canvas-confetti";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  KeyRound,
  RotateCcw,
  MapPin,
  Coffee,
  X,
  CreditCard,
  Layers,
  ChevronRight,
  Star,
  Crown,
  Trophy,
  UtensilsCrossed,
  Zap,
  Flame,
} from "lucide-react";
import clsx from "clsx";
import { HeroLiveVideoBackground } from "@/components/landing/HeroLiveVideoBackground";

export default function LandingPage() {
  const { user } = useAuth();

  // -------------------------------------------------------------
  // Booking Widget State
  // -------------------------------------------------------------
  const [selectedGame, setSelectedGame] = useState<"pool" | "snooker">("pool");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>("10:00 AM");
  const [durationHours, setDurationHours] = useState<number>(1);

  // Availability checking state
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    checked: boolean;
    availableCount: number;
    message?: string;
  } | null>(null);

  // Booking Modal Flow State (Step 1: Check/Verify, Step 2: Guest Details, Step 3: PIN Confirmation)
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);

  // Guest details form
  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [paymentMethod, setPaymentMethod] = useState<"pay_at_venue" | "online">("pay_at_venue");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Confirmed booking response
  const [confirmedBooking, setConfirmedBooking] = useState<{ booking: Booking; pin: string } | null>(null);
  const [hasCopiedPin, setHasCopiedPin] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Real-time table store sync
  const [tables, setTables] = useState<GameTable[]>([]);

  useEffect(() => {
    setTables(venueStore.getTables());
    const unsub = venueStore.subscribe(() => {
      setTables(venueStore.getTables());
    });
    return unsub;
  }, []);

  // Time slot options
  const timeOptions = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
    "10:00 PM",
    "11:00 PM",
  ];

  // Duration options
  const durationOptions = [
    { label: "1 Hour", value: 1 },
    { label: "1.5 Hours", value: 1.5 },
    { label: "2 Hours", value: 2 },
    { label: "3 Hours", value: 3 },
  ];

  // Helper to convert date + time string to ISO range
  const getSelectedRangeISO = () => {
    try {
      const [year, month, day] = selectedDateStr.split("-").map(Number);
      const match = selectedTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) throw new Error("Invalid time format");

      let hour = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      const meridiem = match[3].toUpperCase();
      if (meridiem === "PM" && hour < 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;

      const startDate = new Date(year, month - 1, day, hour, min, 0);
      const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

      return {
        startISO: startDate.toISOString(),
        endISO: endDate.toISOString(),
        startDate,
        endDate,
      };
    } catch {
      const now = new Date();
      return {
        startISO: now.toISOString(),
        endISO: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        startDate: now,
        endDate: new Date(now.getTime() + 60 * 60 * 1000),
      };
    }
  };

  // Check availability
  const handleCheckAvailability = () => {
    setIsCheckingAvailability(true);
    setErrorMessage("");

    setTimeout(() => {
      const { startISO, endISO, startDate } = getSelectedRangeISO();

      // Validate past dates
      if (startDate.getTime() < Date.now() - 15 * 60 * 1000) {
        setAvailabilityResult({
          checked: true,
          availableCount: 0,
          message: "Selected time is in the past. Please select an upcoming slot.",
        });
        setIsCheckingAvailability(false);
        return;
      }

      const freeCount = venueStore.getAvailableTablesCount(selectedGame, startISO, endISO);

      if (freeCount > 0) {
        setAvailabilityResult({
          checked: true,
          availableCount: freeCount,
          message: `${freeCount} of 3 ${selectedGame.toUpperCase()} tables available!`,
        });
        // Open the booking modal
        setBookingStep(2);
        setModalOpen(true);
      } else {
        setAvailabilityResult({
          checked: true,
          availableCount: 0,
          message: `All 3 ${selectedGame.toUpperCase()} tables are currently booked for this time.`,
        });
      }
      setIsCheckingAvailability(false);
    }, 350);
  };

  // Submit confirmed booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      setErrorMessage("Please enter both your full name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const { startISO, endISO } = getSelectedRangeISO();

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: selectedGame === "snooker" ? "tournament-snooker" : "main-pool",
          startISO,
          endISO,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          guestEmail: guestEmail.trim() || undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reserve table. Please pick another slot.");
      }

      setConfirmedBooking(data);
      setBookingStep(3);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#E9B94F", "#F6D78D", "#10B981", "#FFFFFF"],
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Reservation error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pricing calculations
  const hourlyRate = selectedGame === "snooker" ? 350 : 250;
  const totalAmount = Math.round(hourlyRate * durationHours);

  return (
    <div className="flex flex-col w-full bg-[#03120F] text-white overflow-x-hidden selection:bg-[#E9B94F] selection:text-[#0A1917]">
      {/* =========================================================================
          SECTION 2 — HERO + BOOKING WIDGET (Exact match to reference)
         ========================================================================= */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center pt-8 pb-20 overflow-hidden">
        {/* Live Animated Video Lounge Background */}
        <HeroLiveVideoBackground />

        <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Content (~7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow & Live Ambience Indicator */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#E9B94F]">
                  PLAY · RELAX · COMPETE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#03120F]/80 backdrop-blur-md border border-[#E9B94F]/30 text-[11px] font-semibold text-[#E9B94F] shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Lounge
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                Your Next Game <br />
                Awaits at <span className="text-[#E9B94F]">QNation</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                Premium pool & snooker tables, modern ambience, and a seamless online booking experience.
                Reserve your table, pick your time, and get ready to play.
              </p>

              {/* 3 Compact Feature Groups in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-xl">
                {/* 1. 6 Premium Tables */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-[#E9B94F]/40 bg-[#E9B94F]/10 flex items-center justify-center text-[#E9B94F] flex-shrink-0">
                    {/* Billiard Ball Icon */}
                    <svg className="w-5 h-5 fill-currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" stroke="#E9B94F" strokeWidth="1.8" fill="none" />
                      <circle cx="12" cy="12" r="4.2" fill="#E9B94F" />
                      <circle cx="12" cy="12" r="1.5" fill="#0A1917" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">6 Premium Tables</div>
                    <div className="text-[11px] text-neutral-400">3 Pool | 3 Snooker</div>
                  </div>
                </div>

                {/* 2. Easy Online Booking */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-[#E9B94F]/40 bg-[#E9B94F]/10 flex items-center justify-center text-[#E9B94F] flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 text-[#E9B94F]" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">Easy Online Booking</div>
                    <div className="text-[11px] text-neutral-400">Fast & Secure</div>
                  </div>
                </div>

                {/* 3. Flexible Timings */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-[#E9B94F]/40 bg-[#E9B94F]/10 flex items-center justify-center text-[#E9B94F] flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#E9B94F]" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">Flexible Timings</div>
                    <div className="text-[11px] text-neutral-400">Play at Your Convenience</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Booking Card (~5 columns) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div
                id="book-widget"
                className="w-full max-w-[420px] bg-[#0A1917]/95 border border-[#1A332B] rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl"
              >
                <h3 className="text-lg font-bold text-white mb-5 tracking-tight">
                  Book Your Table
                </h3>

                {/* Game Selection Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#061412] rounded-xl border border-[#142C24] mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGame("pool");
                      setAvailabilityResult(null);
                    }}
                    className={clsx(
                      "py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2",
                      selectedGame === "pool"
                        ? "bg-[#0E4638] text-white shadow-sm border border-[#1E6B56]"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <span>Pool</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGame("snooker");
                      setAvailabilityResult(null);
                    }}
                    className={clsx(
                      "py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2",
                      selectedGame === "snooker"
                        ? "bg-[#0E4638] text-white shadow-sm border border-[#1E6B56]"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <span>Snooker</span>
                  </button>
                </div>

                {/* 3 Stacked Booking Fields */}
                <div className="space-y-3.5 mb-5">
                  {/* Field 1: Date */}
                  <div className="relative bg-[#061412] border border-[#17332A] rounded-xl px-4 py-2.5 hover:border-[#1E4D3E] transition-colors focus-within:border-[#E9B94F]/80">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Date
                    </label>
                    <div className="flex items-center justify-between mt-0.5">
                      <input
                        type="date"
                        value={selectedDateStr}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          setSelectedDateStr(e.target.value);
                          setAvailabilityResult(null);
                        }}
                        className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full cursor-pointer [color-scheme:dark]"
                      />
                      <CalendarIcon className="w-4 h-4 text-neutral-400 pointer-events-none ml-2 flex-shrink-0" />
                    </div>
                  </div>

                  {/* Field 2: Start Time */}
                  <div className="relative bg-[#061412] border border-[#17332A] rounded-xl px-4 py-2.5 hover:border-[#1E4D3E] transition-colors focus-within:border-[#E9B94F]/80">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Time
                    </label>
                    <div className="flex items-center justify-between mt-0.5">
                      <select
                        value={selectedTimeStr}
                        onChange={(e) => {
                          setSelectedTimeStr(e.target.value);
                          setAvailabilityResult(null);
                        }}
                        className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full cursor-pointer [color-scheme:dark]"
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t} className="bg-[#061412] text-white">
                            {t}
                          </option>
                        ))}
                      </select>
                      <Clock className="w-4 h-4 text-neutral-400 pointer-events-none ml-2 flex-shrink-0" />
                    </div>
                  </div>

                  {/* Field 3: Duration */}
                  <div className="relative bg-[#061412] border border-[#17332A] rounded-xl px-4 py-2.5 hover:border-[#1E4D3E] transition-colors focus-within:border-[#E9B94F]/80">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Duration
                    </label>
                    <div className="flex items-center justify-between mt-0.5">
                      <select
                        value={durationHours}
                        onChange={(e) => {
                          setDurationHours(Number(e.target.value));
                          setAvailabilityResult(null);
                        }}
                        className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full cursor-pointer [color-scheme:dark]"
                      >
                        {durationOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#061412] text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <Clock className="w-4 h-4 text-neutral-400 pointer-events-none ml-2 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Tariff Indicator */}
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-5 px-1">
                  <span>Authoritative Rate:</span>
                  <span className="text-[#E9B94F] font-bold">
                    ₹{hourlyRate}/hr · Est. Total: ₹{totalAmount}
                  </span>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  disabled={isCheckingAvailability}
                  onClick={handleCheckAvailability}
                  className="w-full bg-[#E9B94F] hover:bg-[#F6D78D] text-[#0A1917] font-bold text-sm py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#E9B94F]/20 active:scale-[0.99] cursor-pointer disabled:opacity-60"
                >
                  {isCheckingAvailability ? (
                    <span>Verifying Tables...</span>
                  ) : (
                    <>
                      <span>Check Availability</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Live Feedback */}
                {availabilityResult && (
                  <div
                    className={clsx(
                      "mt-4 p-3 rounded-xl text-xs font-medium text-center border animate-in fade-in duration-200",
                      availabilityResult.availableCount > 0
                        ? "bg-[#0E4638]/60 text-emerald-300 border-[#1E6B56]"
                        : "bg-red-950/60 text-red-300 border-red-800"
                    )}
                  >
                    {availabilityResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — CHOOSE YOUR GAME (Light Ivory Background matching reference)
         ========================================================================= */}
      <section className="bg-[#F5F5F0] text-[#111C1B] py-20 relative z-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column (~4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-500">
                CHOOSE YOUR GAME
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111C1B] leading-tight">
                Pool or Snooker? <br />
                Your Call.
              </h2>

              <p className="text-neutral-600 text-sm leading-relaxed">
                Two classic games. Six premium tables. Whether you&apos;re a beginner or a pro, QNation is the
                perfect place to play.
              </p>

              <div className="pt-2">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 bg-[#0E3B30] hover:bg-[#07241D] text-white text-xs font-bold px-5 py-3 rounded-lg transition-colors shadow-md"
                >
                  <span>View Pricing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Cards Column (~8 cols) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pool Card */}
              <div
                onClick={() => {
                  setSelectedGame("pool");
                  const widget = document.getElementById("book-widget");
                  widget?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group relative rounded-2xl overflow-hidden shadow-lg border border-neutral-300 bg-[#0A1917] cursor-pointer h-[270px] flex flex-col justify-end p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
              >
                {/* Background image */}
                <img
                  src="/images/landing/pool-card-hd.jpg"
                  alt="Pool Table"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                {/* Content */}
                <div className="relative z-10 space-y-1.5">
                  <div className="w-8 h-8 rounded-full border border-[#E9B94F] flex items-center justify-center text-white font-bold text-xs bg-black/40 mb-2">
                    8
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">Pool</h3>
                  <p className="text-xs text-neutral-300">Fast-paced. Fun. For Everyone.</p>
                  <div className="pt-2">
                    <span className="text-[#E9B94F] group-hover:text-[#F6D78D] font-bold text-xs inline-flex items-center gap-1.5 transition-colors">
                      Book Pool Table <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Snooker Card */}
              <div
                onClick={() => {
                  setSelectedGame("snooker");
                  const widget = document.getElementById("book-widget");
                  widget?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group relative rounded-2xl overflow-hidden shadow-lg border border-neutral-300 bg-[#0A1917] cursor-pointer h-[270px] flex flex-col justify-end p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
              >
                {/* Background image */}
                <img
                  src="/images/landing/snooker-card-hd.jpg"
                  alt="Snooker Table"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                {/* Content */}
                <div className="relative z-10 space-y-1.5">
                  <div className="w-8 h-8 rounded-full border border-[#E9B94F] flex items-center justify-center text-white font-bold text-xs bg-black/40 mb-2">
                    {/* Triangle icon */}
                    <svg className="w-4 h-4 fill-none stroke-[#E9B94F] stroke-2" viewBox="0 0 24 24">
                      <polygon points="12 4 4 19 20 19" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">Snooker</h3>
                  <p className="text-xs text-neutral-300">Strategy. Precision. Mastery.</p>
                  <div className="pt-2">
                    <span className="text-[#E9B94F] group-hover:text-[#F6D78D] font-bold text-xs inline-flex items-center gap-1.5 transition-colors">
                      Book Snooker Table <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — WHY CHOOSE QNATION? (Deep Green Feature Strip matching reference)
         ========================================================================= */}
      <section className="bg-[#06271F] text-white py-12 border-y border-[#0B3D31] relative z-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Title (~3 cols) */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Why Choose <br />
                QNation?
              </h2>
            </div>

            {/* 4 Feature Items with vertical dividers (~9 cols) */}
            <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
              {/* Feature 1 */}
              <div className="flex flex-col items-start space-y-2 sm:pl-4 sm:border-l sm:border-[#14483B]">
                <div className="w-8 h-8 rounded-full border border-[#E9B94F]/40 flex items-center justify-center text-[#E9B94F]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Prime Location</div>
                  <div className="text-xs text-neutral-300">Easy to reach</div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-start space-y-2 sm:pl-4 sm:border-l sm:border-[#14483B]">
                <div className="w-8 h-8 rounded-full border border-[#E9B94F]/40 flex items-center justify-center text-[#E9B94F]">
                  {/* Pool cue icon */}
                  <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" stroke="#E9B94F" strokeWidth="2" fill="none" />
                    <line x1="6" y1="18" x2="18" y2="6" stroke="#E9B94F" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Premium Equipment</div>
                  <div className="text-xs text-neutral-300">Professional tables</div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-start space-y-2 sm:pl-4 sm:border-l sm:border-[#14483B]">
                <div className="w-8 h-8 rounded-full border border-[#E9B94F]/40 flex items-center justify-center text-[#E9B94F]">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Comfortable Lounge</div>
                  <div className="text-xs text-neutral-300">Food & Beverages</div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-start space-y-2 sm:pl-4 sm:border-l sm:border-[#14483B]">
                <div className="w-8 h-8 rounded-full border border-[#E9B94F]/40 flex items-center justify-center text-[#E9B94F]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Secure & Safe</div>
                  <div className="text-xs text-neutral-300">Clean & Well Maintained</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — HOW IT WORKS (Light Ivory Background matching reference)
         ========================================================================= */}
      <section className="bg-[#F5F5F0] text-[#111C1B] py-20 relative z-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-14">
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111C1B]">
              Book in 4 Simple Steps
            </h2>
          </div>

          {/* 4 Steps Row with Connecting Arrows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0E3B30] text-white font-bold text-sm flex items-center justify-center">
                    1
                  </div>
                  <CalendarIcon className="w-5 h-5 text-neutral-600" />
                </div>
                <span className="hidden lg:inline text-neutral-400 font-light text-xl pr-4">→</span>
              </div>
              <h3 className="text-base font-bold text-[#111C1B]">Select Date & Time</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Choose your preferred slot and duration.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0E3B30] text-white font-bold text-sm flex items-center justify-center">
                    2
                  </div>
                  {/* Table outline icon */}
                  <svg className="w-5 h-5 fill-none stroke-neutral-600 stroke-2" viewBox="0 0 24 24">
                    <rect x="3" y="6" width="18" height="10" rx="2" />
                    <line x1="6" y1="16" x2="6" y2="20" />
                    <line x1="18" y1="16" x2="18" y2="20" />
                  </svg>
                </div>
                <span className="hidden lg:inline text-neutral-400 font-light text-xl pr-4">→</span>
              </div>
              <h3 className="text-base font-bold text-[#111C1B]">Choose Your Table</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Pick from our pool or snooker tables.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0E3B30] text-white font-bold text-sm flex items-center justify-center">
                    3
                  </div>
                  <User className="w-5 h-5 text-neutral-600" />
                </div>
                <span className="hidden lg:inline text-neutral-400 font-light text-xl pr-4">→</span>
              </div>
              <h3 className="text-base font-bold text-[#111C1B]">Enter Details</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Provide your contact information.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0E3B30] text-white font-bold text-sm flex items-center justify-center">
                    4
                  </div>
                  <CreditCard className="w-5 h-5 text-neutral-600" />
                </div>
              </div>
              <h3 className="text-base font-bold text-[#111C1B]">Confirm & Pay</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Complete your booking with secure payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — OUR VENUE (Deep Dark Green matching reference)
         ========================================================================= */}
      <section id="about" className="bg-[#041D17] text-white py-20 border-t border-[#0C382D] relative z-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Image (~6 cols) */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-[#17483B] shadow-2xl h-[330px] sm:h-[380px]">
                <img
                  src="/images/landing/venue-interior-hd.jpg"
                  alt="QNation Venue Interior"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Right Content (~6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#E9B94F]">
                OUR VENUE
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                More Than Just a Game
              </h2>

              <p className="text-neutral-300 text-sm leading-relaxed">
                QNation isn&apos;t just a place to play — it&apos;s a complete experience. Enjoy a premium setup,
                modern ambience, great food and beverages, and a welcoming environment for players of all levels.
              </p>

              {/* 3 Compact Feature Groups */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                {/* 1. 6 Tables */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-[#E9B94F]/40 flex items-center justify-center text-[#E9B94F] flex-shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">6 Tables</div>
                    <div className="text-[10.5px] text-neutral-400">3 Pool + 3 Snooker</div>
                  </div>
                </div>

                {/* 2. Food & Beverages */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-[#E9B94F]/40 flex items-center justify-center text-[#E9B94F] flex-shrink-0">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Food & Beverages</div>
                    <div className="text-[10.5px] text-neutral-400">Snacks, Drinks & More</div>
                  </div>
                </div>

                {/* 3. Comfortable Lounge */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-[#E9B94F]/40 flex items-center justify-center text-[#E9B94F] flex-shrink-0">
                    {/* Sofa / Lounge icon */}
                    <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                      <path d="M20 9V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2c-1.1 0-2 .9-2 2v5c0 .55.45 1 1 1h1v2c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-2h12v2c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-2h1c.55 0 1-.45 1-1v-5c0-1.1-.9-2-2-2zm-2-2v2H6V7h12z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Comfortable Lounge</div>
                    <div className="text-[10.5px] text-neutral-400">Relax & Unwind</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-3">
                <Link
                  href="/tables"
                  className="inline-flex items-center gap-2 border border-[#E9B94F]/70 text-[#E9B94F] hover:bg-[#E9B94F] hover:text-[#0A1917] text-xs font-bold px-5 py-2.5 rounded-lg transition-all duration-200"
                >
                  <span>Explore Our Venue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6B — VIP MEMBERSHIP CLUB & PAYWALL (Dark Velvet + Gold Accents)
         ========================================================================= */}
      <section className="bg-[#031511] text-white py-20 border-t border-[#0F2F26] relative z-10 overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle,rgba(233,185,79,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B94F]/10 border border-[#E9B94F]/30 text-[#E9B94F] text-xs font-bold uppercase tracking-widest">
                <Crown className="w-3.5 h-3.5" />
                Cue Nation Patron Club
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Play More. Save Big. <span className="text-[#E9B94F]">Own Your Table.</span>
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Join our private patron community. Enjoy 20% off table rates during off-peak hours, personal locked cue
                storage, priority bookings on championship tables, and free craft roastery drinks every visit.
              </p>
            </div>
            <Link href="/memberships" className="shrink-0">
              <button className="px-6 py-3 rounded-full bg-[#E9B94F] hover:bg-[#F6D78D] text-[#0A1917] text-xs uppercase tracking-wider font-extrabold transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2">
                <span>View All 3 Tiers & Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Social Free */}
            <div className="bg-[#051C17] border border-[#17392E] rounded-2xl p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Casual Tier</span>
                <h3 className="text-xl font-bold text-white">Cueist Social</h3>
                <div className="text-2xl font-mono font-bold text-white pt-2">Free</div>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-300 border-t border-white/5 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E9B94F] shrink-0" /> Pay standard hourly tariffs at checkout
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E9B94F] shrink-0" /> Table QR café ordering with digital tab
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E9B94F] shrink-0" /> 24-hour advance slot booking
                </li>
              </ul>
              <Link href="/#book-widget" className="block pt-2">
                <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors">
                  Book Pay-As-You-Play
                </button>
              </Link>
            </div>

            {/* Card 2: Gold Baize (Featured) */}
            <div className="bg-gradient-to-b from-[#0F2F25] to-[#061C16] border-2 border-[#E9B94F] rounded-2xl p-6 space-y-5 relative shadow-xl">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#E9B94F] text-[#0A1917] text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#E9B94F] uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" /> Regular Enthusiast
                </span>
                <h3 className="text-xl font-bold text-white">Gold Baize Club</h3>
                <div className="text-2xl font-mono font-bold text-white pt-2">
                  ₹1,199 <span className="text-xs text-neutral-400 font-sans font-normal">/ month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-200 border-t border-white/10 pt-4">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#E9B94F] shrink-0" /> 20% discount on off-peak hours (10 AM - 5 PM)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E9B94F] shrink-0" /> 48-hour priority slot booking window
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E9B94F] shrink-0" /> 1 complimentary cold brew per booking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E9B94F] shrink-0" /> Bi-weekly amateur shootout invitation
                </li>
              </ul>
              <Link href="/memberships" className="block pt-2">
                <button className="w-full py-2.5 rounded-xl bg-[#E9B94F] hover:bg-[#F6D78D] text-[#0A1917] text-xs font-extrabold transition-all shadow-md">
                  Join Gold Club
                </button>
              </Link>
            </div>

            {/* Card 3: Black Velvet VIP */}
            <div className="bg-[#051C17] border border-[#17392E] rounded-2xl p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#34D399] uppercase tracking-wider">Master Cueist</span>
                <h3 className="text-xl font-bold text-white">Black Velvet VIP</h3>
                <div className="text-2xl font-mono font-bold text-white pt-2">
                  ₹3,199 <span className="text-xs text-neutral-400 font-sans font-normal">/ month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-300 border-t border-white/5 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" /> Unlimited weekday solo practice (10 AM - 3 PM)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" /> Personal locked & humidity-controlled cue locker
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" /> Free entry waivers to club tournaments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" /> Quarterly 60-min video stroke coaching
                </li>
              </ul>
              <Link href="/memberships" className="block pt-2">
                <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-colors">
                  Join VIP Pro Tier
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6C — TOURNAMENT ARENA & LIVE LEADERBOARD PREVIEW
         ========================================================================= */}
      <section className="bg-[#041A14] text-white py-20 border-t border-[#0D382C] relative z-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5" />
                Competitive Arena & Brackets
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Live Tournaments & Weekly Shootouts
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Step up to the tournament baize. Every Friday night and Sunday morning, our arenas host single-elimination
                shootouts with verified FargoRate rankings and cash bounties.
              </p>
            </div>
            <Link href="/tournaments" className="shrink-0">
              <button className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center gap-2">
                <span>View Full Brackets & Register</span>
                <ArrowRight className="w-4 h-4 text-[#E9B94F]" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tournament 1 */}
            <div className="p-6 rounded-2xl bg-[#062018] border border-[#163D31] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#E9B94F] uppercase tracking-wider">9-Ball Pool</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#34D399] text-[10px] font-bold">
                    13 / 16 Registered
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">Friday Midnight 9-Ball Shootout</h3>
                <p className="text-xs text-neutral-400">
                  Race to 5 | Single Elimination | Winner Breaks. Cash prizes for Top 4 + engraved plaque.
                </p>
                <div className="flex items-center gap-4 text-xs text-neutral-300 pt-1">
                  <span>Entry: <strong className="text-white">₹750</strong></span>
                  <span>Prize Pool: <strong className="text-[#E9B94F]">₹25,000</strong></span>
                </div>
              </div>
              <Link href="/tournaments">
                <button className="w-full py-2.5 rounded-xl bg-[#E9B94F] hover:bg-[#F6D78D] text-[#0A1917] font-bold text-xs uppercase tracking-wider transition-all">
                  Register for Friday Shootout
                </button>
              </Link>
            </div>

            {/* Tournament 2 */}
            <div className="p-6 rounded-2xl bg-[#062018] border border-[#163D31] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#E9B94F] uppercase tracking-wider">12ft Snooker Arena</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#34D399] text-[10px] font-bold">
                    10 / 16 Registered
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">Aristocrat Snooker Century Trophy</h3>
                <p className="text-xs text-neutral-400">
                  Best of 3 Frames (Finals Best of 5) on Riley Aristocrat 12ft table. ₹5,000 Century Break Bounty.
                </p>
                <div className="flex items-center gap-4 text-xs text-neutral-300 pt-1">
                  <span>Entry: <strong className="text-white">₹1,200</strong></span>
                  <span>Prize Pool: <strong className="text-[#E9B94F]">₹40,000</strong></span>
                </div>
              </div>
              <Link href="/tournaments">
                <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs uppercase tracking-wider transition-all">
                  Register for Snooker Trophy
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6D — ARTISANAL ROASTERY CAFÉ & TABLE QR ORDERING
         ========================================================================= */}
      <section className="bg-[#031511] text-white py-20 border-t border-[#0D382C] relative z-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B94F]/10 border border-[#E9B94F]/30 text-[#E9B94F] text-xs font-bold uppercase tracking-widest">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Artisanal Café & Table QR Service
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Never Step Away from the Table. <br />
                <span className="text-[#E9B94F]">Scan, Order & Refuel.</span>
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Every table at Cue Nation is fitted with an authoritative cryptographic QR code. Simply scan with your
                phone camera to explore our artisanal roastery coffees, craft mocktails, hand-cut truffle fries, and
                gourmet sourdough brioches. Items are fired straight to our kitchen and added to your running session tab.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="font-bold text-xs text-white">Signature Cold Brew</div>
                  <div className="text-[11px] text-neutral-400">16-hr single-origin steep</div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="font-bold text-xs text-white">Truffle Fries</div>
                  <div className="text-[11px] text-neutral-400">Parmigiano Reggiano & herb salt</div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="font-bold text-xs text-white">One Consolidated Bill</div>
                  <div className="text-[11px] text-neutral-400">Tables + Café in 1 UPI tap</div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link href="/cafe">
                  <button className="px-5 py-2.5 rounded-full bg-[#E9B94F] hover:bg-[#F6D78D] text-[#0A1917] text-xs font-bold uppercase tracking-wider transition-all shadow-md">
                    Explore Full Café Menu
                  </button>
                </Link>
                <Link href="/t/table-1/menu" className="text-xs text-neutral-300 hover:text-white underline">
                  Preview Table QR Order Flow →
                </Link>
              </div>
            </div>

            {/* Right Graphic / Photo Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-[#173E32] shadow-2xl bg-[#062018] p-6 space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80"
                  alt="Artisanal Cold Brew and Billiards"
                  className="w-full h-52 object-cover rounded-2xl border border-white/10"
                />
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-xs font-bold text-white">Table-Side Express QR Order</div>
                    <div className="text-[11px] text-neutral-400">Table 2: Match Pool Arena (Active Tab)</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#34D399] border border-emerald-500/40 text-[10px] font-bold">
                    Kitchen Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — PLAYER TESTIMONIALS (Light Gradient Background matching reference)
         ========================================================================= */}
      <section className="bg-gradient-to-b from-[#EBF2EE] to-[#F5F5F0] text-[#111C1B] py-20 relative z-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">
              WHAT OUR PLAYERS SAY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111C1B]">
              Real People. Real Games. Real Fun.
            </h2>
          </div>

          {/* 3 Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200/80 flex items-start gap-4">
              <img
                src="/images/landing/avatar-rohit.jpg"
                alt="Rohit Sharma"
                className="w-12 h-12 rounded-full object-cover border border-neutral-300 flex-shrink-0"
              />
              <div className="space-y-2">
                <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                  &ldquo;Amazing place! The tables are in great condition and the booking process is super easy.
                  Highly recommend!&rdquo;
                </p>
                <div>
                  <div className="font-bold text-xs text-[#111C1B]">Rohit Sharma</div>
                  <div className="flex items-center gap-0.5 text-[#E9B94F] text-xs mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200/80 flex items-start gap-4">
              <img
                src="/images/landing/avatar-priya.jpg"
                alt="Priya Mehta"
                className="w-12 h-12 rounded-full object-cover border border-neutral-300 flex-shrink-0"
              />
              <div className="space-y-2">
                <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                  &ldquo;Great atmosphere, clean venue and friendly staff. Perfect for casual games and
                  tournaments.&rdquo;
                </p>
                <div>
                  <div className="font-bold text-xs text-[#111C1B]">Priya Mehta</div>
                  <div className="flex items-center gap-0.5 text-[#E9B94F] text-xs mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200/80 flex items-start gap-4">
              <img
                src="/images/landing/avatar-arjun.jpg"
                alt="Arjun Verma"
                className="w-12 h-12 rounded-full object-cover border border-neutral-300 flex-shrink-0"
              />
              <div className="space-y-2">
                <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                  &ldquo;Best snooker experience in town! Love the professional setup and the smooth booking
                  system.&rdquo;
                </p>
                <div>
                  <div className="font-bold text-xs text-[#111C1B]">Arjun Verma</div>
                  <div className="flex items-center gap-0.5 text-[#E9B94F] text-xs mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          REAL BOOKING MODAL (Step 2: Guest Details, Step 3: PIN Confirmation)
         ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0A1917] border border-[#1A332B] rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => {
                setModalOpen(false);
                setConfirmedBooking(null);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP 2: GUEST DETAILS & CONFIRMATION */}
            {bookingStep === 2 && (
              <form onSubmit={handleConfirmBooking} className="space-y-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E9B94F]/10 border border-[#E9B94F]/30 text-[#E9B94F] text-[10.5px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Table Available</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Complete Your {selectedGame.toUpperCase()} Reservation
                  </h3>
                  <p className="text-xs text-neutral-300">
                    Slot: <strong className="text-white">{selectedTimeStr}</strong> on{" "}
                    <strong className="text-white">{selectedDateStr}</strong> ({durationHours} hr)
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-[#061412] border border-[#1A332B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E9B94F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Phone Number (For PIN SMS / WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-[#061412] border border-[#1A332B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E9B94F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-[#061412] border border-[#1A332B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E9B94F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Payment Option
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("pay_at_venue")}
                        className={clsx(
                          "py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer",
                          paymentMethod === "pay_at_venue"
                            ? "bg-[#0E4638] border-[#1E6B56] text-white"
                            : "bg-[#061412] border-[#1A332B] text-neutral-400"
                        )}
                      >
                        Pay at Venue (Cash/UPI)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={clsx(
                          "py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer",
                          paymentMethod === "online"
                            ? "bg-[#0E4638] border-[#1E6B56] text-white"
                            : "bg-[#061412] border-[#1A332B] text-neutral-400"
                        )}
                      >
                        Online Advance (Instant)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#061412] border border-[#142C24] flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Total Payable:</span>
                  <span className="font-bold text-[#E9B94F] text-base">₹{totalAmount}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E9B94F] hover:bg-[#F6D78D] text-[#0A1917] font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Locking Table..." : "Confirm & Generate 6-Digit PIN"}
                </button>
              </form>
            )}

            {/* STEP 3: SUCCESS & CONFIDENTIAL 6-DIGIT PIN */}
            {bookingStep === 3 && confirmedBooking && (
              <div className="space-y-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Table Reserved!</h3>
                  <p className="text-xs text-neutral-300">
                    Your table is guaranteed at QNation. Show this PIN to the staff floor concierge upon arrival.
                  </p>
                </div>

                {/* 6-DIGIT PIN CALLOUT */}
                <div className="p-5 rounded-2xl bg-[#061412] border border-[#E9B94F]/40 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E9B94F]">
                    Your Confidential Check-In PIN
                  </span>
                  <div className="text-4xl font-black tracking-[0.25em] text-[#E9B94F] font-mono">
                    {confirmedBooking.pin}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Booking Code: <strong className="text-white">{confirmedBooking.booking.booking_code}</strong>
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedBooking.pin);
                      setHasCopiedPin(true);
                      setTimeout(() => setHasCopiedPin(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#E9B94F] hover:underline pt-1"
                  >
                    {hasCopiedPin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopiedPin ? "PIN Copied!" : "Copy PIN"}</span>
                  </button>
                </div>

                <div className="text-xs text-neutral-400 space-y-1">
                  <div>Table: <strong className="text-white capitalize">{selectedGame} (Auto-allocated)</strong></div>
                  <div>Scheduled: <strong className="text-white">{selectedDateStr} at {selectedTimeStr}</strong></div>
                  <div>Total Due: <strong className="text-[#E9B94F]">₹{confirmedBooking.booking.amount}</strong></div>
                </div>

                <button
                  onClick={() => {
                    setModalOpen(false);
                    setConfirmedBooking(null);
                  }}
                  className="w-full bg-[#0E3B30] hover:bg-[#07241D] text-white font-bold text-sm py-3 rounded-xl transition-all"
                >
                  Done & Return to Homepage
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
