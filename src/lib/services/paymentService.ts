import crypto from "crypto";
import { backendDataStore } from "./dataStore";
import { PaymentRecord, PayMode } from "@/types/database";
import { broadcastEvent } from "./realtimeEmitter";
import { logAuditEvent } from "./auditService";

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || "whsec_cue_nation_mock_test_secret_key";

export function createOnlinePaymentSession(params: {
  bookingId?: string;
  billId?: string;
  amount: number;
  customerName: string;
  customerPhone: string;
}): {
  success: boolean;
  orderId: string;
  paymentUrl: string;
  paymentRecord: PaymentRecord;
} {
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const paymentRecord: PaymentRecord = {
    id: `pay-${Date.now()}`,
    booking_id: params.bookingId || null,
    bill_id: params.billId || null,
    amount: params.amount,
    currency: "INR",
    status: "pending",
    method: "online",
    payment_intent_id: orderId,
    provider_ref: null,
    recorded_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  backendDataStore.payments.unshift(paymentRecord);

  // In production this directs to gateway (Razorpay / Stripe)
  const paymentUrl = `/booking/pay?orderId=${orderId}&amount=${params.amount}`;

  return {
    success: true,
    orderId,
    paymentUrl,
    paymentRecord,
  };
}

/**
 * Verifies webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  try {
    const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Handle incoming payment webhook idempotently
 */
export function handlePaymentWebhook(params: {
  orderId: string;
  providerPaymentId: string;
  status: "success" | "failed";
  amount: number;
}): { success: boolean; message: string } {
  const payment = backendDataStore.payments.find((p) => p.payment_intent_id === params.orderId);
  if (!payment) {
    return { success: false, message: "Payment order not found" };
  }

  // Idempotency: if already paid, do not re-process
  if (payment.status === "paid") {
    return { success: true, message: "Payment already settled" };
  }

  payment.updated_at = new Date().toISOString();
  payment.provider_ref = params.providerPaymentId;

  if (params.status === "success") {
    payment.status = "paid";

    // Update associated booking or bill
    if (payment.booking_id) {
      const booking = backendDataStore.bookings.find((b) => b.id === payment.booking_id);
      if (booking) {
        booking.status = "confirmed";
      }
    }

    if (payment.bill_id) {
      const bill = backendDataStore.bills.find((b) => b.id === payment.bill_id);
      if (bill) {
        bill.paid = true;
        bill.pay_mode = "card";
        bill.paid_at = new Date().toISOString();
      }
    }

    broadcastEvent("PAYMENT_RECORDED", { payment });
    logAuditEvent({
      actorId: "WEBHOOK",
      actorName: "Payment Gateway",
      actorRole: "system",
      action: "ONLINE_PAYMENT_VERIFIED",
      resourceType: "payment",
      resourceId: payment.id,
      details: { orderId: params.orderId, providerRef: params.providerPaymentId, amount: params.amount },
    });

    return { success: true, message: "Payment successfully confirmed" };
  } else {
    payment.status = "failed";
    broadcastEvent("PAYMENT_RECORDED", { payment });
    return { success: true, message: "Payment recorded as failed" };
  }
}

/**
 * Record a Pay-at-Venue transaction by staff
 */
export function recordPayAtVenue(params: {
  billId?: string;
  bookingId?: string;
  amount: number;
  payMode: PayMode;
  staffActor: { id: string; name: string; role: string };
}): { success: boolean; payment?: PaymentRecord; error?: string } {
  // Check if bill already paid
  if (params.billId) {
    const bill = backendDataStore.bills.find((b) => b.id === params.billId);
    if (!bill) return { success: false, error: "Bill not found" };
    if (bill.paid) return { success: false, error: "This bill has already been settled" };

    bill.paid = true;
    bill.pay_mode = params.payMode;
    bill.paid_at = new Date().toISOString();
  }

  const paymentRecord: PaymentRecord = {
    id: `pay-${Date.now()}`,
    booking_id: params.bookingId || null,
    bill_id: params.billId || null,
    amount: params.amount,
    currency: "INR",
    status: "paid",
    method: params.payMode,
    payment_intent_id: null,
    provider_ref: `POS-${params.payMode.toUpperCase()}-${Date.now().toString().slice(-6)}`,
    recorded_by: `${params.staffActor.name} (${params.staffActor.id})`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  backendDataStore.payments.unshift(paymentRecord);

  broadcastEvent("PAYMENT_RECORDED", { payment: paymentRecord });
  logAuditEvent({
    actorId: params.staffActor.id,
    actorName: params.staffActor.name,
    actorRole: params.staffActor.role,
    action: "VENUE_PAYMENT_COLLECTED",
    resourceType: "payment",
    resourceId: paymentRecord.id,
    details: {
      billId: params.billId,
      bookingId: params.bookingId,
      amount: params.amount,
      mode: params.payMode,
    },
  });

  return { success: true, payment: paymentRecord };
}

/**
 * Process a refund (Admin only)
 */
export function processRefund(params: {
  paymentId: string;
  amount: number;
  reason: string;
  adminActor: { id: string; name: string; role: string };
}): { success: boolean; error?: string } {
  const payment = backendDataStore.payments.find((p) => p.id === params.paymentId);
  if (!payment) return { success: false, error: "Payment not found" };
  if (payment.status !== "paid") return { success: false, error: "Can only refund paid transactions" };

  payment.status = "refunded";
  payment.updated_at = new Date().toISOString();

  broadcastEvent("PAYMENT_RECORDED", { payment });
  logAuditEvent({
    actorId: params.adminActor.id,
    actorName: params.adminActor.name,
    actorRole: params.adminActor.role,
    action: "PAYMENT_REFUNDED",
    resourceType: "payment",
    resourceId: payment.id,
    details: { amount: params.amount, reason: params.reason },
  });

  return { success: true };
}
