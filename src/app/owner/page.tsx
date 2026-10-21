"use client";

import React, { useState, useEffect } from "react";
import { venueStore } from "@/lib/store/venueStore";
import { Bill, Expense, GameTable, MenuItem, Booking } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  Calendar,
  Users,
  Coffee,
  Download,
  Plus,
  Shield,
  FileSpreadsheet,
  FileText,
  Activity,
  Layers,
  Settings,
} from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function OwnerDashboardPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modals
  const [addExpenseModal, setAddExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("Café Inventory");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  const [addMenuModal, setAddMenuModal] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuCategory, setNewMenuCategory] = useState("Coffee");
  const [newMenuPrice, setNewMenuPrice] = useState("");

  const reload = () => {
    setBills(venueStore.getBills());
    setExpenses(venueStore.getExpenses());
    setTables(venueStore.getTables());
    setMenu(venueStore.getMenu());
    setBookings(venueStore.getBookings());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  // Compute Financial Metrics
  const totalRevenue = bills.reduce((acc, b) => acc + (b.paid ? b.total : 0), 0);
  const totalTimeRevenue = bills.reduce((acc, b) => acc + (b.paid ? b.time_charge : 0), 0);
  const totalCafeRevenue = bills.reduce((acc, b) => acc + (b.paid ? b.food_charge : 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const activeSessionsCount = venueStore.getSessions().filter((s) => !s.ended_at).length;

  // Chart data
  const revenueChartData = [
    { name: "Mon", revenue: 4200, expenses: 1800 },
    { name: "Tue", revenue: 5100, expenses: 2200 },
    { name: "Wed", revenue: 6400, expenses: 1900 },
    { name: "Thu", revenue: 7800, expenses: 3100 },
    { name: "Fri", revenue: 11400, expenses: 4500 },
    { name: "Sat", revenue: 15800, expenses: 6200 },
    { name: "Sun", revenue: 14200, expenses: 5400 },
  ];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) return;

    venueStore.addExpense(expenseCategory, amt, expenseNote);
    setAddExpenseModal(false);
    setExpenseAmount("");
    setExpenseNote("");
  };

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newMenuPrice);
    if (!newMenuName || isNaN(price)) return;

    venueStore.addMenuItem({
      name: newMenuName,
      category: newMenuCategory,
      price,
      available: true,
      image_url:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    });
    setAddMenuModal(false);
    setNewMenuName("");
    setNewMenuPrice("");
  };

  const handleExportCSV = () => {
    const rows = [
      ["Bill ID", "Time Charge", "Café Charge", "Total", "Payment Mode", "Date"],
      ...bills.map((b) => [
        b.id,
        b.time_charge,
        b.food_charge,
        b.total,
        b.pay_mode || "unpaid",
        b.paid_at || "pending",
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cue_nation_financial_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-cream-soft flex flex-col">
      <AdminNav />
      <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-baize" />
              <span className="text-xs uppercase tracking-widest font-bold text-baize">
                OWNER EXECUTIVE PORTAL
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-midnight mt-1">
              Parlour Performance & Control
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              className="gap-2 text-xs font-semibold"
            >
              <FileSpreadsheet className="w-4 h-4 text-baize" /> Export Financials (CSV)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddExpenseModal(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="light" className="p-6 border border-black/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-ash font-medium">
              <span>Gross Settled Revenue</span>
              <DollarSign className="w-4 h-4 text-baize" />
            </div>
            <div className="font-display text-3xl font-bold text-midnight tabular-nums">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-ash flex items-center justify-between pt-1">
              <span>Time: ₹{totalTimeRevenue}</span>
              <span>Café: ₹{totalCafeRevenue}</span>
            </div>
          </Card>

          <Card variant="light" className="p-6 border border-black/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-ash font-medium">
              <span>Total Recorded Expenses</span>
              <CreditCard className="w-4 h-4 text-cue" />
            </div>
            <div className="font-display text-3xl font-bold text-cue tabular-nums">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-ash pt-1">
              {expenses.length} expense vouchers logged
            </div>
          </Card>

          <Card variant="light" className="p-6 border border-black/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-ash font-medium">
              <span>Net Operating Margin</span>
              <TrendingUp className="w-4 h-4 text-baize" />
            </div>
            <div className="font-display text-3xl font-bold text-baize tabular-nums">
              ₹{netProfit.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-ash pt-1">
              Estimated margin: {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
            </div>
          </Card>

          <Card variant="light" className="p-6 border border-black/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-ash font-medium">
              <span>Active Playing Tables</span>
              <Activity className="w-4 h-4 text-bronze" />
            </div>
            <div className="font-display text-3xl font-bold text-bronze tabular-nums">
              {activeSessionsCount} / {tables.length}
            </div>
            <div className="text-xs text-ash pt-1">
              {bookings.length} reservations on register
            </div>
          </Card>
        </div>

        {/* Charts & Operational Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <Card variant="light" className="lg:col-span-2 p-6 border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-midnight">
                  Weekly Revenue vs Expenses
                </h3>
                <p className="text-xs text-ash">Daily breakdown in INR (₹)</p>
              </div>
              <span className="text-xs font-bold text-baize bg-baize/10 px-2.5 py-1 rounded-full">
                7-Day Overview
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" stroke="#5C5446" fontSize={12} />
                  <YAxis stroke="#5C5446" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#010101",
                      borderRadius: "12px",
                      color: "#EDDFC2",
                      border: "1px solid #1E2B29",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0A5551" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#A3303E" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Peak Hours Heatmap Card */}
          <Card variant="light" className="p-6 border border-black/10 space-y-4">
            <h3 className="font-display text-lg font-bold text-midnight">
              Hourly Utilization Heatmap
            </h3>
            <p className="text-xs text-ash">Average table occupancy by hour</p>

            <div className="space-y-2 pt-2">
              {[
                { time: "10:00 AM - 02:00 PM", pct: 35, label: "Morning Practice" },
                { time: "02:00 PM - 06:00 PM", pct: 60, label: "Afternoon Casual" },
                { time: "06:00 PM - 09:00 PM", pct: 95, label: "Peak Match Hours" },
                { time: "09:00 PM - 01:00 AM", pct: 85, label: "Late Night Club" },
              ].map((tier, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{tier.time}</span>
                    <span className="font-bold tabular-nums text-baize">{tier.pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-baize transition-all"
                      style={{ width: `${tier.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-black/5">
              <Link href="/staff">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Go to Live Staff Floor
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Expenses Table & Management */}
        <div className="bg-cream-card rounded-2xl border border-black/10 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-midnight">
                Operating Expense Ledger
              </h3>
              <p className="text-xs text-ash">Cloth replacement, roastery restock, and maintenance</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddExpenseModal(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Log Expense
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ash">
              <thead className="bg-cream text-xs uppercase font-bold text-midnight border-b border-black/10">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-midnight">
                      {exp.category}
                    </td>
                    <td className="py-3 px-4 font-display font-bold text-cue tabular-nums">
                      ₹{exp.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-xs">{exp.spent_on}</td>
                    <td className="py-3 px-4 text-xs text-ash">{exp.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Menu Items Editor */}
        <div className="bg-cream-card rounded-2xl border border-black/10 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-midnight">
                Artisanal Café Menu Items
              </h3>
              <p className="text-xs text-ash">Control prices and inventory available for table ordering</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddMenuModal(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> New Item
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {menu.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-black/10 bg-white flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-baize">
                      {item.category}
                    </span>
                    <span
                      onClick={() => venueStore.toggleMenuAvailability(item.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                        item.available
                          ? "bg-baize/10 text-baize"
                          : "bg-cue/10 text-cue"
                      }`}
                    >
                      {item.available ? "Available" : "Disabled"}
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-midnight mt-1">
                    {item.name}
                  </div>
                </div>

                <div className="font-display font-bold text-base text-bronze tabular-nums">
                  ₹{item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL: ADD EXPENSE */}
        <Modal
          isOpen={addExpenseModal}
          onClose={() => setAddExpenseModal(false)}
          title="Record Operating Expense"
          description="Log cost into accounting ledger."
        >
          <form onSubmit={handleAddExpense} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ash uppercase">Category</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm"
              >
                <option value="Table Maintenance">Table Maintenance (Felt, Cushions, Cues)</option>
                <option value="Café Inventory">Café Inventory (Coffee, Dairy, Food)</option>
                <option value="Utilities & Power">Utilities, Lighting & Air Conditioning</option>
                <option value="Staff Salaries">Staff Salaries & Honorarium</option>
                <option value="Marketing & Events">Marketing, Tournaments & Events</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ash uppercase">Amount (₹ INR)</label>
              <input
                type="number"
                required
                min="1"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm font-semibold tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ash uppercase">Note</label>
              <input
                type="text"
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                placeholder="Description / vendor details"
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button variant="primary" size="md" type="submit" className="w-full text-xs font-bold">
                Save Expense
              </Button>
              <Button
                variant="ghost"
                size="md"
                type="button"
                onClick={() => setAddExpenseModal(false)}
                className="text-ash"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: ADD MENU ITEM */}
        <Modal
          isOpen={addMenuModal}
          onClose={() => setAddMenuModal(false)}
          title="New Café / Bar Item"
          description="Add item to digital QR table menu."
        >
          <form onSubmit={handleAddMenuItem} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ash uppercase">Item Name</label>
              <input
                type="text"
                required
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="e.g. Iced Vanilla Nitro Brew"
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ash uppercase">Category</label>
              <select
                value={newMenuCategory}
                onChange={(e) => setNewMenuCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm"
              >
                <option value="Coffee">Coffee & Roastery</option>
                <option value="Beverages">Cold Beverages & Sparklers</option>
                <option value="Snacks">Gourmet Snacks & Bites</option>
                <option value="Mains">Mains & Sourdough Sandwiches</option>
                <option value="Desserts">Artisanal Desserts</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ash uppercase">Price (₹ INR)</label>
              <input
                type="number"
                required
                min="10"
                value={newMenuPrice}
                onChange={(e) => setNewMenuPrice(e.target.value)}
                placeholder="e.g. 220"
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm font-semibold tabular-nums"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button variant="primary" size="md" type="submit" className="w-full text-xs font-bold">
                Add to Menu
              </Button>
              <Button
                variant="ghost"
                size="md"
                type="button"
                onClick={() => setAddMenuModal(false)}
                className="text-ash"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
    </div>
  );
}
