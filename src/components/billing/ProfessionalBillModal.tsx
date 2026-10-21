"use client";

import React, { useState } from "react";
import { Bill } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatDateTimeIST, formatTimeIST } from "@/lib/time";
import { downloadBillPdf, BillPdfData } from "@/lib/billing/pdfGenerator";
import {
  normalizeWhatsAppNumber,
  generateWhatsAppMessage,
  getWhatsAppClickToChatUrl,
  WhatsAppBillDetails,
} from "@/lib/billing/whatsappHelper";
import { venueStore } from "@/lib/store/venueStore";
import clsx from "clsx";
import {
  Receipt,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  Clock,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface ProfessionalBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onPaymentSettled?: () => void;
}

export function ProfessionalBillModal({
  isOpen,
  onClose,
  bill,
  onPaymentSettled,
}: ProfessionalBillModalProps) {
  const [selectedPayMode, setSelectedPayMode] = useState<"cash" | "upi" | "card">("upi");
  const [isSettling, setIsSettling] = useState(false);
  const [settleError, setSettleError] = useState("");
  const [whatsAppNotice, setWhatsAppNotice] = useState<string | null>(null);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  if (!bill) return null;

  // Extract session, table, booking data
  const session = bill.session;
  const table = bill.table || (session?.table_id ? venueStore.getTables().find((t) => t.id === session.table_id) : undefined);
  const booking = bill.booking || (session?.booking_id ? venueStore.getBookings().find((b) => b.id === session.booking_id) : undefined);

  const customerName = booking?.guest_name || "Valued Guest";
  const customerPhone = booking?.guest_phone || "";
  const gameCategory = table?.type === "snooker" ? "Snooker" : "Pool";
  const tableName = table?.name || (table?.type === "snooker" ? "Snooker Table" : "Pool Table");

  // Calculate actual duration
  const startAt = session?.started_at ? new Date(session.started_at) : new Date(bill.created_at || Date.now());
  const endAt = session?.ended_at ? new Date(session.ended_at) : new Date(bill.created_at || Date.now());
  const durationMinutes = Math.max(1, Math.round((endAt.getTime() - startAt.getTime()) / 60000));
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationFormatted = hours > 0 ? `${hours} hr ${mins > 0 ? `${mins} min` : ""}`.trim() : `${mins} min`;

  const dateStr = startAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const playingTimeRange = `${formatTimeIST(startAt)} – ${formatTimeIST(endAt)}`;

  const hourlyRate = table?.hourly_rate || (table?.type === "snooker" ? 500 : 350);
  const billNumber = bill.bill_number || `QN-${new Date().getFullYear()}-${bill.id.replace(/[^0-9]/g, "").slice(-5) || "00001"}`;

  const isPaid = bill.paid;
  const amountPaid = bill.amount_paid ?? (isPaid ? bill.total : 0);
  const balanceDue = bill.balance_due ?? (isPaid ? 0 : bill.total);
  const paymentStatus = isPaid ? "Paid" : balanceDue < bill.total && balanceDue > 0 ? "Partially Paid" : "Payment Due";

  // Get food orders for this session if any
  const sessionOrders = venueStore.getOrders().filter((o) => o.session_id === bill.session_id);
  const foodOrders = sessionOrders.flatMap((o) =>
    (o.items || []).map((item) => ({
      name: item.menu_item?.name || "Café Refreshment",
      qty: item.qty,
      price: item.price,
      total: item.price * item.qty,
    }))
  );

  // Prepare PDF data payload
  const buildPdfData = (): BillPdfData => ({
    billNumber,
    issueDate: formatDateTimeIST(bill.created_at ? new Date(bill.created_at) : new Date()),
    customerName,
    customerPhone: customerPhone || undefined,
    bookingCode: booking?.booking_code,
    gameCategory,
    tableName,
    sessionStartTime: formatTimeIST(startAt),
    sessionEndTime: formatTimeIST(endAt),
    durationMinutes,
    hourlyRate,
    timeCharge: bill.time_charge,
    foodOrders: foodOrders.length > 0 ? foodOrders : undefined,
    subtotal: bill.time_charge + bill.food_charge,
    taxAmount: bill.tax_amount || 0,
    total: bill.total,
    amountPaid,
    balanceDue,
    paymentStatus,
    paymentMethod: bill.pay_mode,
  });

  // Handle PDF Download
  const handleDownloadPdf = () => {
    setIsPdfDownloading(true);
    try {
      const data = buildPdfData();
      downloadBillPdf(data);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  // Handle WhatsApp Share
  const handleShareWhatsApp = () => {
    setWhatsAppNotice(null);

    const whatsAppDetails: WhatsAppBillDetails = {
      customerName,
      customerPhone,
      billNumber,
      gameCategory,
      tableName,
      dateStr,
      playingTimeRange,
      durationFormatted,
      totalAmount: bill.total,
      amountPaid,
      balanceDue,
      paymentStatus,
      payMode: bill.pay_mode,
    };

    const result = getWhatsAppClickToChatUrl(customerPhone, whatsAppDetails);

    if (!result.isValid) {
      setWhatsAppNotice(
        `Unable to open WhatsApp: ${result.error || "Please ensure the customer has a valid phone number stored."}`
      );
      return;
    }

    // Automatically trigger PDF download so staff has the genuine invoice ready to attach
    try {
      const pdfData = buildPdfData();
      downloadBillPdf(pdfData);
    } catch (e) {
      console.warn("Auto-downloading PDF for attachment failed:", e);
    }

    // Open WhatsApp Click-to-Chat in a new window/tab
    window.open(result.url, "_blank", "noopener,noreferrer");

    setWhatsAppNotice(
      `WhatsApp opened with pre-filled invoice message! The PDF invoice has also been downloaded to your device so you can attach it in the chat.`
    );
  };

  // Handle Settlement
  const handleSettle = async () => {
    setIsSettling(true);
    setSettleError("");

    try {
      // 1. Update local store
      venueStore.markBillPaid(bill.id, selectedPayMode);

      // 2. Synchronize with backend API
      try {
        await fetch(`/api/bills/${bill.id}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payMode: selectedPayMode,
            amountPaid: bill.total,
          }),
        });
      } catch (apiErr) {
        console.warn("Backend payment sync notice:", apiErr);
      }

      onPaymentSettled?.();
    } catch (err: any) {
      setSettleError(err.message || "Failed to record payment");
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="2xl"
      isDark
    >
      <div className="space-y-6 -mt-2">
        {/* BRAND INVOICE HEADER */}
        <div className="bg-midnight/90 border border-midnight-line rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-card">
          <div className="absolute top-0 right-0 w-48 h-48 bg-bronze-glow/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-midnight-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-bronze-glow" />
                <span className="font-display font-black text-2xl tracking-wide text-cream">
                  CUE NATION
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-widest text-bronze-glow font-bold mt-0.5">
                Championship Parlour & Lounge · Own the Table
              </p>
              <p className="text-[11px] text-mist mt-1 max-w-sm">
                80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034
                <br />
                Concierge Desk: +91 80 4123 4567 | concierge@cuenation.club
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-bronze-glow/15 text-bronze-glow border border-bronze-glow/30">
                Official Bill / Invoice
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black text-cream mt-1">
                {billNumber}
              </div>
              <div className="text-xs text-mist mt-0.5">
                Issue Date: <span className="text-cream font-semibold">{dateStr}</span>
              </div>
            </div>
          </div>

          {/* STATUS PILL & QUICK METADATA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-mist">Payment Status:</span>
              {isPaid ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-baize-light/15 text-baize-light border border-baize-light/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PAID ({bill.pay_mode?.toUpperCase() || "SETTLED"})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber/20 text-amber border border-amber/40 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  PAYMENT DUE
                </span>
              )}
            </div>

            {booking?.booking_code && (
              <div className="text-mist">
                Ref Code: <span className="font-mono text-cream font-bold">{booking.booking_code}</span>
              </div>
            )}
          </div>
        </div>

        {/* CUSTOMER & SESSION DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Column */}
          <div className="bg-midnight/50 border border-midnight-line rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-mist">
              Customer Details
            </span>
            <div className="text-sm font-bold text-cream">
              {customerName}
            </div>
            <div className="text-xs text-mist flex items-center gap-1.5">
              <span>WhatsApp / Contact:</span>
              <span className="font-mono text-cream font-semibold">
                {customerPhone || "Not specified (Walk-in)"}
              </span>
            </div>
          </div>

          {/* Game & Table Column */}
          <div className="bg-midnight/50 border border-midnight-line rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-mist">
              Session Arena & Time
            </span>
            <div className="text-sm font-bold text-cream flex items-center justify-between">
              <span>{tableName}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-midnight border border-midnight-line text-bronze-glow">
                {gameCategory}
              </span>
            </div>
            <div className="text-xs text-mist flex flex-col gap-0.5">
              <div>
                Time: <span className="text-cream font-semibold">{playingTimeRange}</span>
              </div>
              <div>
                Duration: <span className="text-bronze-glow font-bold">{durationFormatted}</span>
                <span className="text-mist"> (@ ₹{hourlyRate}/hr)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ITEMIZED PRICING TABLE */}
        <div className="bg-midnight/60 border border-midnight-line rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-midnight border-b border-midnight-line text-[10px] uppercase font-bold text-mist tracking-wider">
              <tr>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4 text-center">Qty / Duration</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight-line text-mist">
              {/* Table Play Line Item */}
              <tr>
                <td className="py-3 px-4 text-cream font-semibold">
                  <div>Table Play: {tableName}</div>
                  <div className="text-[10px] text-mist">{gameCategory} Session Playtime</div>
                </td>
                <td className="py-3 px-4 text-center font-mono">{durationFormatted}</td>
                <td className="py-3 px-4 text-right font-mono">₹{hourlyRate}/hr</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-cream">
                  ₹{bill.time_charge.toFixed(2)}
                </td>
              </tr>

              {/* Food & Café Line Items */}
              {foodOrders.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 text-cream">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-mist">Kitchen / Bar Order</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">{item.qty}x</td>
                  <td className="py-3 px-4 text-right font-mono">₹{item.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-cream">
                    ₹{item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* FINANCIAL SUMMARY */}
          <div className="bg-midnight/90 border-t border-midnight-line p-4 space-y-2">
            <div className="flex justify-between text-xs text-mist">
              <span>Subtotal</span>
              <span className="font-mono text-cream">₹{(bill.time_charge + bill.food_charge).toFixed(2)}</span>
            </div>

            {bill.tax_amount ? (
              <div className="flex justify-between text-xs text-mist">
                <span>Taxes & Service Charge (5% GST)</span>
                <span className="font-mono text-cream">₹{bill.tax_amount.toFixed(2)}</span>
              </div>
            ) : null}

            <div className="flex justify-between items-center text-sm font-bold border-t border-midnight-line pt-2 text-cream">
              <span>Grand Total</span>
              <span className="font-display text-xl text-bronze-glow font-black">
                ₹{bill.total.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-baize-light font-semibold">
              <span>Amount Paid</span>
              <span className="font-mono">₹{amountPaid.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs text-amber font-semibold">
              <span>Balance Due</span>
              <span className="font-mono">₹{balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* WHATSAPP NOTICE BANNER */}
        {whatsAppNotice && (
          <div className="bg-bronze-glow/10 border border-bronze-glow/30 rounded-xl p-3.5 text-xs text-cream flex items-start gap-2.5 animate-in fade-in">
            <ExternalLink className="w-4 h-4 text-bronze-glow shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-bronze-glow">WhatsApp Sharing Notice:</span>
              <p className="mt-0.5 text-mist">{whatsAppNotice}</p>
            </div>
          </div>
        )}

        {/* SETTLE PAYMENT SECTION (WHEN BILL IS UNPAID) */}
        {!isPaid && (
          <div className="bg-midnight/80 border border-amber/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> Collect & Settle Payment
              </span>
              <span className="text-xs text-mist font-mono">Due: ₹{balanceDue.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "upi", label: "UPI / QR", icon: <QrCode className="w-4 h-4" /> },
                { id: "cash", label: "Cash", icon: <Banknote className="w-4 h-4" /> },
                { id: "card", label: "Card POS", icon: <CreditCard className="w-4 h-4" /> },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectedPayMode(mode.id as any)}
                  className={clsx(
                    "p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[46px]",
                    selectedPayMode === mode.id
                      ? "bg-bronze-glow text-midnight border-bronze-glow font-bold shadow-sm"
                      : "bg-midnight border-midnight-line text-mist hover:text-cream"
                  )}
                >
                  {mode.icon}
                  <span className="text-xs font-semibold">{mode.label}</span>
                </button>
              ))}
            </div>

            {settleError && (
              <div className="text-xs text-cue-light flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {settleError}
              </div>
            )}

            <Button
              variant="primary-dark"
              size="md"
              onClick={handleSettle}
              disabled={isSettling}
              className="w-full font-bold text-xs bg-baize hover:bg-baize-light text-cream shadow-sm"
            >
              {isSettling ? "Recording Payment..." : `Settle Full Payment (₹${balanceDue.toFixed(2)})`}
            </Button>
          </div>
        )}

        {/* ACTION CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-midnight-line">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Download PDF */}
            <Button
              variant="primary-dark"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isPdfDownloading}
              className="gap-1.5 text-xs font-bold w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              {isPdfDownloading ? "Generating PDF..." : "Download PDF"}
            </Button>

            {/* Share on WhatsApp */}
            <Button
              variant="secondary-dark"
              size="sm"
              onClick={handleShareWhatsApp}
              className="gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 border-emerald-500/30 w-full sm:w-auto"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              Share on WhatsApp
            </Button>

            {/* Print thermal receipt */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs text-mist hover:text-cream border border-midnight-line w-full sm:w-auto"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-mist hover:text-cream border border-midnight-line w-full sm:w-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
