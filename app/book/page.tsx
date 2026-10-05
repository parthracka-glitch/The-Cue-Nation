"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatINR } from "@/lib/money";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
} from "lucide-react";

interface SlotItem {
  time?: string;
  timeFormatted?: string;
  startTime: string;
  endTime: string;
  availableTablesCount?: number;
  availableCount?: number;
  totalTablesCount?: number;
  isAvailable: boolean;
  estimatedPricePaise?: number;
  estimatedTotalPaise?: number;
  depositPaise?: number;
  isHappyHour?: boolean;
  breakdown?: Array<{ label: string; minutes: number; amountPaise: number }>;
}

function BookingPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const paramType = searchParams.get("type")?.toUpperCase();
  const initialTableType: "POOL" | "SNOOKER" | "CAROM" =
    paramType === "SNOOKER" || paramType === "CAROM" ? paramType : "POOL";

  // Wizard Step: 1 | 2 | 3 | 4 | 5
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Table type, Date, Party Size
  const todayStr = new Date().toISOString().split("T")[0];
  const [tableType, setTableType] = useState<"POOL" | "SNOOKER" | "CAROM">(initialTableType);
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [partySize, setPartySize] = useState<number>(2);

  // Step 2: Duration, Slots
  const [durationHours, setDurationHours] = useState<number>(2);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // Step 3: Guest Details
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Step 4: Mock Gateway
  const [paymentTab, setPaymentTab] = useState<"UPI" | "CARD">("UPI");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Step 5: Confirmation Result
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    reservation: { id: string; code: string; startsAt: string; endsAt: string };
    tableName: string;
    estimatedTotalPaise: number;
    depositPaise: number;
  } | null>(null);

  // Prefill details if user is logged in
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setGuestName(session.user.name);
      if (session.user.email) setGuestEmail(session.user.email);
    }
  }, [session]);

  // Fetch slots whenever tableType, bookingDate, or durationHours change
  useEffect(() => {
    async function loadAvailability() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(
          `/api/public/availability?type=${tableType}&date=${bookingDate}&duration=${durationHours}`
        );
        const data = await res.json();
        if (data.slots) {
          setSlots(data.slots);
          // Auto select first available slot
          const firstFree = data.slots.find((s: SlotItem) => s.isAvailable);
          if (firstFree) setSelectedSlot(firstFree);
        }
      } catch (e) {
        console.error("Failed to load availability", e);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailability();
  }, [tableType, bookingDate, durationHours]);

  const depositPaise = selectedSlot
    ? selectedSlot.depositPaise || Math.round((selectedSlot.estimatedPricePaise || selectedSlot.estimatedTotalPaise || 0) * 0.2)
    : 0;

  // Process Mock Deposit Payment
  async function handleMockPayment() {
    setPaymentError(null);
    setIsProcessingPayment(true);

    // Simulate 1.5s network delay
    await new Promise((r) => setTimeout(r, 1500));

    if (simulateFailure) {
      setIsProcessingPayment(false);
      setPaymentError("Mock Payment Declined: Bank simulator rejected transaction (Simulate Failure was checked).");
      return;
    }

    try {
      const res = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableType,
          startTime: selectedSlot?.startTime,
          durationHours,
          partySize,
          guestName,
          guestPhone,
          guestEmail,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentError(data.error || "Reservation failed");
        setIsProcessingPayment(false);
        return;
      }

      setBookingConfirmation(data);
      setCurrentStep(5);
    } catch {
      setPaymentError("Network error completing reservation");
    } finally {
      setIsProcessingPayment(false);
    }
  }

  // Generate .ics calendar file
  function downloadCalendarFile() {
    if (!bookingConfirmation || !selectedSlot) return;

    const startDate = new Date(selectedSlot.startTime);
    const endDate = new Date(selectedSlot.endTime);

    function formatDate(d: Date) {
      return d.toISOString().replace(/-|:|\.\d+/g, "");
    }

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CueClub//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${bookingConfirmation.reservation.code}@cueclub.demo`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:CueClub ${tableType} Table Reservation (${bookingConfirmation.reservation.code})`,
      `DESCRIPTION:Your table ${bookingConfirmation.tableName} is confirmed. Booking code: ${bookingConfirmation.reservation.code}.`,
      "LOCATION:CueClub Lounge, 108 Arena Blvd, Cyber Hub",
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cueclub-${bookingConfirmation.reservation.code}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen flex flex-col bg-billiard-950 text-foreground">
      <PublicHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span>Step {currentStep} of 5</span>
            <span className="text-emerald-400">
              {currentStep === 1 && "Table & Date"}
              {currentStep === 2 && "Time & Rate Band"}
              {currentStep === 3 && "Guest Details"}
              {currentStep === 4 && "Deposit Payment"}
              {currentStep === 5 && "Confirmed"}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep >= step ? "bg-emerald-500" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Table Type, Date, Party Size */}
        {currentStep === 1 && (
          <Card className="border-border bg-card/90">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Choose Your Game & Date</CardTitle>
              <CardDescription>
                Select table style, play date, and number of players
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Table Type Selector */}
              <div className="space-y-2">
                <Label>Select Table Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "POOL", name: "Pool (8-Ball)", icon: "🎱", desc: "9ft Championship Table" },
                    { id: "SNOOKER", name: "Snooker", icon: "🔴", desc: "12ft Tournament Slate" },
                    { id: "CAROM", name: "Carom", icon: "🎯", desc: "English Birch Board" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTableType(item.id as any)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        tableType === item.id
                          ? "border-emerald-500 bg-emerald-950/40 text-white shadow-md shadow-emerald-950/50"
                          : "border-border bg-secondary/30 text-muted-foreground hover:border-emerald-800"
                      }`}
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="font-semibold text-sm text-white">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Party Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Booking Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="party">Party Size</Label>
                  <select
                    id="party"
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value, 10))}
                    className="flex h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Player (Solo Practice)" : "Players"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4 border-t border-border">
              <Button onClick={() => setCurrentStep(2)} className="gap-2">
                Continue to Time Slot <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 2: Time Slot & Pricing Breakdown */}
        {currentStep === 2 && (
          <Card className="border-border bg-card/90">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Select Time & Duration</CardTitle>
              <CardDescription>
                60-minute start slots from 11:00 AM to Midnight. Real-time band proration calculated automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration Selector */}
              <div className="space-y-2">
                <Label>Session Duration</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((hours) => (
                    <Button
                      key={hours}
                      type="button"
                      variant={durationHours === hours ? "default" : "outline"}
                      onClick={() => setDurationHours(hours)}
                      className="h-11"
                    >
                      {hours} {hours === 1 ? "Hour" : "Hours"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Slot Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Available Start Slots ({bookingDate})</Label>
                  {loadingSlots && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                      Checking table availability...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[300px] overflow-y-auto p-1">
                  {slots.map((slot) => {
                    const slotLabel = slot.time || slot.timeFormatted || `${slot.startTime.split("T")[1]?.slice(0, 5) || "Slot"}`;
                    const isSelected = selectedSlot?.startTime === slot.startTime || selectedSlot?.time === slotLabel;
                    const freeCount = slot.availableTablesCount ?? slot.availableCount ?? 0;
                    return (
                      <button
                        key={slot.startTime || slotLabel}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          !slot.isAvailable
                            ? "opacity-35 cursor-not-allowed bg-secondary/10 border-border"
                            : isSelected
                            ? "border-emerald-500 bg-primary text-white font-bold shadow-lg"
                            : "border-border bg-secondary/40 hover:border-emerald-700 text-foreground"
                        }`}
                      >
                        <div className="text-sm font-semibold">{slotLabel}</div>
                        <div className="text-[10px] mt-0.5">
                          {slot.isAvailable ? (
                            <span className="text-emerald-400 font-medium">
                              {freeCount} free
                            </span>
                          ) : (
                            <span className="text-red-400">Full</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Pricing Breakdown Card */}
              {selectedSlot && (
                <div className="p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Pricing Estimate ({selectedSlot.time || selectedSlot.timeFormatted} for {durationHours}h)
                    </span>
                    <span className="text-lg font-bold text-white">
                      {formatINR(selectedSlot.estimatedPricePaise || selectedSlot.estimatedTotalPaise || 0)}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-emerald-900/40 text-xs">
                    {(selectedSlot.breakdown || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-muted-foreground">
                        <span>
                          {item.label} ({item.minutes} mins)
                        </span>
                        <span className="text-white font-medium">
                          {formatINR(item.amountPaise)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-border font-semibold text-emerald-300">
                      <span>Required 20% Deposit (Mock Gateway)</span>
                      <span>{formatINR(selectedSlot.depositPaise || depositPaise)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                disabled={!selectedSlot || !selectedSlot.isAvailable}
                onClick={() => setCurrentStep(3)}
                className="gap-2"
              >
                Enter Guest Details <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 3: Guest Details */}
        {currentStep === 3 && (
          <Card className="border-border bg-card/90">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Guest Contact Information</CardTitle>
              <CardDescription>
                We will send simulated SMS & WhatsApp confirmations to this phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="guestName">Full Name *</Label>
                <Input
                  id="guestName"
                  placeholder="Rahul Sharma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="guestPhone">Mobile Phone (WhatsApp) *</Label>
                  <Input
                    id="guestPhone"
                    placeholder="+919876543210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="guestEmail">Email Address (Optional)</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    placeholder="rahul@example.in"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Special Requests / Notes</Label>
                <Input
                  id="notes"
                  placeholder="e.g. Near window table, extra cues, birthday practice"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                disabled={!guestName.trim() || guestPhone.trim().length < 8}
                onClick={() => setCurrentStep(4)}
                className="gap-2"
              >
                Proceed to Deposit ({formatINR(depositPaise)}) <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 4: Mock Payment Gateway */}
        {currentStep === 4 && (
          <Card className="border-border bg-card/90 max-w-lg mx-auto">
            <CardHeader className="text-center pb-2">
              <Badge variant="gold" className="w-fit mx-auto mb-2 text-[10px]">
                Mock Gateway (Offline Demo)
              </Badge>
              <CardTitle className="text-2xl text-white">Pay Deposit</CardTitle>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                {formatINR(depositPaise)}
              </div>
              <CardDescription>
                20% deposit towards {tableType} Table reservation on {bookingDate} at {selectedSlot?.time}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-secondary/80">
                <button
                  type="button"
                  onClick={() => setPaymentTab("UPI")}
                  className={`py-2 text-xs font-semibold rounded-md transition-all ${
                    paymentTab === "UPI"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  UPI QR / App
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab("CARD")}
                  className={`py-2 text-xs font-semibold rounded-md transition-all ${
                    paymentTab === "CARD"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Credit / Debit Card
                </button>
              </div>

              {/* UPI Tab */}
              {paymentTab === "UPI" && (
                <div className="flex flex-col items-center justify-center p-6 border border-border/80 rounded-xl bg-secondary/20 space-y-3">
                  <div className="p-3 bg-white rounded-xl shadow-lg">
                    <QRCodeSVG
                      value={`upi://pay?pa=cueclub@demo&pn=CueClub&am=${depositPaise / 100}&cu=INR`}
                      size={140}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    cueclub@demo | UPI Instant
                  </span>
                </div>
              )}

              {/* Card Tab */}
              {paymentTab === "CARD" && (
                <div className="space-y-3 p-4 border border-border/80 rounded-xl bg-secondary/20 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs">Card Number</Label>
                    <Input disabled value="4111 •••• •••• 1111 (Mock Test Card)" className="h-9 font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Expiry</Label>
                      <Input disabled value="12/28" className="h-9 font-mono" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">CVV</Label>
                      <Input disabled value="•••" className="h-9 font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* Simulate Failure Toggle for Demo */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-amber-900/40 bg-amber-950/20 text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-amber-300">Simulate Payment Failure</span>
                  <span className="text-[10px] text-muted-foreground">
                    Toggle on to demo error handling and retry mechanisms
                  </span>
                </div>
                <Switch
                  checked={simulateFailure}
                  onCheckedChange={setSimulateFailure}
                />
              </div>

              <Button
                disabled={isProcessingPayment}
                onClick={handleMockPayment}
                className="w-full h-12 text-base font-semibold"
                variant="gold"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Simulating Gateway (1.5s)...
                  </>
                ) : (
                  `Pay ${formatINR(depositPaise)} & Confirm`
                )}
              </Button>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(3)}
                className="w-full text-xs text-muted-foreground"
              >
                Cancel and edit details
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 5: Confirmation Page */}
        {currentStep === 5 && bookingConfirmation && (
          <Card className="border-emerald-600/50 bg-card/90 max-w-lg mx-auto text-center">
            <CardContent className="pt-8 space-y-6">
              <div className="h-16 w-16 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="space-y-1">
                <Badge variant="available">Booking Confirmed</Badge>
                <h2 className="text-3xl font-extrabold text-white mt-2">
                  {bookingConfirmation.reservation.code}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Show this booking code or QR upon arrival at the reception desk.
                </p>
              </div>

              {/* QR Code */}
              <div className="p-4 bg-white rounded-xl inline-block shadow-lg mx-auto">
                <QRCodeSVG value={bookingConfirmation.reservation.code} size={150} />
              </div>

              {/* Summary Details */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Table:</span>
                  <span className="font-bold text-white">{bookingConfirmation.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Start Time:</span>
                  <span className="font-semibold text-white">
                    {bookingDate} at {selectedSlot?.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration & Party:</span>
                  <span className="text-white">
                    {durationHours} Hours, {partySize} Players
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Deposit Paid:</span>
                  <span className="font-bold text-emerald-400">
                    {formatINR(bookingConfirmation.depositPaise)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={downloadCalendarFile}
                  variant="outline"
                  className="flex-1 text-xs gap-1.5"
                >
                  <Download className="h-4 w-4 text-emerald-400" />
                  Add to Calendar (.ics)
                </Button>
                <a href={`/book/lookup?code=${bookingConfirmation.reservation.code}&phone=${guestPhone}`} className="flex-1">
                  <Button variant="default" className="w-full text-xs">
                    View / Manage Booking
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

export default function BookingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-billiard-950 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mr-2" />
          <span>Loading CueClub Booking Engine...</span>
        </div>
      }
    >
      <BookingPageContent />
    </React.Suspense>
  );
}

