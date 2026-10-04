"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";
import { QRCodeSVG } from "qrcode.react";
import { Search, AlertCircle } from "lucide-react";

function BookingLookupContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!code.trim() || !phone.trim()) return;

    setError(null);
    setReservation(null);
    setCancelMessage(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/public/reservations/lookup?code=${encodeURIComponent(code.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reservation not found");
      } else {
        setReservation(data);
      }
    } catch {
      setError("Failed to query reservation");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (code && phone) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCancel() {
    if (!reservation) return;
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      const res = await fetch(`/api/public/reservations/lookup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reservation.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Cancellation failed");
      } else {
        setReservation(data.reservation);
        setCancelMessage(data.message);
      }
    } catch {
      alert("Network error during cancellation");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-billiard-950 text-foreground">
      <PublicHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 max-w-xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Find Your Booking</h1>
          <p className="text-sm text-muted-foreground">
            Enter your booking reference code (e.g. CQ-8F3K2) and mobile number
          </p>
        </div>

        <Card className="border-border bg-card/90">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Booking Reference Code</Label>
                <Input
                  id="code"
                  placeholder="CQ-XXXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Mobile Phone</Label>
                <Input
                  id="phone"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Searching..." : "Lookup Reservation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-sm text-red-300">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {cancelMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-sm text-amber-300">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
            <span>{cancelMessage}</span>
          </div>
        )}

        {reservation && (
          <Card className="border-emerald-700/40 bg-card/90">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <Badge
                  variant={
                    reservation.status === "CONFIRMED"
                      ? "available"
                      : reservation.status === "CANCELLED"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {reservation.status}
                </Badge>
                <CardTitle className="text-xl text-white mt-1">
                  Code: {reservation.code}
                </CardTitle>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <QRCodeSVG value={reservation.code} size={50} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guest Name:</span>
                  <span className="font-semibold text-white">{reservation.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Table:</span>
                  <span className="text-white font-medium">
                    {reservation.table?.name || `${reservation.tableType} Table`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="text-white">
                    {new Date(reservation.startsAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit Paid:</span>
                  <span className="font-bold text-emerald-400">
                    {formatINR(reservation.depositPaise)}
                  </span>
                </div>
              </div>

              {reservation.status === "CONFIRMED" && (
                <div className="pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    className="w-full text-xs"
                  >
                    Cancel Reservation
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-1">
                    Cancellations more than 2 hours before start receive a refundable deposit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

export default function BookingLookupPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <span>Loading Booking Lookup...</span>
        </div>
      }
    >
      <BookingLookupContent />
    </React.Suspense>
  );
}
