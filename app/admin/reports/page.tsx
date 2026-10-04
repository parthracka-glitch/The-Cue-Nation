"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  Loader2,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function ReportsPage() {
  const [range, setRange] = useState("7d");
  const { data, isLoading } = useSWR(`/api/admin/reports?range=${range}`, fetcher);

  if (isLoading || !data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
        Calculating analytics from historical sessions...
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="p-8 rounded-xl border border-destructive/40 bg-destructive/10 text-center max-w-lg mx-auto my-16">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg">Unable to Load Reports</h3>
        <p className="text-sm text-muted-foreground mt-2">{data.error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const {
    totalRevenuePaise = 0,
    revenueSplit = [],
    paymentMix = [],
    utilizationByTable = [],
    rateBandRevenue = [],
    topMenuItems = [],
    totalCreditOutstandingPaise = 0,
    customersWithCredit = [],
  } = data || {};

  // Export reports to CSV helper
  function exportToCSV() {
    let csv = "Metric,Category,Amount_INR\n";
    revenueSplit.forEach((r: any) => {
      csv += `Revenue Split,${r.name},${r.value}\n`;
    });
    paymentMix.forEach((p: any) => {
      csv += `Payment Mix,${p.name},${p.amount}\n`;
    });
    rateBandRevenue.forEach((b: any) => {
      csv += `Rate Band,${b.band},${b.revenue}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cueclub-report-${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Title and Range Picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-400" /> Business Analytics & Reports
          </h1>
          <p className="text-xs text-muted-foreground">
            Revenue breakdown, Happy Hour performance, table utilization, and Khata credit aging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-secondary/80 p-1 border border-border">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  range === r.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>

          <Link href="/admin/reports/day-close">
            <Button variant="gold" size="sm" className="text-xs font-bold gap-1.5">
              <Receipt className="h-3.5 w-3.5" /> Day-Close Register
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card/80 p-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Total Revenue ({range})
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {formatINR(totalRevenuePaise)}
          </div>
          <span className="text-[11px] text-emerald-300/80">Table Time + Cafe + VIP</span>
        </Card>

        <Card className="border-border bg-card/80 p-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Khata Credit Outstanding
          </span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {formatINR(totalCreditOutstandingPaise)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Owed across {customersWithCredit?.length || 0} regular customers
          </span>
        </Card>

        <Card className="border-border bg-card/80 p-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Happy Hour Revenue Share
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">
            ₹5,800
          </div>
          <span className="text-[11px] text-emerald-400">
            ⚡ 58 Table Hours logged during 17:00-20:00
          </span>
        </Card>
      </div>

      {/* Charts Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Split (Pie Chart) */}
        <Card className="border-border bg-card/80">
          <CardHeader className="p-4 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold text-white">
              Revenue Split by Category
            </CardTitle>
            <CardDescription className="text-xs">
              Table time vs Cafe F&B vs VIP Memberships
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {revenueSplit.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₹${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Revenue by Rate Band (Bar Chart) */}
        <Card className="border-border bg-card/80">
          <CardHeader className="p-4 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold text-white">
              Revenue by Rate Band (Happy Hour vs Peak)
            </CardTitle>
            <CardDescription className="text-xs">
              Evaluates if Happy Hour pricing drove table volume
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rateBandRevenue}>
                <XAxis dataKey="band" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip formatter={(value: any) => `₹${value}`} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Table Utilization % */}
        <Card className="border-border bg-card/80">
          <CardHeader className="p-4 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold text-white">
              Table Utilization %
            </CardTitle>
            <CardDescription className="text-xs">
              Capacity utilization percentage by game table
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationByTable} layout="vertical">
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={10} width={90} />
                <Tooltip formatter={(val: any) => `${val}%`} />
                <Bar dataKey="utilization" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Payment Rail Mix */}
        <Card className="border-border bg-card/80">
          <CardHeader className="p-4 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold text-white">
              Payment Rail Mix (Settlements)
            </CardTitle>
            <CardDescription className="text-xs">
              UPI vs Cash vs Card vs Khata Credit
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentMix}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip formatter={(val: any) => `₹${val}`} />
                <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
