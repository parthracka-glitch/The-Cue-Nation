import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { PayMode, PaymentRecord } from "@/types/database";
import { broadcastEvent } from "@/lib/services/realtimeEmitter";
import { logAuditEvent } from "@/lib/services/auditService";
import { authenticateRequest } from "@/lib/services/authService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const actor = authenticateRequest(authHeader) || {
    id: "STAFF-CASHIER",
    name: "Cashier Desk",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const { payMode, amountPaid, referenceNumber } = body;

    const bill = backendDataStore.bills.find((b) => b.id === id);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    if (bill.paid) {
      return NextResponse.json({ error: "Bill has already been paid and settled" }, { status: 400 });
    }

    const validModes: PayMode[] = ["cash", "upi", "card"];
    const mode = validModes.includes(payMode) ? payMode : "upi";
    const finalAmount = Number(amountPaid) || bill.total;

    bill.paid = true;
    bill.pay_mode = mode;
    bill.paid_at = new Date().toISOString();

    const paymentId = `pay-${Date.now()}`;
    const paymentRecord: PaymentRecord = {
      id: paymentId,
      booking_id: bill.session_id,
      amount: finalAmount,
      currency: "INR",
      method: mode,
      status: "completed",
      reference: referenceNumber || `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      created_at: bill.paid_at,
    };

    backendDataStore.payments.unshift(paymentRecord);

    broadcastEvent("BILL_PAID", { bill, paymentRecord });
    logAuditEvent({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: "BILL_PAID_AND_SETTLED",
      resourceType: "bill",
      resourceId: id,
      details: {
        amount: finalAmount,
        method: mode,
        paymentId,
        reference: paymentRecord.reference,
      },
    });

    return NextResponse.json({
      success: true,
      bill,
      payment: paymentRecord,
      receipt: {
        billNumber: bill.id,
        paidAt: bill.paid_at,
        timeCharge: bill.time_charge,
        foodCharge: bill.food_charge,
        total: bill.total,
        amountPaid: finalAmount,
        mode,
        reference: paymentRecord.reference,
        settledBy: actor.name,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing bill payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
