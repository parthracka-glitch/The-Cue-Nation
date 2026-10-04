"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatINR } from "@/lib/money";
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Play,
  Loader2,
  ArrowRight,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReservationsPage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const { data, mutate, isLoading } = useSWR(
    `/api/admin/reservations?date=${selectedDate}`,
    fetcher
  );

  const tables = data?.tables || [];
  const reservations = data?.reservations || [];

  // Manual booking modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualTableId, setManualTableId] = useState("");
  const [manualStartTime, setManualStartTime] = useState("18:00");
  const [manualDuration, setManualDuration] = useState("2");
  const [submitting, setSubmitting] = useState(false);

  // Actions
  async function handleAction(id: string, action: string) {
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        mutate();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateManualBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!manualName || !manualPhone || !manualTableId) return;
    setSubmitting(true);

    const selectedTable = tables.find((t: any) => t.id === manualTableId);
    const startIso = `${selectedDate}T${manualStartTime}:00+05:30`;

    try {
      const res = await fetch("/api/admin/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: manualName,
          guestPhone: manualPhone,
          tableId: manualTableId,
          tableType: selectedTable?.type || "POOL",
          startTime: startIso,
          durationHours: parseInt(manualDuration, 10),
          partySize: 2,
        }),
      });

      if (res.ok) {
        setManualModalOpen(false);
        setManualName("");
        setManualPhone("");
        mutate();
      } else {
        const err = await res.json();
        alert(err.error || "Booking failed");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  // Hours array 11:00 to 24:00 (13 hourly slots)
  const hours = Array.from({ length: 13 }, (_, i) => 11 + i);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-emerald-400" />
            Reservations Timeline & Manager
          </h1>
          <p className="text-xs text-muted-foreground">
            Visual table Gantt chart. Direct 1-click check-in starts in-flight table sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 text-xs w-36"
          />

          <Button
            onClick={() => setManualModalOpen(true)}
            variant="gold"
            size="sm"
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Manual Booking
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline Grid (24h)</TabsTrigger>
          <TabsTrigger value="list">List View ({reservations.length})</TabsTrigger>
        </TabsList>

        {/* TIMELINE GANTT VIEW */}
        <TabsContent value="timeline" className="pt-3">
          <Card className="border-border bg-card/90 overflow-x-auto">
            <CardContent className="p-4 min-w-[800px]">
              {/* Header Hours Row */}
              <div className="grid grid-cols-14 gap-1 text-[11px] font-mono text-muted-foreground border-b border-border pb-2">
                <div className="font-bold text-white">Table</div>
                {hours.map((h) => (
                  <div key={h} className="text-center">
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border/40 mt-2">
                {tables.map((table: any) => {
                  const tableRes = reservations.filter((r: any) => r.tableId === table.id);

                  return (
                    <div
                      key={table.id}
                      className="grid grid-cols-14 gap-1 py-3 items-center text-xs"
                    >
                      <div className="font-semibold text-white truncate pr-2">
                        {table.name}
                      </div>

                      {/* 13 hour blocks */}
                      <div className="col-span-13 relative h-10 bg-secondary/20 rounded-lg border border-border/50">
                        {tableRes.map((res: any) => {
                          const startD = new Date(res.startsAt);
                          const endD = new Date(res.endsAt);
                          // Calculate start offset from 11:00 in minutes
                          const startHour = startD.getHours() + startD.getMinutes() / 60;
                          const durationH =
                            (endD.getTime() - startD.getTime()) / (1000 * 3600);

                          const leftPercent = Math.max(
                            0,
                            Math.min(100, ((startHour - 11) / 13) * 100)
                          );
                          const widthPercent = Math.min(
                            100 - leftPercent,
                            (durationH / 13) * 100
                          );

                          let blockColor = "bg-emerald-600/80 border-emerald-400";
                          if (res.status === "CHECKED_IN") blockColor = "bg-rose-700/80 border-rose-400";
                          if (res.status === "PENDING") blockColor = "bg-amber-600/80 border-amber-400";
                          if (res.status === "CANCELLED") blockColor = "bg-zinc-700/80 border-zinc-500 line-through opacity-50";

                          return (
                            <div
                              key={res.id}
                              style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                              }}
                              className={`absolute top-1 bottom-1 rounded-md border p-1 text-[10px] text-white font-medium truncate shadow-md ${blockColor}`}
                              title={`${res.code} • ${res.guestName} (${res.status})`}
                            >
                              <div className="truncate font-bold leading-none">
                                {res.guestName}
                              </div>
                              <span className="text-[9px] opacity-80">{res.code}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LIST VIEW */}
        <TabsContent value="list" className="pt-3 space-y-3">
          {reservations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No reservations booked for {selectedDate}.
            </div>
          ) : (
            reservations.map((r: any) => (
              <Card key={r.id} className="border-border bg-card/80 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{r.guestName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {r.code}
                      </Badge>
                      <Badge
                        variant={
                          r.status === "CONFIRMED"
                            ? "available"
                            : r.status === "CHECKED_IN"
                            ? "occupied"
                            : "outline"
                        }
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-[11px] mt-1 space-x-3">
                      <span>Phone: {r.guestPhone}</span>
                      <span>Table: {r.table?.name || r.tableType}</span>
                      <span>
                        Time:{" "}
                        {new Date(r.startsAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        –{" "}
                        {new Date(r.endsAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    {r.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(r.id, "CHECK_IN")}
                        className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 gap-1 font-semibold"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Check In
                      </Button>
                    )}
                    {r.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(r.id, "CONFIRM")}
                        className="text-xs h-8"
                      >
                        Confirm
                      </Button>
                    )}
                    {r.status !== "CANCELLED" && r.status !== "CHECKED_IN" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAction(r.id, "NO_SHOW")}
                          className="text-xs h-8 text-amber-400 hover:bg-amber-950/20"
                        >
                          No-Show
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAction(r.id, "CANCEL")}
                          className="text-xs h-8 text-red-400 hover:bg-red-950/20"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Manual Booking Dialog */}
      <Dialog open={manualModalOpen} onOpenChange={setManualModalOpen}>
        <DialogContent className="max-w-md bg-card border-emerald-900/60 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg">Add Phone / Walk-in Booking</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Directly reserve a table slot with real-time overlap safety check
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateManualBooking} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Guest Name *</Label>
              <Input
                placeholder="Rahul..."
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Guest Phone *</Label>
              <Input
                placeholder="+91..."
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Assign Table *</Label>
              <select
                value={manualTableId}
                onChange={(e) => setManualTableId(e.target.value)}
                required
                className="flex h-9 w-full rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
              >
                <option value="">Choose table...</option>
                {tables.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Start Time (IST)</Label>
                <Input
                  type="time"
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Duration (Hours)</Label>
                <select
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)}
                  className="flex h-9 w-full rounded border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="1">1 Hour</option>
                  <option value="2">2 Hours</option>
                  <option value="3">3 Hours</option>
                  <option value="4">4 Hours</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setManualModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} size="sm">
                {submitting ? "Booking..." : "Create Reservation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
