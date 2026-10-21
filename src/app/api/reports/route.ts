import { NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";

export async function GET() {
  const bills = backendDataStore.bills;
  const payments = backendDataStore.payments;
  const expenses = backendDataStore.expenses;
  const bookings = backendDataStore.bookings;
  const sessions = backendDataStore.sessions;
  const tables = backendDataStore.tables;

  // Gross collections from paid bills
  const paidBills = bills.filter((b) => b.paid);
  const totalBillRevenue = paidBills.reduce((acc, b) => acc + b.total, 0);
  const totalTimeRevenue = paidBills.reduce((acc, b) => acc + b.time_charge, 0);
  const totalFoodRevenue = paidBills.reduce((acc, b) => acc + b.food_charge, 0);

  // Collections from direct payment records
  const paidPayments = payments.filter((p) => p.status === "paid");
  const directPaidTotal = paidPayments.reduce((acc, p) => acc + p.amount, 0);

  const refundedPayments = payments.filter((p) => p.status === "refunded");
  const totalRefunds = refundedPayments.reduce((acc, p) => acc + p.amount, 0);

  const grossRevenue = Math.max(totalBillRevenue, directPaidTotal);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netRevenue = grossRevenue - totalRefunds - totalExpenses;

  // Booking counts
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const checkedInBookings = bookings.filter((b) => b.status === "checked_in").length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

  // Active floor counts
  const activeSessionsCount = sessions.filter((s) => !s.ended_at).length;
  const freeTablesCount = tables.filter((t) => t.status === "free").length;
  const runningTablesCount = tables.filter((t) => t.status === "running").length;
  const bookedTablesCount = tables.filter((t) => t.status === "booked").length;
  const maintenanceTablesCount = tables.filter((t) => t.status === "maintenance").length;

  // Table utilization breakdown
  const tableUtilization = tables.map((t) => {
    const tableSessions = sessions.filter((s) => s.table_id === t.id);
    const totalSessions = tableSessions.length;
    const isOccupied = t.status === "running";
    return {
      id: t.id,
      name: t.name,
      type: t.type,
      status: t.status,
      totalSessions,
      isOccupied,
    };
  });

  return NextResponse.json({
    metrics: {
      grossRevenue,
      netRevenue,
      totalTimeRevenue,
      totalFoodRevenue,
      totalExpenses,
      totalRefunds,
      totalBookings,
      confirmedBookings,
      checkedInBookings,
      completedBookings,
      cancelledBookings,
      activeSessionsCount,
      freeTablesCount,
      runningTablesCount,
      bookedTablesCount,
      maintenanceTablesCount,
    },
    tableUtilization,
    expenses,
    recentPayments: payments.slice(0, 20),
  });
}
