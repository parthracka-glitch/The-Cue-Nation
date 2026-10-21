import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { authenticateRequest } from "@/lib/services/authService";
import { broadcastEvent } from "@/lib/services/realtimeEmitter";
import { logAuditEvent } from "@/lib/services/auditService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const paid = searchParams.get("paid");

  let list = [...backendDataStore.bills];

  if (sessionId) {
    list = list.filter((b) => b.session_id === sessionId);
  }
  if (paid !== null && paid !== undefined) {
    list = list.filter((b) => String(b.paid) === paid);
  }

  // Populate session & table
  const populated = list.map((bill) => {
    const session = backendDataStore.sessions.find((s) => s.id === bill.session_id);
    const table = session ? backendDataStore.tables.find((t) => t.id === session.table_id) : undefined;
    const booking = session ? backendDataStore.bookings.find((b) => b.id === session.booking_id) : undefined;
    return {
      ...bill,
      session,
      table,
      booking,
    };
  });

  return NextResponse.json({ bills: populated });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const actor = authenticateRequest(authHeader) || {
    id: "STAFF-CASHIER",
    name: "Cashier Desk",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const id = searchParams.get("billId") || body.billId || body.id;
    const { payMode, amountPaid, referenceNumber } = body;

    const bill = backendDataStore.bills.find((b) => b.id === id);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    if (bill.paid) {
      return NextResponse.json({ error: "Bill has already been paid and settled" }, { status: 400 });
    }

    const mode = (payMode === "cash" || payMode === "card") ? payMode : "upi";
    const finalAmount = Number(amountPaid) || bill.total;

    bill.paid = true;
    bill.pay_mode = mode;
    bill.paid_at = new Date().toISOString();

    const paymentId = `pay-${Date.now()}`;
    const paymentRecord = {
      id: paymentId,
      booking_id: bill.session_id,
      amount: finalAmount,
      currency: "INR",
      method: mode,
      status: "completed" as const,
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
