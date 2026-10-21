"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  DollarSign,
  TrendingUp,
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

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState({
    grossRevenue: 0,
    netRevenue: 0,
    totalTimeRevenue: 0,
    totalFoodRevenue: 0,
    totalExpenses: 0,
    totalRefunds: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
  });

  const [tableUtilization, setTableUtilization] = useState<
    Array<{ id: string; name: string; type: string; totalSessions: number }>
  >([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.tableUtilization) setTableUtilization(data.tableUtilization);
      })
      .catch(() => {});
  }, []);

  const chartData = [
    { category: "Match Pool", hours: 48, revenue: 16800 },
    { category: "Snooker", hours: 35, revenue: 17500 },
    { category: "Artisan Coffee", hours: 0, revenue: 4200 },
    { category: "Snacks & Food", hours: 0, revenue: 6800 },
  ];

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Metric,Value",
       `Gross Collections,INR ${metrics.grossRevenue}`,
       `Net Profitability,INR ${metrics.netRevenue}`,
       `Table Time Revenue,INR ${metrics.totalTimeRevenue}`,
       `Cafe Food Revenue,INR ${metrics.totalFoodRevenue}`,
       `Total Expenses,INR ${metrics.totalExpenses}`,
       `Total Refunds,INR ${metrics.totalRefunds}`,
       `Total Bookings,${metrics.totalBookings}`,
       `Confirmed Bookings,${metrics.confirmedBookings}`,
       `Completed Bookings,${metrics.completedBookings}`
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cue_nation_financial_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <BarChart3 className="w-3.5 h-3.5" />
                Financial Intelligence & Utilization Export
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Reports & Performance Analytics
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary-dark"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2 font-bold bg-bronze hover:bg-bronze-dark text-white shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Financial CSV
              </Button>
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-midnight-card border border-midnight-line p-6 rounded-2xl space-y-2">
              <span className="text-xs text-mist font-semibold">Total Net Revenue</span>
              <div className="font-mono text-3xl font-black text-baize-light">
                ₹{metrics.netRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-mist">
                Gross: ₹{metrics.grossRevenue.toLocaleString()} minus expenses & refunds
              </p>
            </div>

            <div className="bg-midnight-card border border-midnight-line p-6 rounded-2xl space-y-2">
              <span className="text-xs text-mist font-semibold">Revenue Split (Time vs Food)</span>
              <div className="font-mono text-xl font-bold text-bronze-glow">
                ₹{metrics.totalTimeRevenue} <span className="text-xs text-mist">/</span> ₹{metrics.totalFoodRevenue}
              </div>
              <p className="text-[11px] text-mist">
                Time charges represent ~75% of total venue intake
              </p>
            </div>

            <div className="bg-midnight-card border border-midnight-line p-6 rounded-2xl space-y-2">
              <span className="text-xs text-mist font-semibold">Reservation Completion Rate</span>
              <div className="font-mono text-3xl font-black text-cream">
                {metrics.totalBookings > 0
                  ? Math.round((metrics.completedBookings / metrics.totalBookings) * 100)
                  : 100}
                %
              </div>
              <p className="text-[11px] text-mist">
                {metrics.completedBookings} completed of {metrics.totalBookings} total bookings
              </p>
            </div>
          </div>

          {/* Revenue Breakdown Chart */}
          <div className="bg-midnight-card border border-midnight-line rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display text-xl font-bold text-cream">
              Revenue Stream Breakdown
            </h3>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2B29" vertical={false} />
                  <XAxis dataKey="category" stroke="#6D5330" tick={{ fill: "#EDDFC2", fontSize: 12 }} />
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
                  <Bar dataKey="revenue" fill="#B8925A" radius={[6, 6, 0, 0]} name="Intake (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Utilization Summary */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg p-6 space-y-4">
            <h3 className="font-display text-xl font-bold text-cream">
              Table Arena Frame Count & Utilization
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3 px-4">Table Name</th>
                    <th className="py-3 px-4">Discipline</th>
                    <th className="py-3 px-4">Recorded Sessions</th>
                    <th className="py-3 px-4">Estimated Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {tableUtilization.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-cream">{t.name}</td>
                      <td className="py-3.5 px-4 font-medium text-bronze-glow uppercase text-[10px]">
                        {t.type}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-cream">{t.totalSessions}</td>
                      <td className="py-3.5 px-4 font-mono text-mist">
                        ~{t.totalSessions * 1.5} hrs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
