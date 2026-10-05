"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Bell,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const { data, mutate, isLoading } = useSWR("/api/admin/settings", fetcher);

  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
        Loading settings...
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="p-8 rounded-xl border border-destructive/40 bg-destructive/10 text-center max-w-lg mx-auto my-16">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg">Unable to Access Settings</h3>
        <p className="text-sm text-muted-foreground mt-2">{data.error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const { settings = {}, notifications = [], auditLogs = [] } = data || {};

  async function handleResetDemo() {
    if (!confirm("Are you sure you want to reset all tables, sessions, and re-seed clean demo data?")) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_DEMO" }),
      });
      if (res.ok) {
        setResetSuccess(true);
        mutate();
        setTimeout(() => setResetSuccess(false), 4000);
      }
    } catch (e) {
      alert("Failed to reset demo data");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-400" /> Venue Settings & Logs
          </h1>
          <p className="text-xs text-muted-foreground">
            Operating parameters, simulated messaging log, staff audit records, and demo database reset.
          </p>
        </div>

        <Button
          onClick={handleResetDemo}
          disabled={resetting}
          variant="destructive"
          size="sm"
          className="text-xs gap-1.5 font-bold"
        >
          {resetting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Resetting...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" /> Reset Demo Data
            </>
          )}
        </Button>
      </div>

      {resetSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-300 font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Demo database reset and seeded successfully!</span>
        </div>
      )}

      <Tabs defaultValue="venue">
        <TabsList>
          <TabsTrigger value="venue">Venue Configuration</TabsTrigger>
          <TabsTrigger value="notifications">
            Simulated Notification Log ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="audit">Audit Log ({auditLogs.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Venue Configuration */}
        <TabsContent value="venue" className="pt-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border bg-card/80 p-4 space-y-2 text-xs">
              <span className="font-bold text-white block">Venue Operating Hours</span>
              <div className="flex justify-between text-muted-foreground">
                <span>Opening Time:</span>
                <span className="text-white font-mono">{settings.opening_time || "11:00"}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Closing Time:</span>
                <span className="text-white font-mono">{settings.closing_time || "24:00 (Midnight)"}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Slot Duration:</span>
                <span className="text-white font-mono">{settings.slot_length_min || 60} Minutes</span>
              </div>
            </Card>

            <Card className="border-border bg-card/80 p-4 space-y-2 text-xs">
              <span className="font-bold text-white block">Financial & Tax Rules</span>
              <div className="flex justify-between text-muted-foreground">
                <span>Currency:</span>
                <span className="text-white font-mono">INR (₹)</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST Tax Rate:</span>
                <span className="text-white font-mono">{settings.gst_percent || 5.0}%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Online Booking Deposit:</span>
                <span className="text-white font-mono">{settings.deposit_percent || 20}%</span>
              </div>
            </Card>

            <Card className="border-border bg-card/80 p-4 space-y-2 text-xs">
              <span className="font-bold text-white block">Wallet Top-Up Bonus</span>
              <div className="flex justify-between text-muted-foreground">
                <span>Trigger Threshold:</span>
                <span className="text-emerald-400 font-mono">₹1,000 Top-up</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Bonus Reward:</span>
                <span className="text-emerald-400 font-mono">10% Free Wallet Cash</span>
              </div>
            </Card>

            <Card className="border-border bg-card/80 p-4 space-y-2 text-xs">
              <span className="font-bold text-white block">Loyalty Points Program</span>
              <div className="flex justify-between text-muted-foreground">
                <span>Earning Ratio:</span>
                <span className="text-amber-400 font-mono">1 point per ₹100 spent</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Redemption Ratio:</span>
                <span className="text-amber-400 font-mono">₹1 discount per point</span>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Notification Log Viewer */}
        <TabsContent value="notifications" className="pt-3 space-y-3">
          <Card className="border-border bg-card/80">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-400" /> Simulated SMS & WhatsApp Notification Log
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect outbound confirmation messages generated by online bookings, cancellations, and khata reminders without external gateway keys.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No notifications recorded yet.
                </div>
              ) : (
                notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-lg border border-border bg-secondary/30 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={n.channel === "WHATSAPP" ? "available" : "secondary"}
                          className="text-[10px]"
                        >
                          {n.channel}
                        </Badge>
                        <span className="font-mono text-white font-semibold">To: {n.to}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed font-sans">{n.body}</p>
                    </div>

                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Audit Log Viewer */}
        <TabsContent value="audit" className="pt-3 space-y-3">
          <Card className="border-border bg-card/80">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" /> System Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">
                Tracks voided KOT items, manual discount overrides, and manager refunds.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No audit log entries recorded yet.
                </div>
              ) : (
                auditLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-border bg-secondary/30 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/40">
                          {log.action}
                        </Badge>
                        <span className="text-white font-semibold">{log.user?.name || "Staff"}</span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-[11px] font-mono">
                        Entity: {log.entity} #{log.entityId} {log.meta && `• ${log.meta}`}
                      </p>
                    </div>

                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
