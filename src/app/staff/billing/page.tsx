"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { venueStore } from "@/lib/store/venueStore";
import { Bill } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDateTimeIST } from "@/lib/time";
import Link from "next/link";
import clsx from "clsx";
import {
  Receipt,
  CheckCircle2,
  Clock,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { StaffNav } from "@/components/staff/StaffNav";

function StaffBillingContent() {
  const searchParams = useSearchParams();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayMode, setSelectedPayMode] = useState<"cash" | "upi" | "card">("upi");
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const reload = () => {
    const list = venueStore.getBills();
    setBills(list);

    const initialBillId = searchParams.get("billId");
    if (initialBillId) {
      const match = list.find((b) => b.id === initialBillId);
      if (match) {
        setSelectedBill(match);
        if (!match.paid) setPaymentModalOpen(true);
      }
    }
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, [searchParams]);

  const handleSettlePayment = () => {
    if (!selectedBill) return;
    venueStore.markBillPaid(selectedBill.id, selectedPayMode);
    setPaymentModalOpen(false);
    setReceiptModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
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
                  POINT OF SALE (POS) BILLING
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Settled & Open Bills
              </h1>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={reload}
            className="text-mist hover:text-cream border border-midnight-line self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Bills Table */}
        <div className="bg-midnight-card rounded-2xl border border-midnight-line overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-mist">
              <thead className="bg-midnight text-xs uppercase font-bold text-mist border-b border-midnight-line">
                <tr>
                  <th className="py-4 px-6">Bill ID</th>
                  <th className="py-4 px-6">Time Charge</th>
                  <th className="py-4 px-6">Food & Café</th>
                  <th className="py-4 px-6">Grand Total</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-line">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-midnight/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-cream font-bold">
                      #{bill.id}
                    </td>
                    <td className="py-4 px-6 text-cream font-semibold tabular-nums">
                      ₹{bill.time_charge}
                    </td>
                    <td className="py-4 px-6 text-cream font-semibold tabular-nums">
                      ₹{bill.food_charge}
                    </td>
                    <td className="py-4 px-6 font-display text-lg font-bold text-bronze-glow tabular-nums">
                      ₹{bill.total}
                    </td>
                    <td className="py-4 px-6">
                      {bill.paid ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-baize-light/15 text-baize-light border border-baize-light/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Paid via {bill.pay_mode?.toUpperCase()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber/20 text-amber border border-amber/40 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          Payment Due
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {!bill.paid ? (
                        <Button
                          variant="primary-dark"
                          size="sm"
                          onClick={() => {
                            setSelectedBill(bill);
                            setPaymentModalOpen(true);
                          }}
                          className="text-xs font-bold"
                        >
                          Collect Payment
                        </Button>
                      ) : (
                        <Button
                          variant="secondary-dark"
                          size="sm"
                          onClick={() => {
                            setSelectedBill(bill);
                            setReceiptModalOpen(true);
                          }}
                          className="text-xs gap-1"
                        >
                          <Printer className="w-3 h-3" /> Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAYMENT SETTLEMENT MODAL */}
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title={`Settle Bill #${selectedBill?.id}`}
          description="Select payment mode to record transaction."
          isDark
        >
          <div className="space-y-6 pt-2">
            <div className="bg-midnight p-4 rounded-xl border border-midnight-line space-y-2 text-xs">
              <div className="flex justify-between text-mist">
                <span>Table Time Charge</span>
                <span className="text-cream font-bold">₹{selectedBill?.time_charge}</span>
              </div>
              <div className="flex justify-between text-mist">
                <span>Café & Kitchen Charge</span>
                <span className="text-cream font-bold">₹{selectedBill?.food_charge}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-cream border-t border-midnight-line pt-2">
                <span>Total Amount Due</span>
                <span className="text-bronze-glow font-display text-xl tabular-nums">
                  ₹{selectedBill?.total}
                </span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-mist tracking-wider">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { id: "upi", label: "UPI / QR", icon: <QrCode className="w-4 h-4" /> },
                  { id: "cash", label: "Cash", icon: <Banknote className="w-4 h-4" /> },
                  { id: "card", label: "Card POS", icon: <CreditCard className="w-4 h-4" /> },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedPayMode(mode.id as any)}
                    className={clsx(
                      "p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 touch-manipulation min-h-[48px]",
                      selectedPayMode === mode.id
                        ? "bg-bronze-glow text-midnight border-bronze-glow font-bold shadow-sm"
                        : "bg-midnight border-midnight-line text-mist hover:text-cream"
                    )}
                  >
                    {mode.icon}
                    <span className="text-[11px] sm:text-xs font-semibold">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="primary-dark"
                size="md"
                onClick={handleSettlePayment}
                className="w-full text-xs font-bold"
              >
                Mark as Paid (₹{selectedBill?.total})
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setPaymentModalOpen(false)}
                className="text-mist"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* THERMAL PRINTABLE RECEIPT MODAL */}
        <Modal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          title="Tax Receipt"
          description="Thermal printer compliant format."
          isDark
        >
          <div className="space-y-6 pt-2">
            {/* The printable paper thermal card */}
            <div className="bg-white text-black p-6 rounded-xl font-mono text-xs space-y-4 shadow-md border border-neutral-300">
              <div className="text-center space-y-1 border-b border-dashed border-neutral-400 pb-3">
                <div className="font-bold text-base tracking-widest uppercase">
                  CUE NATION
                </div>
                <div className="text-[11px] text-neutral-600">PARLOUR & LOUNGE</div>
                <div className="text-[10px] text-neutral-500">
                  Koramangala, Bengaluru · +91 98765 43210
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>RECEIPT: #{selectedBill?.id}</span>
                  <span>{formatDateTimeIST(new Date())}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAY MODE:</span>
                  <span className="font-bold uppercase">{selectedBill?.pay_mode || "PAID"}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-neutral-400 py-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Table Time Play</span>
                  <span>₹{selectedBill?.time_charge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Café & Roastery</span>
                  <span>₹{selectedBill?.food_charge.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold pt-1">
                <span>TOTAL PAID</span>
                <span>₹{selectedBill?.total.toFixed(2)}</span>
              </div>

              <div className="text-center text-[10px] text-neutral-500 pt-3 border-t border-dashed border-neutral-400">
                Thank you for playing at Cue Nation!<br />
                &quot;Own the Table.&quot;
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary-dark"
                size="md"
                onClick={handlePrint}
                className="w-full gap-2 text-xs font-bold"
              >
                <Printer className="w-4 h-4 text-midnight" /> Print Thermal Receipt
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setReceiptModalOpen(false)}
                className="text-mist"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
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
