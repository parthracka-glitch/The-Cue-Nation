"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { venueStore } from "@/lib/store/venueStore";
import { Bill } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { ProfessionalBillModal } from "@/components/billing/ProfessionalBillModal";
import { downloadBillPdf, BillPdfData } from "@/lib/billing/pdfGenerator";
import { getWhatsAppClickToChatUrl, WhatsAppBillDetails } from "@/lib/billing/whatsappHelper";
import { formatDateTimeIST, formatTimeIST } from "@/lib/time";
import Link from "next/link";
import {
  Receipt,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  FileText,
  Download,
  Share2,
  CreditCard,
  User,
} from "lucide-react";
import { StaffNav } from "@/components/staff/StaffNav";

function StaffBillingContent() {
  const searchParams = useSearchParams();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const reload = () => {
    const list = venueStore.getBills();
    setBills(list);

    const initialBillId = searchParams.get("billId");
    if (initialBillId) {
      const match = list.find((b) => b.id === initialBillId || b.bill_number === initialBillId);
      if (match) {
        setSelectedBill(match);
        setIsBillModalOpen(true);
      }
    }
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, [searchParams]);

  // Quick direct PDF download
  const handleQuickDownloadPdf = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = bill.session;
    const table = bill.table || (session?.table_id ? venueStore.getTables().find((t) => t.id === session.table_id) : undefined);
    const booking = bill.booking || (session?.booking_id ? venueStore.getBookings().find((b) => b.id === session.booking_id) : undefined);

    const startAt = session?.started_at ? new Date(session.started_at) : new Date(bill.created_at || Date.now());
    const endAt = session?.ended_at ? new Date(session.ended_at) : new Date(bill.created_at || Date.now());
    const durationMinutes = Math.max(1, Math.round((endAt.getTime() - startAt.getTime()) / 60000));

    const billNumber = bill.bill_number || `QN-${new Date().getFullYear()}-${bill.id.replace(/[^0-9]/g, "").slice(-5) || "00001"}`;
    const amountPaid = bill.amount_paid ?? (bill.paid ? bill.total : 0);
    const balanceDue = bill.balance_due ?? (bill.paid ? 0 : bill.total);

    const pdfData: BillPdfData = {
      billNumber,
      issueDate: formatDateTimeIST(bill.created_at ? new Date(bill.created_at) : new Date()),
      customerName: booking?.guest_name || "Valued Guest",
      customerPhone: booking?.guest_phone || undefined,
      bookingCode: booking?.booking_code,
      gameCategory: table?.type === "snooker" ? "Snooker" : "Pool",
      tableName: table?.name || "Tournament Table",
      sessionStartTime: formatTimeIST(startAt),
      sessionEndTime: formatTimeIST(endAt),
      durationMinutes,
      hourlyRate: table?.hourly_rate || (table?.type === "snooker" ? 500 : 350),
      timeCharge: bill.time_charge,
      subtotal: bill.time_charge + bill.food_charge,
      taxAmount: bill.tax_amount || 0,
      total: bill.total,
      amountPaid,
      balanceDue,
      paymentStatus: bill.paid ? "Paid" : "Payment Due",
      paymentMethod: bill.pay_mode,
    };

    downloadBillPdf(pdfData);
  };

  // Quick WhatsApp share
  const handleQuickWhatsApp = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = bill.session;
    const table = bill.table || (session?.table_id ? venueStore.getTables().find((t) => t.id === session.table_id) : undefined);
    const booking = bill.booking || (session?.booking_id ? venueStore.getBookings().find((b) => b.id === session.booking_id) : undefined);

    const startAt = session?.started_at ? new Date(session.started_at) : new Date(bill.created_at || Date.now());
    const endAt = session?.ended_at ? new Date(session.ended_at) : new Date(bill.created_at || Date.now());
    const durationMinutes = Math.max(1, Math.round((endAt.getTime() - startAt.getTime()) / 60000));
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durationFormatted = hours > 0 ? `${hours} hr ${mins > 0 ? `${mins} min` : ""}`.trim() : `${mins} min`;

    const billNumber = bill.bill_number || `QN-${new Date().getFullYear()}-${bill.id.replace(/[^0-9]/g, "").slice(-5) || "00001"}`;
    const amountPaid = bill.amount_paid ?? (bill.paid ? bill.total : 0);
    const balanceDue = bill.balance_due ?? (bill.paid ? 0 : bill.total);

    const details: WhatsAppBillDetails = {
      customerName: booking?.guest_name || "Valued Guest",
      customerPhone: booking?.guest_phone || "",
      billNumber,
      gameCategory: table?.type === "snooker" ? "Snooker" : "Pool",
      tableName: table?.name || "Tournament Table",
      dateStr: startAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      playingTimeRange: `${formatTimeIST(startAt)} – ${formatTimeIST(endAt)}`,
      durationFormatted,
      totalAmount: bill.total,
      amountPaid,
      balanceDue,
      paymentStatus: bill.paid ? "Paid" : "Payment Due",
      payMode: bill.pay_mode,
    };

    const res = getWhatsAppClickToChatUrl(booking?.guest_phone || "", details);
    if (!res.isValid) {
      alert(`Cannot open WhatsApp: ${res.error || "No valid contact number found for this booking"}`);
      return;
    }

    // Also download PDF so staff has it ready to attach
    handleQuickDownloadPdf(bill, e);

    // Open WhatsApp
    window.open(res.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-midnight-line">
            <div className="flex items-center gap-4">
              <Link href="/staff">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-mist hover:text-cream border border-midnight-line"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Floor Grid
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-bronze-glow" />
                  <span className="text-xs uppercase tracking-widest font-bold text-mist">
                    POINT OF SALE (POS) & BILLING
                  </span>
                </div>
                <h1 className="font-display text-3xl font-bold text-cream mt-1">
                  Official Invoices & Receipts
                </h1>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={reload}
              className="text-mist hover:text-cream border border-midnight-line self-start sm:self-auto gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>

          {/* Bills Table */}
          <div className="bg-midnight-card rounded-2xl border border-midnight-line overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-mist">
                <thead className="bg-midnight text-xs uppercase font-bold text-mist border-b border-midnight-line">
                  <tr>
                    <th className="py-4 px-6">Bill Number</th>
                    <th className="py-4 px-6">Customer & Table</th>
                    <th className="py-4 px-6">Time Play</th>
                    <th className="py-4 px-6">Café Orders</th>
                    <th className="py-4 px-6">Grand Total</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line">
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-mist">
                        No billing records found. Conclude a session on the Floor Grid to generate an invoice.
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => {
                      const session = bill.session;
                      const table = bill.table || (session?.table_id ? venueStore.getTables().find((t) => t.id === session.table_id) : undefined);
                      const booking = bill.booking || (session?.booking_id ? venueStore.getBookings().find((b) => b.id === session.booking_id) : undefined);
                      const billNum = bill.bill_number || `QN-${new Date().getFullYear()}-${bill.id.replace(/[^0-9]/g, "").slice(-5) || "00001"}`;

                      return (
                        <tr
                          key={bill.id}
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsBillModalOpen(true);
                          }}
                          className="hover:bg-midnight/50 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-6 font-mono text-cream font-bold">
                            <span className="text-bronze-glow">{billNum}</span>
                            <div className="text-[10px] text-mist font-normal">#{bill.id}</div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="font-semibold text-cream flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-mist" />
                              {booking?.guest_name || "Valued Guest"}
                            </div>
                            <div className="text-xs text-mist">
                              {table?.name || "Tournament Table"} · {table?.type === "snooker" ? "Snooker" : "Pool"}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-cream font-semibold tabular-nums font-mono">
                            ₹{bill.time_charge.toFixed(2)}
                          </td>

                          <td className="py-4 px-6 text-cream font-semibold tabular-nums font-mono">
                            ₹{bill.food_charge.toFixed(2)}
                          </td>

                          <td className="py-4 px-6 font-display text-lg font-bold text-bronze-glow tabular-nums">
                            ₹{bill.total.toFixed(2)}
                          </td>

                          <td className="py-4 px-6">
                            {bill.paid ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-baize-light/15 text-baize-light border border-baize-light/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                PAID ({bill.pay_mode?.toUpperCase() || "SETTLED"})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber/20 text-amber border border-amber/40 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                PAYMENT DUE
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                            <Button
                              variant="secondary-dark"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBill(bill);
                                setIsBillModalOpen(true);
                              }}
                              className="text-xs gap-1 border-midnight-line"
                              title="View Professional Invoice"
                            >
                              <FileText className="w-3.5 h-3.5 text-bronze-glow" /> View Bill
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleQuickDownloadPdf(bill, e)}
                              className="text-xs text-mist hover:text-cream border border-midnight-line p-2"
                              title="Download PDF Invoice"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleQuickWhatsApp(bill, e)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 p-2"
                              title="Share via WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </Button>

                            {!bill.paid && (
                              <Button
                                variant="primary-dark"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBill(bill);
                                  setIsBillModalOpen(true);
                                }}
                                className="text-xs font-bold bg-amber hover:bg-amber/90 text-midnight"
                              >
                                Collect
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL BILL / INVOICE PREVIEW & ACTIONS MODAL */}
      <ProfessionalBillModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setSelectedBill(null);
        }}
        bill={selectedBill}
        onPaymentSettled={reload}
      />
    </div>
  );
}

export default function StaffBillingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-midnight text-cream p-12 text-center flex items-center justify-center">
          <div className="animate-pulse text-bronze-glow font-bold">Loading POS Billing...</div>
        </div>
      }
    >
      <StaffBillingContent />
    </Suspense>
  );
}
