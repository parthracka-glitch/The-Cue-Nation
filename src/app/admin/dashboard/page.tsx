"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { venueStore } from "@/lib/store/venueStore";
import { Bill, Expense, GameTable, Booking, PaymentRecord, MaintenanceRecord } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  Calendar,
  Users,
  Layers,
  Wrench,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  Clock,
  Sparkles,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    grossRevenue: 0,
    netRevenue: 0,
    totalTimeRevenue: 0,
    totalFoodRevenue: 0,
    totalExpenses: 0,
    totalRefunds: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    activeSessionsCount: 0,
    freeTablesCount: 0,
    runningTablesCount: 0,
    maintenanceTablesCount: 0,
  });
  const [tables, setTables] = useState<GameTable[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);

  const reload = () => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.recentPayments) setRecentPayments(data.recentPayments);
      })
      .catch(() => {});

    setTables(venueStore.getTables());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const revenueChartData = [
    { name: "Mon", revenue: 4200, expenses: 1800 },
    { name: "Tue", revenue: 5100, expenses: 2200 },
    { name: "Wed", revenue: 6400, expenses: 1900 },
    { name: "Thu", revenue: 7800, expenses: 3100 },
    { name: "Fri", revenue: 11400, expenses: 4500 },
    { name: "Sat", revenue: 15800, expenses: 6200 },
    { name: "Sun", revenue: 14200, expenses: 5400 },
  ];

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <ShieldCheck className="w-3.5 h-3.5" />
                Executive Console · Cue Nation Club
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Business Intelligence & Metrics
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/admin/staff">
                <Button variant="secondary-dark" size="sm" className="gap-2 text-xs">
                  <Users className="w-4 h-4 text-bronze-glow" />
                  Staff Accounts
                </Button>
              </Link>
              <Link href="/admin/tables">
                <Button variant="secondary-dark" size="sm" className="gap-2 text-xs">
                  <Layers className="w-4 h-4 text-bronze-glow" />
                  Manage Tables
                </Button>
              </Link>
              <Link href="/admin/pricing">
                <Button variant="primary-dark" size="sm" className="gap-2 text-xs font-bold bg-bronze hover:bg-bronze-dark text-white">
                  <Percent className="w-4 h-4" />
                  Pricing Controls
                </Button>
              </Link>
            </div>
          </div>

          {/* Primary KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-midnight-card border border-midnight-line p-6 rounded-2xl shadow-card space-y-2">
              <div className="flex items-center justify-between text-xs text-mist font-semibold">
                <span>Gross Collections</span>
                <DollarSign className="w-4 h-4 text-baize-light" />
              </div>
              <div className="font-mono text-3xl font-black text-baize-light tabular-nums">
                ₹{metrics.grossRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-mist">
                Time: ₹{metrics.totalTimeRevenue} · Café: ₹{metrics.totalFoodRevenue}
              </div>
            </div>

            <div className="bg-midnight-card border border-midnight-line p-6 rounded-2xl shadow-card space-y-2">
              <div className="flex items-center justify-between text-xs text-mist font-semibold">
                <span>Net Profitability</span>
                <TrendingUp className="w-4 h-4 text-bronze-glow" />
              </div>
              <div className="font-mono text-3xl font-black text-bronze-glow tabular-nums">
                ₹{metrics.netRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-mist">
                Refunds: ₹{metrics.totalRefunds} · Expenses: ₹{metrics.totalExpenses}
              </div>
            </div>

            <div className="bg-midnight-card border border-midnight-line p-6 rounded-2xl shadow-card space-y-2">
              <div className="flex items-center justify-between text-xs text-mist font-semibold">
                <span>Active Floor Sessions</span>
                <Clock className="w-4 h-4 text-amber" />
              </div>
              <div className="font-mono text-3xl font-black text-amber tabular-nums">
                {metrics.activeSessionsCount}
              </div>
              <div className="text-[11px] text-mist">
                {metrics.freeTablesCount} Free · {metrics.runningTablesCount} In Play · {metrics.maintenanceTablesCount} Maint
              </div>
            </div>

            <div className="bg-midnight-card border border-midnight-line p-6 rounded-2xl shadow-card space-y-2">
              <div className="flex items-center justify-between text-xs text-mist font-semibold">
                <span>Total Bookings</span>
                <Calendar className="w-4 h-4 text-cream" />
              </div>
              <div className="font-mono text-3xl font-black text-cream tabular-nums">
                {metrics.totalBookings}
              </div>
              <div className="text-[11px] text-mist">
                {metrics.confirmedBookings} Confirmed reservations on file
              </div>
            </div>
          </div>

          {/* Revenue Analytics Chart */}
          <div className="bg-midnight-card border border-midnight-line rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-cream">
                  7-Day Revenue & Expense Flow
                </h3>
                <p className="text-xs text-mist mt-0.5">Authoritative settlement data in INR (₹)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-baize-light">
                  <span className="w-2.5 h-2.5 rounded-full bg-baize-light" /> Gross Revenue
                </span>
                <span className="flex items-center gap-1.5 text-cue-light">
                  <span className="w-2.5 h-2.5 rounded-full bg-cue-light" /> Expenses
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2B29" vertical={false} />
                  <XAxis dataKey="name" stroke="#6D5330" tick={{ fill: "#EDDFC2", fontSize: 12 }} />
                  <YAxis stroke="#6D5330" tick={{ fill: "#EDDFC2", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0D1716",
                      borderColor: "#1E2B29",
                      color: "#EDDFC2",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#2FA39A" radius={[6, 6, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#A83232" radius={[6, 6, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Matrix Quick Review */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-cream">
                Floor Arena Utilization Overview
              </h3>
              <Link href="/admin/tables" className="text-xs text-bronze-glow hover:underline font-semibold flex items-center gap-1">
                Full Tables Config <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className="bg-midnight-card border border-midnight-line rounded-2xl p-5 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-bronze-glow">
                      {t.type === "snooker" ? "12ft Tournament Snooker" : "9ft Match Pool"}
                    </span>
                    <h4 className="font-display text-lg font-bold text-cream mt-0.5">{t.name}</h4>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status === "running"
                          ? "bg-baize-light/20 text-baize-light border border-baize-light/30"
                          : t.status === "free"
                          ? "bg-white/10 text-cream"
                          : t.status === "maintenance"
                          ? "bg-cue-light/20 text-cue-light"
                          : "bg-amber/20 text-amber"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
