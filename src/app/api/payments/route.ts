import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import {
  createOnlinePaymentSession,
  recordPayAtVenue,
  processRefund,
} from "@/lib/services/paymentService";
import { authenticateRequest } from "@/lib/services/authService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  const billId = searchParams.get("billId");

  let list = [...backendDataStore.payments];
  if (bookingId) {
    list = list.filter((p) => p.booking_id === bookingId);
  }
  if (billId) {
    list = list.filter((p) => p.bill_id === billId);
  }

  return NextResponse.json({ payments: list });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader) || {
    id: "STAFF-FLOOR",
    name: "Floor Staff",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const { action, bookingId, billId, amount, payMode, customerName, customerPhone, paymentId, reason } = body;

    // Refund action (Admin only)
    if (action === "refund") {
      if (user.role !== "owner" && user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
      }
      const refundResult = processRefund({
        paymentId,
        amount: Number(amount),
        reason: reason || "Customer request",
        adminActor: user,
      });
      if (!refundResult.success) {
        return NextResponse.json({ error: refundResult.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Payment refunded" });
    }

    // Pay-at-venue recording
    if (action === "pay_at_venue") {
      const result = recordPayAtVenue({
        billId,
        bookingId,
        amount: Number(amount),
        payMode: payMode || "cash",
        staffActor: user,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result, { status: 201 });
    }

    // Online payment session creation
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    const onlineSession = createOnlinePaymentSession({
      bookingId,
      billId,
      amount: numAmount,
      customerName: customerName || "Player",
      customerPhone: customerPhone || "",
    });

    return NextResponse.json(onlineSession, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment operation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
